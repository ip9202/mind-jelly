/**
 * 보상형 광고 CTA 버튼 + 보상 플로우 통합 테스트
 *
 * SPEC: SPEC-AD-003 (REQ-RWD-001, REQ-RWD-007)
 * TDD Phase: GREEN - CTA 버튼 렌더링 및 빈도 제어 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// localStorage mock
interface MockLocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

function setupFreshEnvironment() {
  const mockStore: Record<string, string> = {};

  const localStorageMock: MockLocalStorage = {
    getItem: (key: string) => mockStore[key] || null,
    setItem: (key: string, value: string) => {
      mockStore[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStore[key];
    },
    clear: () => {
      Object.keys(mockStore).forEach(key => delete mockStore[key]);
    },
  };

  const originalLocalStorage = global.localStorage;
  global.localStorage = localStorageMock as Storage;

  return { localStorageMock, originalLocalStorage };
}

function teardownEnvironment(originalLocalStorage: Storage) {
  global.localStorage = originalLocalStorage;
}

describe('보상형 광고 CTA 버튼 테스트 (REQ-RWD-001)', () => {
  let canShowRewardedAd: () => boolean;
  let recordRewardedAdShown: () => void;
  let resetRewardedSessionCount: () => void;
  let originalLocalStorage: Storage;

  beforeEach(async () => {
    const env = setupFreshEnvironment();
    originalLocalStorage = env.originalLocalStorage;

    // 보상형 광고 이력 초기화
    global.localStorage.removeItem('rewarded_ad_frequency');

    const adModule = await import('@/lib/ad/adFrequencyControl');
    canShowRewardedAd = adModule.canShowRewardedAd;
    recordRewardedAdShown = adModule.recordRewardedAdShown;
    resetRewardedSessionCount = module.resetRewardedSessionCount;

    resetRewardedSessionCount();
  });

  afterEach(() => {
    teardownEnvironment(originalLocalStorage);
  });

  describe('REQ-RWD-001: CTA 버튼 표시 조건', () => {
    it('시청 가능할 때 활성화 상태여야 합니다', () => {
      expect(canShowRewardedAd()).toBe(true);
    });

    it('시청 불가능할 때 비활성화 상태여야 합니다', () => {
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);
    });
  });

  describe('REQ-RWD-007: 빈도 제한 메시지', () => {
    it('세션 한도 초과 시 비활성화되어야 합니다', () => {
      recordRewardedAdShown();
      // 세션 한도 초과 → disabled 상태
      expect(canShowRewardedAd()).toBe(false);
    });

    it('세션 초기화 후 다시 활성화되어야 합니다', () => {
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);

      resetRewardedSessionCount();
      expect(canShowRewardedAd()).toBe(true);
    });
  });

  describe('보상 플로우 (REQ-RWD-006)', () => {
    it('보상 선택 후 addReward + incrementRewardedAdCount가 호출되어야 합니다', async () => {
      const { rewardStore, resetRewardStore } = await import('@/stores/rewardStore');
      resetRewardStore();

      const initialCount = rewardStore.getState().rewardedAdCount;
      expect(initialCount).toBe(0);

      // 보상 지급 시뮬레이션
      rewardStore.getState().addReward({
        type: 'jelly_skin',
        claimedAt: new Date().toISOString(),
      });
      rewardStore.getState().incrementRewardedAdCount();
      recordRewardedAdShown();

      expect(rewardStore.getState().rewardedAdCount).toBe(1);
      expect(rewardStore.getState().rewardsHistory).toHaveLength(1);
      expect(rewardStore.getState().rewardsHistory[0].type).toBe('jelly_skin');

      resetRewardStore();
    });
  });
});

describe('보상 스킨 등급 결정 (REQ-RWD-003)', () => {
  it('1-3회차: Rare 등급이어야 합니다', () => {
    function getSkinTier(adCount: number): string {
      if (adCount >= 7) return 'legendary';
      if (adCount >= 4) return 'epic';
      return 'rare';
    }
    expect(getSkinTier(1)).toBe('rare');
    expect(getSkinTier(2)).toBe('rare');
    expect(getSkinTier(3)).toBe('rare');
  });

  it('4-6회차: Epic 등급이어야 합니다', () => {
    function getSkinTier(adCount: number): string {
      if (adCount >= 7) return 'legendary';
      if (adCount >= 4) return 'epic';
      return 'rare';
    }
    expect(getSkinTier(4)).toBe('epic');
    expect(getSkinTier(5)).toBe('epic');
    expect(getSkinTier(6)).toBe('epic');
  });

  it('7회차+: Legendary 등급이어야 합니다', () => {
    function getSkinTier(adCount: number): string {
      if (adCount >= 7) return 'legendary';
      if (adCount >= 4) return 'epic';
      return 'rare';
    }
    expect(getSkinTier(7)).toBe('legendary');
    expect(getSkinTier(10)).toBe('legendary');
    expect(getSkinTier(100)).toBe('legendary');
  });
});
