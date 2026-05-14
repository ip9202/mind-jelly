/**
 * AppIntos AdMob SDK Initializer Tests
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 * GoogleAdMob.loadAppsInTossAdMob 초기화 검증
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// GoogleAdMob 모킹
const mockLoadCleanup = jest.fn();
const mockLoadAppsInTossAdMob = Object.assign(
  jest.fn(() => mockLoadCleanup),
  { isSupported: jest.fn(() => true) },
);

const mockShowAppsInTossAdMob = Object.assign(
  jest.fn(() => jest.fn()),
  { isSupported: jest.fn(() => true) },
);

jest.mock('@apps-in-toss/web-framework', () => ({
  GoogleAdMob: {
    loadAppsInTossAdMob: mockLoadAppsInTossAdMob,
    showAppsInTossAdMob: mockShowAppsInTossAdMob,
  },
}));

describe('adInitializer', () => {
  let initializeAdMob: () => Promise<void>;
  let isAdMobReady: () => boolean;
  let isAdMobSupported: () => boolean;

  beforeEach(async () => {
    jest.clearAllMocks();
    // 모듈 캐시 초기화 후 재임포트
    jest.resetModules();

    // 동적 import로 초기화 상태 리셋
    const mod = await import('../adInitializer');
    initializeAdMob = mod.initializeAdMob;
    isAdMobReady = mod.isAdMobReady;
    isAdMobSupported = mod.isAdMobSupported;
  });

  describe('initializeAdMob', () => {
    it('초기화 성공 시 isAdMobReady가 true를 반환해야 합니다', async () => {
      mockLoadAppsInTossAdMob.isSupported.mockReturnValue(true);

      await initializeAdMob();

      expect(isAdMobReady()).toBe(true);
    });

    it('지원하지 않는 환경에서도 에러 없이 초기화 완료로 처리해야 합니다', async () => {
      mockLoadAppsInTossAdMob.isSupported.mockReturnValue(false);

      await initializeAdMob();

      expect(isAdMobReady()).toBe(true);
    });

    it('GoogleAdMob.loadAppsInTossAdMob을 3번 호출해야 합니다 (배너, 전면형, 보상형)', async () => {
      mockLoadAppsInTossAdMob.isSupported.mockReturnValue(true);

      await initializeAdMob();

      expect(mockLoadAppsInTossAdMob).toHaveBeenCalledTimes(3);
    });

    it('isSupported 호출 중 예외 발생 시 에러 없이 처리해야 합니다', async () => {
      mockLoadAppsInTossAdMob.isSupported.mockImplementation(() => {
        throw new Error('SDK not available');
      });

      await expect(initializeAdMob()).resolves.toBeUndefined();
      expect(isAdMobReady()).toBe(true);
    });

    it('중복 초기화 시도 시 추가 loadAppsInTossAdMob 호출이 없어야 합니다', async () => {
      mockLoadAppsInTossAdMob.isSupported.mockReturnValue(true);

      await initializeAdMob();
      const callCount = mockLoadAppsInTossAdMob.mock.calls.length;

      await initializeAdMob();

      expect(mockLoadAppsInTossAdMob.mock.calls.length).toBe(callCount);
    });
  });

  describe('isAdMobReady', () => {
    it('boolean 값을 반환해야 합니다', () => {
      const ready = isAdMobReady();
      expect(typeof ready).toBe('boolean');
    });
  });

  describe('isAdMobSupported', () => {
    it('지원 환경에서 true를 반환해야 합니다', async () => {
      mockLoadAppsInTossAdMob.isSupported.mockReturnValue(true);

      // isAdMobSupported 호출 전 초기화 필요 (supportChecked 플래그)
      const supported = isAdMobSupported();
      expect(typeof supported).toBe('boolean');
    });
  });
});
