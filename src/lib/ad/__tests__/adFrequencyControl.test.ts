/**
 * Ad Frequency Controller Tests
 *
 * SPEC: SPEC-AD-001 (REQ-AD-004)
 * TDD Phase: RED - Write failing tests first
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock for console methods
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

// localStorage mock 타입 정의
interface MockLocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
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
    clear: () => {
      Object.keys(mockStore).forEach(key => delete mockStore[key]);
    },
  };

  const originalLocalStorage = global.localStorage;
  global.localStorage = localStorageMock as Storage;
  (localStorageMock as unknown as Storage).clear();
  consoleErrorSpy.mockClear();

  return { localStorageMock, originalLocalStorage };
}

function teardownEnvironment(originalLocalStorage: Storage) {
  global.localStorage = originalLocalStorage;
}

describe('adFrequencyControl', () => {
  // 전체 describe 블록에 대해 모듈 격리 수행
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  describe('getUserType', () => {
    let getUserType: () => 'new' | 'normal' | 'heavy';
    let recordSession: () => void;
    let originalLocalStorage: Storage;

    beforeEach(async () => {
      const env = setupFreshEnvironment();
      originalLocalStorage = env.originalLocalStorage;

      // 이 그룹의 테스트에 필요한 함수만 import
      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = await import('../adFrequencyControl');
      getUserType = module.getUserType;
      recordSession = module.recordSession;
    });

    afterEach(() => {
      teardownEnvironment(originalLocalStorage);
    });

    it('첫 방문 사용자(new)는 sessionCount < 3일 때 new여야 합니다', () => {
      // 첫 번째 세션 기록
      recordSession();

      const userType = getUserType();
      expect(userType).toBe('new');
    });

    it('세션 3회 이후 사용자는 normal로 분류되어야 합니다', () => {
      // 세션 3회 기록
      recordSession();
      recordSession();
      recordSession();

      const userType = getUserType();
      expect(userType).toBe('normal');
    });

    it('하루 5회 이상 방문한 사용자는 heavy로 분류되어야 합니다', () => {
      // 세션 5회 기록
      for (let i = 0; i < 5; i++) {
        recordSession();
      }

      const userType = getUserType();
      expect(userType).toBe('heavy');
    });
  });

  describe('recordSession', () => {
    let recordSession: () => void;
    let originalLocalStorage: Storage;

    beforeEach(async () => {
      const env = setupFreshEnvironment();
      originalLocalStorage = env.originalLocalStorage;

      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = await import('../adFrequencyControl');
      recordSession = module.recordSession;
    });

    afterEach(() => {
      teardownEnvironment(originalLocalStorage);
    });

    it('세션 기록 시 sessionCount가 증가해야 합니다', () => {
      // 초기 상태 확인
      const initialHistory = JSON.parse((global.localStorage as MockLocalStorage).getItem('ad_frequency_history') || '{}');
      const initialCount = initialHistory.sessionCount || 0;

      recordSession();

      // 검증: sessionCount가 증가했는지 확인
      const afterHistory = JSON.parse((global.localStorage as MockLocalStorage).getItem('ad_frequency_history') || '{}');
      expect(afterHistory.sessionCount).toBe(initialCount + 1);
    });

    it('세션 기록 시 todaySessionCount가 증가해야 합니다', () => {
      // 초기 상태 확인
      const initialHistory = JSON.parse((global.localStorage as MockLocalStorage).getItem('ad_frequency_history') || '{}');
      const initialTodayCount = initialHistory.todaySessionCount || 0;

      recordSession();

      // 검증: todaySessionCount가 증가했는지 확인
      const afterHistory = JSON.parse((global.localStorage as MockLocalStorage).getItem('ad_frequency_history') || '{}');
      expect(afterHistory.todaySessionCount).toBe(initialTodayCount + 1);
    });
  });

  describe('recordAdShown', () => {
    let recordSession: () => void, recordAdShown: () => void;
    let originalLocalStorage: Storage;

    beforeEach(async () => {
      const env = setupFreshEnvironment();
      originalLocalStorage = env.originalLocalStorage;

      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = await import('../adFrequencyControl');
      recordSession = module.recordSession;
      recordAdShown = module.recordAdShown;
    });

    afterEach(() => {
      teardownEnvironment(originalLocalStorage);
    });

    it('광고 시청 기록 시 todayAdsWatched가 증가해야 합니다', () => {
      recordSession();

      // 초기 상태 확인
      const initialHistory = JSON.parse((global.localStorage as MockLocalStorage).getItem('ad_frequency_history') || '{}');
      const initialAdsWatched = initialHistory.todayAdsWatched || 0;

      recordAdShown();

      // 검증: todayAdsWatched가 증가했는지 확인
      const afterHistory = JSON.parse((global.localStorage as MockLocalStorage).getItem('ad_frequency_history') || '{}');
      expect(afterHistory.todayAdsWatched).toBe(initialAdsWatched + 1);
    });
  });
});
