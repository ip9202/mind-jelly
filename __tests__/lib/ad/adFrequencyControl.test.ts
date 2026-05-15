/**
 * Ad Frequency Control 테스트
 *
 * SPEC: SPEC-SYNC-001 (REQ-SYNC-006)
 * 광고 빈도 제어를 localStorage에서 세션 캐시 + Supabase로 마이그레이션
 */

// @MX:NOTE: Supabase DB 함수 모킹
jest.mock('@/lib/supabase/db', () => ({
  loadTodayAdImpressions: jest.fn(),
  incrementAdImpression: jest.fn(),
}));

import {
  initAdImpressionCache,
  canShowInterstitial,
  canShowRewardedAd,
  recordAdShown,
  recordRewardedAdShown,
  resetAdCache,
  recordSession,
  getUserType,
  resetRewardedSessionCount,
} from '@/lib/ad/adFrequencyControl';
import { loadTodayAdImpressions, incrementAdImpression } from '@/lib/supabase/db';

const mockedLoadToday = loadTodayAdImpressions as jest.Mock;
const mockedIncrement = incrementAdImpression as jest.Mock;

// 헬퍼: 로컬 날짜 문자열 (YYYY-MM-DD)
function getLocalDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

describe('adFrequencyControl', () => {
  const userId = 'test-user-001';
  const date = getLocalDate();

  beforeAll(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    jest.setSystemTime(new Date('2026-05-15T09:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetAdCache();
    jest.setSystemTime(new Date('2026-05-15T09:00:00Z'));

    // 기본 모킹: 빈 데이터 반환
    mockedLoadToday.mockResolvedValue({
      interstitialCount: 0,
      rewardedCount: 0,
      adDate: date,
    });
    mockedIncrement.mockResolvedValue({
      interstitialCount: 0,
      rewardedCount: 0,
      adDate: date,
    });
  });

  // ─── initAdImpressionCache ───

  describe('initAdImpressionCache', () => {
    it('Supabase에서 데이터를 로드하여 캐시를 초기화한다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 5,
        rewardedCount: 2,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      expect(mockedLoadToday).toHaveBeenCalledWith(userId, date);
    });

    it('Supabase에 데이터가 없으면 0으로 초기화한다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 0,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      expect(mockedLoadToday).toHaveBeenCalledWith(userId, date);
      // 캐시 초기화 후 canShowRewardedAd가 정상 동작해야 함
      expect(canShowRewardedAd()).toBe(true);
    });
  });

  // ─── canShowInterstitial ───

  describe('canShowInterstitial', () => {
    it('캐시가 초기화되면 true를 반환한다', async () => {
      await initAdImpressionCache(userId, date);

      expect(canShowInterstitial()).toBe(true);
    });

    it('캐시가 초기화되지 않으면 false를 반환한다', () => {
      expect(canShowInterstitial()).toBe(false);
    });

    it('일일 2회 한도 초과 시 false를 반환한다', async () => {
      mockedLoadToday.mockResolvedValueOnce({ interstitialCount: 2, rewardedCount: 0 });
      await initAdImpressionCache(userId, date);

      expect(canShowInterstitial()).toBe(false);
    });

    it('1회 노출 후 2시간 미경과 시 false를 반환한다', async () => {
      await initAdImpressionCache(userId, date);
      jest.setSystemTime(new Date('2026-05-15T10:00:00Z'));

      recordAdShown(); // 1회 기록
      jest.setSystemTime(new Date('2026-05-15T11:59:00Z')); // 1시간 59분 경과

      expect(canShowInterstitial()).toBe(false);
    });

    it('1회 노출 후 2시간 경과 시 true를 반환한다', async () => {
      await initAdImpressionCache(userId, date);
      jest.setSystemTime(new Date('2026-05-15T10:00:00Z'));

      recordAdShown(); // 1회 기록
      jest.setSystemTime(new Date('2026-05-15T12:01:00Z')); // 2시간 1분 경과

      expect(canShowInterstitial()).toBe(true);
    });

    it('첫 노출(lastInterstitialAt=0)은 쿨다운 없이 통과한다', async () => {
      await initAdImpressionCache(userId, date);

      expect(canShowInterstitial()).toBe(true);
    });
  });

  // ─── canShowRewardedAd ───

  describe('canShowRewardedAd', () => {
    it('한도 내에서 true를 반환한다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 1,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      expect(canShowRewardedAd()).toBe(true);
    });

    it('일일 한도(3회) 초과 시 false를 반환한다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 3,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      expect(canShowRewardedAd()).toBe(false);
    });

    it('세션 한도(1회) 초과 시 false를 반환한다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 0,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      // 세션 내에서 1회 시청 기록
      recordRewardedAdShown();

      expect(canShowRewardedAd()).toBe(false);
    });

    it('캐시가 초기화되지 않으면 false를 반환한다', () => {
      expect(canShowRewardedAd()).toBe(false);
    });
  });

  // ─── recordAdShown ───

  describe('recordAdShown', () => {
    it('전면형 광고 시청을 캐시에 기록하고 RPC를 호출한다', async () => {
      mockedIncrement.mockResolvedValue({
        interstitialCount: 1,
        rewardedCount: 0,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);
      recordAdShown();

      // RPC 호출 확인 (fire-and-forget이므로 직접 호출 확인)
      expect(mockedIncrement).toHaveBeenCalledWith(userId, date, 'interstitial');
    });
  });

  // ─── recordRewardedAdShown ───

  describe('recordRewardedAdShown', () => {
    it('보상형 광고 시청을 캐시에 기록하고 RPC를 호출한다', async () => {
      mockedIncrement.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 1,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);
      recordRewardedAdShown();

      // RPC 호출 확인
      expect(mockedIncrement).toHaveBeenCalledWith(userId, date, 'rewarded');
    });

    it('연속 시청 시 세션 카운트가 누적된다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 0,
        adDate: date,
      });
      mockedIncrement.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 1,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      // 첫 번째 시청 - 세션 한도 내
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);
    });
  });

  // ─── 일일 한도 통합 시나리오 ───

  describe('일일 한도 통합 시나리오', () => {
    it('일일 한도 3회가 정확히 적용된다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 2,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      // 이미 2회 시청됨, 1회 더 가능 (총 3회 중)
      expect(canShowRewardedAd()).toBe(true);
    });
  });

  // ─── 엣지 케이스 ───

  describe('엣지 케이스', () => {
    it('캐시 초기화 없이 recordAdShown을 호출해도 에러가 나지 않는다', () => {
      expect(() => recordAdShown()).not.toThrow();
      expect(mockedIncrement).not.toHaveBeenCalled();
    });

    it('캐시 초기화 없이 recordRewardedAdShown을 호출해도 에러가 나지 않는다', () => {
      expect(() => recordRewardedAdShown()).not.toThrow();
      expect(mockedIncrement).not.toHaveBeenCalled();
    });

    it('resetAdCache 후 모든 상태가 초기화된다', async () => {
      await initAdImpressionCache(userId, date);
      expect(canShowInterstitial()).toBe(true);

      resetAdCache();

      expect(canShowInterstitial()).toBe(false);
      expect(canShowRewardedAd()).toBe(false);
    });

    it('서로 다른 날짜로 재초기화하면 캐시가 갱신된다', async () => {
      // 첫 번째 날짜
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 3,
        adDate: '2026-05-14',
      });
      await initAdImpressionCache(userId, '2026-05-14');
      expect(canShowRewardedAd()).toBe(false);

      // 두 번째 날짜 (새로운 날)
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 0,
        adDate: '2026-05-15',
      });
      await initAdImpressionCache(userId, '2026-05-15');
      expect(canShowRewardedAd()).toBe(true);
    });

    it('recordAdShown이 여러 번 호출되면 캐시가 누적된다', async () => {
      mockedIncrement.mockResolvedValue({
        interstitialCount: 1,
        rewardedCount: 0,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);
      recordAdShown();
      recordAdShown();
      recordAdShown();

      // RPC는 3번 호출되어야 함
      expect(mockedIncrement).toHaveBeenCalledTimes(3);
    });

    it('RPC 실패 시 에러를 캐치하고 로그를 출력한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const rpcError = new Error('RPC failed');
      mockedIncrement.mockRejectedValue(rpcError);

      await initAdImpressionCache(userId, date);
      recordAdShown();

      await jest.runAllTimersAsync();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[AdFrequency] 전면형 광고 기록 실패:',
        rpcError
      );
      consoleSpy.mockRestore();
    });

    it('보상형 RPC 실패 시 에러를 캐치하고 로그를 출력한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const rpcError = new Error('RPC failed');
      mockedIncrement.mockRejectedValue(rpcError);

      await initAdImpressionCache(userId, date);
      recordRewardedAdShown();

      await jest.runAllTimersAsync();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[AdFrequency] 보상형 광고 기록 실패:',
        rpcError
      );
      consoleSpy.mockRestore();
    });
  });

  // ─── recordSession / getUserType ───

  describe('recordSession / getUserType', () => {
    it('초기 상태에서 new 사용자를 반환한다', () => {
      expect(getUserType()).toBe('new');
    });

    it('세션 기록 후 normal 사용자를 반환한다', () => {
      recordSession();
      expect(getUserType()).toBe('normal');
    });

    it('세션 5회 이상 시 heavy 사용자를 반환한다', () => {
      for (let i = 0; i < 5; i++) {
        recordSession();
      }
      expect(getUserType()).toBe('heavy');
    });
  });

  // ─── resetRewardedSessionCount ───

  describe('resetRewardedSessionCount', () => {
    it('세션 보상형 카운트를 초기화한다', async () => {
      mockedLoadToday.mockResolvedValue({
        interstitialCount: 0,
        rewardedCount: 0,
        adDate: date,
      });

      await initAdImpressionCache(userId, date);

      // 1회 시청
      recordRewardedAdShown();
      expect(canShowRewardedAd()).toBe(false);

      // 리셋 후 다시 가능
      resetRewardedSessionCount();
      expect(canShowRewardedAd()).toBe(true);
    });

    it('캐시 초기화 없이 호출해도 에러가 나지 않는다', () => {
      expect(() => resetRewardedSessionCount()).not.toThrow();
    });
  });
});
