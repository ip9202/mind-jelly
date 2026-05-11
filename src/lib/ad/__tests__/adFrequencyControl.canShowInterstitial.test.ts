/**
 * Ad Frequency Controller - Interstitial Ad Display Tests
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

describe('canShowInterstitial', () => {
  let canShowInterstitial: () => boolean;
  let recordSession: () => void;
  let recordAdShown: () => void;
  let originalLocalStorage: Storage;

  beforeEach(async () => {
    const env = setupFreshEnvironment();
    originalLocalStorage = env.originalLocalStorage;

    // eslint-disable-next-line @typescript-eslint/no-assign-module-variable, @next/next/no-assign-module-variable
    const module = await import('../adFrequencyControl');
    canShowInterstitial = module.canShowInterstitial;
    recordSession = module.recordSession;
    recordAdShown = module.recordAdShown;
  });

  afterEach(() => {
    teardownEnvironment(originalLocalStorage);
  });

  it('신규 사용자(new)에게는 전면형 광고를 표시하지 않아야 합니다', () => {
    // 명시적 초기화
    (global.localStorage as MockLocalStorage).clear();

    // 첫 방문
    recordSession();

    const canShow = canShowInterstitial();
    expect(canShow).toBe(false);
  });

  it('일반 사용자(normal)에게는 세션당 첫 번째 광고만 허용해야 합니다', () => {
    // 명시적 초기화
    (global.localStorage as MockLocalStorage).clear();

    // 세션 3회 기록 (normal 사용자)
    recordSession();
    recordSession();
    recordSession();

    // 첫 번째 광고는 허용
    expect(canShowInterstitial()).toBe(true);

    // 광고 시청 기록
    recordAdShown();

    // 두 번째 광고 차단
    expect(canShowInterstitial()).toBe(false);
  });

  it('헤비 사용자(heavy)에게는 세션당 두 번째 광고까지 허용해야 합니다', () => {
    // 명시적 초기화
    (global.localStorage as MockLocalStorage).clear();

    // 세션 5회 기록 (heavy 사용자)
    for (let i = 0; i < 5; i++) {
      recordSession();
    }

    // 첫 번째 광고 허용
    expect(canShowInterstitial()).toBe(true);
    recordAdShown();

    // 두 번째 광고 허용
    expect(canShowInterstitial()).toBe(true);
    recordAdShown();

    // 세 번째 광고 차단
    expect(canShowInterstitial()).toBe(false);
  });
});
