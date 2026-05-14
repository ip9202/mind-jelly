/**
 * 보상형 광고 빈도 제어 테스트
 *
 * SPEC: SPEC-AD-003 (REQ-RWD-007)
 * TDD Phase: RED - 보상형 광고 일일/세션 한도 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// localStorage mock 타입 정의
interface MockLocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

// 완전한 모듈 격리를 위한 헬퍼 함수
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

describe('보상형 광고 빈도 제어 (canShowRewardedAd)', () => {
  let canShowRewardedAd: () => boolean;
  let recordRewardedAdShown: () => void;
  let resetRewardedSessionCount: () => void;
  let originalLocalStorage: Storage;

  beforeEach(async () => {
    // localStorage를 새 mock으로 교체
    const env = setupFreshEnvironment();
    originalLocalStorage = env.originalLocalStorage;

    // 보상형 광고 이력 키 명시적 제거 (파일 간 상태 오염 방지)
    global.localStorage.removeItem('rewarded_ad_frequency');

    const module = await import('../adFrequencyControl');
    canShowRewardedAd = module.canShowRewardedAd;
    recordRewardedAdShown = module.recordRewardedAdShown;
    resetRewardedSessionCount = module.resetRewardedSessionCount;

    // 세션 카운터 초기화 (모듈 레벨 변수)
    resetRewardedSessionCount();
  });

  afterEach(() => {
    teardownEnvironment(originalLocalStorage);
  });

  describe('일일 한도 (하루 최대 3회)', () => {
    it('초기 상태에서는 보상형 광고 시청 가능해야 합니다', () => {
      expect(canShowRewardedAd()).toBe(true);
    });

    it('1회 시청 후 세션 한도로 차단되어야 합니다', () => {
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);
    });

    it('일일 한도는 3회까지 허용하지만 세션 한도가 우선됩니다', () => {
      // 세션 한도 1회가 먼저 적용되므로 1회 시청 후 세션 차단
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);
    });
  });

  describe('세션 한도 (세션당 최대 1회)', () => {
    it('세션에서 1회 시청 후에는 같은 세션에서 시청 불가능해야 합니다', () => {
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);
    });

    it('세션 카운터 초기화 후 다시 시청 가능해야 합니다', () => {
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);

      // 세션 카운터 초기화 (새 세션 시뮬레이션)
      resetRewardedSessionCount();
      // 일일 한도 내라면 다시 시청 가능
      expect(canShowRewardedAd()).toBe(true);
    });
  });

  describe('일일 카운터 리셋', () => {
    it('rewarded_ad_frequency localStorage 키를 사용해야 합니다', () => {
      recordRewardedAdShown();
      const stored = global.localStorage.getItem('rewarded_ad_frequency');
      expect(stored).not.toBeNull();
      const data = JSON.parse(stored!);
      expect(data).toHaveProperty('lastDate');
      expect(data).toHaveProperty('dailyCount');
    });

    it('dailyCount가 1씩 증가해야 합니다', () => {
      recordRewardedAdShown();
      const data1 = JSON.parse(global.localStorage.getItem('rewarded_ad_frequency') || '{}');
      expect(data1.dailyCount).toBe(1);

      // 세션 초기화 후 다시 시청 (일일 한도 내)
      resetRewardedSessionCount();
      recordRewardedAdShown();
      const data2 = JSON.parse(global.localStorage.getItem('rewarded_ad_frequency') || '{}');
      expect(data2.dailyCount).toBe(2);
    });
  });
});
