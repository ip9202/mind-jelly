/**
 * REQ-PERF-005: 광고 노출 기록 재시도 로직 테스트
 * SPEC-PERF-001
 */

import {
  initAdImpressionCache,
  recordAdShown,
  recordRewardedAdShown,
  resetAdCache,
} from '../adFrequencyControl';
import { incrementAdImpression } from '../../supabase/db';

// incrementAdImpression 모킹
jest.mock('../../supabase/db', () => ({
  incrementAdImpression: jest.fn().mockResolvedValue({}),
  loadTodayAdImpressions: jest.fn().mockResolvedValue({
    interstitialCount: 0,
    rewardedCount: 0,
  }),
}));

const mockedIncrement = incrementAdImpression as jest.MockedFunction<typeof incrementAdImpression>;

describe('REQ-PERF-005: 광고 기록 재시도', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    resetAdCache();
    await initAdImpressionCache('test-user', '2026-05-16');
  });

  describe('recordAdShown', () => {
    it('성공 시 1회만 호출해야 한다', async () => {
      mockedIncrement.mockResolvedValueOnce({} as never);

      recordAdShown();

      // 비동기 완료 대기
      await new Promise((r) => setTimeout(r, 100));

      expect(mockedIncrement).toHaveBeenCalledTimes(1);
    });

    it('실패 시 최대 3회 재시도해야 한다', async () => {
      mockedIncrement.mockRejectedValue(new Error('Network error'));

      recordAdShown();

      // 재시도 완료 대기 (3회 × 지수 백오프)
      await new Promise((r) => setTimeout(r, 7000));

      expect(mockedIncrement).toHaveBeenCalledTimes(3);
    });

    it('2번째 시도에서 성공하면 3번째는 호출하지 않아야 한다', async () => {
      mockedIncrement
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockResolvedValueOnce({} as never);

      recordAdShown();

      await new Promise((r) => setTimeout(r, 3000));

      expect(mockedIncrement).toHaveBeenCalledTimes(2);
    });
  });

  describe('recordRewardedAdShown', () => {
    it('성공 시 1회만 호출해야 한다', async () => {
      mockedIncrement.mockResolvedValueOnce({} as never);

      recordRewardedAdShown();

      await new Promise((r) => setTimeout(r, 100));

      expect(mockedIncrement).toHaveBeenCalledTimes(1);
    });

    it('실패 시 최대 3회 재시도해야 한다', async () => {
      mockedIncrement.mockRejectedValue(new Error('Network error'));

      recordRewardedAdShown();

      await new Promise((r) => setTimeout(r, 7000));

      expect(mockedIncrement).toHaveBeenCalledTimes(3);
    });
  });
});
