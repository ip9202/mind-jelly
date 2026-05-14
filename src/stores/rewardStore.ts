/**
 * rewardStore.ts
 *
 * TDD GREEN phase: 보상 상태 관리 Zustand store
 * localStorage 영속화 지원
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { canShowRewardedAd as adFrequencyCanShow } from '@/lib/ad/adFrequencyControl';

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
  unlockSkin: (skinId: SkinId) => void;
  checkSkinExpiration: () => void;
  incrementRewardedAdCount: () => void;
  toggleSkinEnabled: () => void;
  hydrate: () => void;
  reset?: () => void; // 테스트용 초기화
}

// 스킨 ID 타입
export type SkinId = 'bear' | 'cat' | 'panda' | 'rabbit' | 'fox' | 'unicorn' | 'dolphin' | 'butterfly' | 'dragon' | 'phoenix';

/**
 * rewardStore - 보상 상태 관리
 *
 * @MX:NOTE 보상 이력과 스킨 상태를 localStorage에 영속화
 * @MX:WARN localStorage 실패 시 silent fallback (사용자 경험 방지)
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
          id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        set((state) => ({
          ...state,
          rewardsHistory: [...state.rewardsHistory, newReward],
        }));

        return newReward;
      },

      /**
       * 스킨 해금
       */
      unlockSkin: (skinId: SkinId) => {
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

        const skin = SKINS[skinId];
        if (!skin) return;

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        set((state) => ({
          ...state,
          activeSkin: {
            ...skin,
            expiresAt,
          },
          unlockedSkins: [...new Set([...state.unlockedSkins, skinId])],
        }));
      },

      /**
       * 활성 스킨 제거
       */
      clearActiveSkin: () => {
        set((state) => ({
          ...state,
          activeSkin: null,
        }));
      },

      /**
       * 활성 스킨 설정
       */
      setActiveSkin: (skin: ActiveSkin) => {
        set((state) => ({
          ...state,
          activeSkin: skin,
        }));
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
       * @MX:NOTE 테스트 간 상태 공유 방지
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
       * 스킨 적용 토글
       */
      toggleSkinEnabled: () => {
        set((state) => ({
          ...state,
          skinEnabled: !state.skinEnabled,
        }));
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
 * @MX:NOTE SPEC-AD-003의 보상형 광고 전용 빈도 제어 (일일 3회, 세션 1회)
 */
export const canShowRewardedAd = (): boolean => {
  return adFrequencyCanShow();
};

/**
 * 테스트용 store 초기화
 * @MX:NOTE 테스트 간 상태 공유 방지
 */
export const resetRewardStore = (): void => {
  const { reset } = rewardStore.getState();
  if (reset) {
    reset();
  }
};
