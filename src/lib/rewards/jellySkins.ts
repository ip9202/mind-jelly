/**
 * jellySkins.ts
 *
 * TDD GREEN phase: 한정판 젤리 스킨 관리
 * 24시간 한정 스킨 해금 및 타이머 시스템
 */

import { rewardStore, resetRewardStore, type ActiveSkin } from '@/stores/rewardStore';

// 스킨 등급
export type SkinTier = 'rare' | 'epic' | 'legendary';

// 스킨 데이터
export interface JellySkin {
  id: string;
  name: string;
  tier: SkinTier;
  emoji: string;
  expiresAt: string; // ISO 8601 timestamp
}

// 스킨 테마
export interface SkinTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

// 전체 스킨 목록
const ALL_SKINS: Omit<JellySkin, 'expiresAt'>[] = [
  // Rare (파란색 계열)
  { id: 'bear', name: '곰돌이', tier: 'rare', emoji: '🐻' },
  { id: 'cat', name: '고양이', tier: 'rare', emoji: '🐱' },
  { id: 'panda', name: '판다', tier: 'rare', emoji: '🐼' },
  { id: 'rabbit', name: '토끼', tier: 'rare', emoji: '🐰' },
  { id: 'fox', name: '여우', tier: 'rare', emoji: '🦊' },

  // Epic (보라색 계열)
  { id: 'unicorn', name: '유니콘', tier: 'epic', emoji: '🦄' },
  { id: 'dolphin', name: '돌고래', tier: 'epic', emoji: '🐬' },
  { id: 'butterfly', name: '나비', tier: 'epic', emoji: '🦋' },

  // Legendary (금색 계열)
  { id: 'dragon', name: '드래곤', tier: 'legendary', emoji: '🐉' },
  { id: 'phoenix', name: '피닉스', tier: 'legendary', emoji: '🔥' },
];

// 스킨별 색상 테마
export const SKIN_THEMES: Record<string, SkinTheme> = {
  // Rare 테마 (파란색)
  bear: { primaryColor: '#3B82F6', accentColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  cat: { primaryColor: '#3B82F6', accentColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  panda: { primaryColor: '#3B82F6', accentColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  rabbit: { primaryColor: '#3B82F6', accentColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  fox: { primaryColor: '#3B82F6', accentColor: '#60A5FA', backgroundColor: '#EFF6FF' },

  // Epic 테마 (보라색)
  unicorn: { primaryColor: '#8B5CF6', accentColor: '#A78BFA', backgroundColor: '#F5F3FF' },
  dolphin: { primaryColor: '#8B5CF6', accentColor: '#A78BFA', backgroundColor: '#F5F3FF' },
  butterfly: { primaryColor: '#8B5CF6', accentColor: '#A78BFA', backgroundColor: '#F5F3FF' },

  // Legendary 테마 (금색)
  dragon: { primaryColor: '#F59E0B', accentColor: '#FBBF24', backgroundColor: '#FFFBEB' },
  phoenix: { primaryColor: '#F59E0B', accentColor: '#FBBF24', backgroundColor: '#FFFBEB' },
};

/**
 * jellySkins - 한정판 젤리 스킨 관리
 *
 * @MX:NOTE 24시간 타이머 기반 한정 스킨 시스템
 * @MX:WARN 스킨 만료 후 자동 제거되며 복구 불가
 */
export const jellySkins = {
  /**
   * 전체 스킨 목록 반환
   */
  getAllSkins: (): Omit<JellySkin, 'expiresAt'>[] => {
    return [...ALL_SKINS];
  },

  /**
   * 랜덤 스킨 해금
   * @param tier - 스킨 등급 (rare, epic, legendary)
   * @returns 해금된 스킨 (모두 해금됨 null)
   */
  unlockRandomSkin: (tier: SkinTier): JellySkin | null => {
    const state = rewardStore.getState();
    const unlocked = new Set(state.unlockedSkins);

    // 해당 등급의 스킨 중 아직 해금되지 않은 스킨 필터링
    const available = ALL_SKINS.filter(
      (skin) => skin.tier === tier && !unlocked.has(skin.id)
    );

    // 모두 해금됨
    if (available.length === 0) {
      return null;
    }

    // 랜덤 선택
    const selected = available[Math.floor(Math.random() * available.length)];
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const unlockedSkin: JellySkin = {
      ...selected,
      expiresAt,
    };

    // store 업데이트
    console.log('[unlockRandomSkin] selected.id:', selected.id, 'before:', state.unlockedSkins);

    // rewardStore의 unlockSkin action 직접 호출
    const store = rewardStore.getState() as unknown as { unlockSkin: (skinId: string) => void };
    store.unlockSkin(selected.id);

    console.log('[unlockRandomSkin] after:', rewardStore.getState().unlockedSkins);

    return unlockedSkin;
  },

  /**
   * 현재 활성 스킨 조회
   */
  getActiveSkin: (): JellySkin | null => {
    const state = rewardStore.getState() as unknown as { activeSkin: ActiveSkin | null };
    if (!state.activeSkin) {
      return null;
    }

    // 스킨 ID로 tier 조회
    const skinData = ALL_SKINS.find((s) => s.id === state.activeSkin!.id);
    const tier = skinData?.tier || 'rare';

    return {
      id: state.activeSkin.id,
      name: state.activeSkin.name,
      tier,
      emoji: state.activeSkin.emoji,
      expiresAt: state.activeSkin.expiresAt,
    };
  },

  /**
   * 스킨 만료 여부 확인
   */
  isSkinExpired: (skin: JellySkin): boolean => {
    const now = Date.now();
    const expiresAt = new Date(skin.expiresAt).getTime();
    return now >= expiresAt;
  },

  /**
   * 활성 스킨 설정
   * @MX:NOTE unlockSkin에서 자동 설정됨
   */
  setActiveSkin: (skin: JellySkin): void => {
    const state = rewardStore.getState() as unknown as { setActiveSkin: (skin: ActiveSkin) => void };
    state.setActiveSkin(skin as ActiveSkin);
  },

  /**
   * 활성 스킨 제거
   */
  clearActiveSkin: (): void => {
    const state = rewardStore.getState() as unknown as { clearActiveSkin: () => void };
    state.clearActiveSkin();
  },

  /**
   * 스킨별 색상 테마 반환
   */
  getSkinTheme: (skinId: string): SkinTheme => {
    return SKIN_THEMES[skinId] || SKIN_THEMES['bear']; // 기본값
  },

  /**
   * rewardStore 접근
   */
  getStore: () => {
    return rewardStore.getState();
  },

  /**
   * 테스트용 store 초기화
   * @MX:NOTE 테스트 간 상태 공유 방지
   */
  resetStore: (): void => {
    resetRewardStore();
  },
};
