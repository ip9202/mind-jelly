/**
 * rewardStore.ts
 *
 * @MX:NOTE: [AUTO] SPEC-SYNC-001 M5 - 보상 상태 관리 Zustand store + Supabase write-through
 * localStorage 영속화 + Supabase 원격 동기화
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { canShowRewardedAd as adFrequencyCanShow } from '@/lib/ad/adFrequencyControl';
import * as db from '@/lib/supabase/db';
import { createSyncQueue } from '@/lib/supabase/sync';

// ── DB 의존성 주입 (테스트에서 교체 가능) ─────────────────────────

// @MX:ANCHOR: [AUTO] DB 함수 래퍼 - 테스트에서 교체 가능한 간접 참조
// @MX:REASON: ES 모듈의 getter-only 바인딩으로 인해 jest.mock 팩토리가
// @MX:REASON: db.loadUserSkins 등을 직접 교체할 수 없어 간접 래퍼 사용
const dbFns = {
  loadUserSkins: db.loadUserSkins,
  upsertUserSkins: db.upsertUserSkins,
  incrementRewardedAdAndUnlock: db.incrementRewardedAdAndUnlock,
};

/**
 * 테스트용 DB 함수 주입
 * @MX:NOTE: [AUTO] 테스트에서만 사용 - 프로덕션에서는 호출하지 않음
 */
export function _setDbFns(fns: Partial<typeof dbFns>): void {
  Object.assign(dbFns, fns);
}

// 보상 유형
export type RewardType = 'weekly_report' | 'emotion_keywords' | 'jelly_skin';

// 보상 이력 항목
export interface RewardRecord {
  id: string;
  type: RewardType;
  claimedAt: string; // ISO 8601 timestamp
}

// 활성 스킨
export interface ActiveSkin {
  id: string;
  name: string;
  emoji: string;
  expiresAt: string; // ISO 8601 timestamp
}

// Reward State
export interface RewardState {
  rewardsHistory: RewardRecord[];
  activeSkin: ActiveSkin | null;
  unlockedSkins: string[]; // 스킨 ID 목록
  rewardedAdCount: number;
  skinEnabled: boolean; // 스킨 적용 토글 (해제해도 타이머 유지)
  addReward: (reward: Omit<RewardRecord, 'id'>) => RewardRecord;
  unlockSkin: (skinId: SkinId) => Promise<void>;
  checkSkinExpiration: () => void;
  incrementRewardedAdCount: () => void;
  toggleSkinEnabled: () => void;
  setActiveSkin: (skin: ActiveSkin) => void;
  hydrate: () => void;
  hydrateFromSupabase: () => Promise<void>;
  reset?: () => void; // 테스트용 초기화
}

// 스킨 ID 타입
export type SkinId = 'bear' | 'cat' | 'panda' | 'rabbit' | 'fox' | 'unicorn' | 'dolphin' | 'butterfly' | 'dragon' | 'phoenix';

// ── Supabase write-through 모듈 상태 ─────────────────────────

let syncUserId: string | null = null;
let syncQueue: ReturnType<typeof createSyncQueue> | null = null;

// @MX:WARN: [AUTO] 디바운스 타이머 - destroyRewardSync에서 반드시 해제 필요
// @MX:REASON: 타이머 해제 누락 시 테스트 환경에서 타이머 누적
let skinEnabledDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let activeSkinDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 2000;

/**
 * Supabase write-through 초기화
 * @MX:NOTE: [AUTO] 앱 시작 시 또는 로그인 후 호출하여 Supabase 동기화 활성화
 */
export function initRewardSync(userId: string): void {
  syncUserId = userId;
  syncQueue = createSyncQueue();
}

/**
 * Supabase write-through 정리
 * @MX:NOTE: [AUTO] 로그아웃 시 또는 테스트 종료 시 호출
 */
export function destroyRewardSync(): void {
  syncUserId = null;
  if (skinEnabledDebounceTimer !== null) {
    clearTimeout(skinEnabledDebounceTimer);
    skinEnabledDebounceTimer = null;
  }
  if (activeSkinDebounceTimer !== null) {
    clearTimeout(activeSkinDebounceTimer);
    activeSkinDebounceTimer = null;
  }
  if (syncQueue) {
    syncQueue.destroy();
    syncQueue = null;
  }
}

/**
 * 디바운스된 upsertUserSkins 호출
 * @MX:NOTE: [AUTO] 타이머 만료 시 최신 스토어 상태를 읽어 upsert (클로저 캡처 방지)
 */
function debouncedUpsert(
  patchBuilder: () => Record<string, unknown>,
  timerRef: 'skinEnabled' | 'activeSkin'
): void {
  if (!syncUserId) return;

  const clearTimer = (ref: 'skinEnabled' | 'activeSkin') => {
    if (ref === 'skinEnabled' && skinEnabledDebounceTimer !== null) {
      clearTimeout(skinEnabledDebounceTimer);
      skinEnabledDebounceTimer = null;
    }
    if (ref === 'activeSkin' && activeSkinDebounceTimer !== null) {
      clearTimeout(activeSkinDebounceTimer);
      activeSkinDebounceTimer = null;
    }
  };

  clearTimer(timerRef);

  const timer = setTimeout(async () => {
    const uid = syncUserId;
    if (!uid) return;

    try {
      const patch = patchBuilder();
      await dbFns.upsertUserSkins(uid, patch);
    } catch {
      // Supabase 실패 시 silent fallback (오프라인 복원력)
    }

    clearTimer(timerRef);
  }, DEBOUNCE_MS);

  if (timerRef === 'skinEnabled') {
    skinEnabledDebounceTimer = timer;
  } else {
    activeSkinDebounceTimer = timer;
  }
}

// ── 스킨 메타데이터 ─────────────────────────

const SKINS: Record<SkinId, { id: SkinId; name: string; emoji: string }> = {
  bear: { id: 'bear', name: '곰돌이', emoji: '🐻' },
  cat: { id: 'cat', name: '고양이', emoji: '🐱' },
  panda: { id: 'panda', name: '판다', emoji: '🐼' },
  rabbit: { id: 'rabbit', name: '토끼', emoji: '🐰' },
  fox: { id: 'fox', name: '여우', emoji: '🦊' },
  unicorn: { id: 'unicorn', name: '유니콘', emoji: '🦄' },
  dolphin: { id: 'dolphin', name: '돌고래', emoji: '🐬' },
  butterfly: { id: 'butterfly', name: '나비', emoji: '🦋' },
  dragon: { id: 'dragon', name: '드래곤', emoji: '🐉' },
  phoenix: { id: 'phoenix', name: '피닉스', emoji: '🔥' },
};

/**
 * rewardStore - 보상 상태 관리
 *
 * @MX:NOTE: [AUTO] 보상 이력과 스킨 상태를 localStorage에 영속화 + Supabase write-through
 * @MX:WARN: [AUTO] localStorage 실패 시 silent fallback (사용자 경험 방지)
 */
export const rewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      rewardsHistory: [] as RewardRecord[],
      activeSkin: null as ActiveSkin | null,
      unlockedSkins: [] as string[],
      rewardedAdCount: 0,
      skinEnabled: true,

      /**
       * 보상 추가
       */
      addReward: (reward: Omit<RewardRecord, 'id'>) => {
        const newReward: RewardRecord = {
          ...reward,
          id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        };

        set((state) => ({
          ...state,
          rewardsHistory: [...state.rewardsHistory, newReward],
        }));

        return newReward;
      },

      /**
       * 스킨 해금 - incrementRewardedAdAndUnlock RPC 호출
       * @MX:NOTE: [AUTO] SPEC-SYNC-001 REQ-SYNC-005 - 원자적 RPC로 unlockedSkins + rewardedAdCount 동시 업데이트
       */
      unlockSkin: async (skinId: SkinId) => {
        const skin = SKINS[skinId];
        if (!skin) return;

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // 낙관적 로컬 업데이트
        set((state) => ({
          ...state,
          activeSkin: {
            ...skin,
            expiresAt,
          },
          unlockedSkins: [...new Set([...state.unlockedSkins, skinId])],
        }));

        // Supabase RPC 호출
        if (syncUserId) {
          try {
            const result = await dbFns.incrementRewardedAdAndUnlock(syncUserId, skinId);
            // RPC 결과로 로컬 상태 동기화 (서버가 source of truth)
            set((state) => ({
              ...state,
              unlockedSkins: result.unlockedSkins,
              rewardedAdCount: result.rewardedAdCount,
            }));
          } catch {
            // RPC 실패 시 로컬 상태는 유지 (낙관적 업데이트)
          }
        }
      },

      /**
       * 활성 스킨 설정 - 2초 디바운스로 Supabase 동기화
       * @MX:NOTE: [AUTO] SPEC-SYNC-001 REQ-SYNC-005 - activeSkin 변경 시 upsertUserSkins 호출
       */
      setActiveSkin: (skin: ActiveSkin) => {
        set((state) => ({
          ...state,
          activeSkin: skin,
        }));

        debouncedUpsert(() => ({ activeSkin: get().activeSkin?.id ?? null }), 'activeSkin');
      },

      /**
       * 스킨 만료 확인
       */
      checkSkinExpiration: () => {
        const { activeSkin } = get();
        if (!activeSkin) return;

        const now = Date.now();
        const expiresAt = new Date(activeSkin.expiresAt).getTime();

        if (now >= expiresAt) {
          set((state) => ({
            ...state,
            activeSkin: null,
          }));
        }
      },

      /**
       * 테스트용 초기화
       * @MX:NOTE: [AUTO] 테스트 간 상태 공유 방지
       */
      reset: () => {
        set(() => ({
          rewardsHistory: [],
          activeSkin: null,
          unlockedSkins: [],
          rewardedAdCount: 0,
          skinEnabled: true,
        }));
      },

      /**
       * 보상형 광고 카운터 증가
       */
      incrementRewardedAdCount: () => {
        set((state) => ({
          ...state,
          rewardedAdCount: state.rewardedAdCount + 1,
        }));
      },

      /**
       * 스킨 적용 토글 - 2초 디바운스로 Supabase 동기화
       * @MX:NOTE: [AUTO] SPEC-SYNC-001 REQ-SYNC-005 - skinEnabled 변경 시 upsertUserSkins 호출
       */
      toggleSkinEnabled: () => {
        set((state) => ({
          ...state,
          skinEnabled: !state.skinEnabled,
        }));

        debouncedUpsert(() => ({ skinEnabled: get().skinEnabled }), 'skinEnabled');
      },

      /**
       * localStorage hydration (초기화 시 호출)
       */
      hydrate: () => {
        const stored = localStorage.getItem('reward-storage');
        if (!stored) return;

        try {
          const parsed = JSON.parse(stored) as RewardState;
          set(parsed);
        } catch (error) {
          console.error('Failed to hydrate rewardStore:', error);
        }
      },

      /**
       * Supabase에서 스킨 상태 로드
       * @MX:NOTE: [AUTO] SPEC-SYNC-001 REQ-SYNC-005 - Supabase 우선, 실패 시 localStorage 폴백
       */
      hydrateFromSupabase: async () => {
        if (!syncUserId) return;

        try {
          const data = await dbFns.loadUserSkins(syncUserId);
          if (!data) return;

          set((state) => ({
            ...state,
            unlockedSkins: data.unlockedSkins,
            rewardedAdCount: data.rewardedAdCount,
            skinEnabled: data.skinEnabled,
          }));
        } catch {
          // Supabase 실패 시 localStorage 캐시로 폴백 (zustand persist가 처리)
        }
      },
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rewardsHistory: state.rewardsHistory,
        activeSkin: state.activeSkin,
        unlockedSkins: state.unlockedSkins,
        rewardedAdCount: state.rewardedAdCount,
        skinEnabled: state.skinEnabled,
      }),
    }
  )
);

/**
 * 보상형 광고 빈도 제어
 *
 * @MX:NOTE: [AUTO] SPEC-AD-003의 보상형 광고 전용 빈도 제어 (일일 3회, 세션 1회)
 */
export const canShowRewardedAd = (): boolean => {
  return adFrequencyCanShow();
};

/**
 * 테스트용 store 초기화
 * @MX:NOTE: [AUTO] 테스트 간 상태 공유 방지
 */
export const resetRewardStore = (): void => {
  const { reset } = rewardStore.getState();
  if (reset) {
    reset();
  }
};
