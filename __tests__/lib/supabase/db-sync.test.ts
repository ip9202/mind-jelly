/**
 * @MX:NOTE: [AUTO] SPEC-SYNC-001 M2 - 로컬스토리지 → Supabase 동기화 함수 테스트
 */

// 체이너블 Supabase 모킹 헬퍼
type Chain = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
};

function createChain(result: { data: unknown; error: unknown } = { data: null, error: null }): Chain {
  const chain: Chain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    upsert: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    single: jest.fn(() => Promise.resolve(result)),
  };
  return chain;
}

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import {
  loadUserProfile,
  updateUserProfile,
  loadUserSkins,
  upsertUserSkins,
  incrementRewardedAdAndUnlock,
  loadTodayAdImpressions,
  incrementAdImpression,
  resetUserData,
} from '@/lib/supabase/db';

describe('db-sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadUserProfile', () => {
    it('jellyShape/persistEmotion/skinExpiresAt 반환', async () => {
      const chain = createChain({
        data: {
          jelly_shape: 'ppung',
          persist_emotion: true,
          skin_expires_at: '2026-12-31T00:00:00Z',
        },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await loadUserProfile('user-1');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(result).toEqual({
        jellyShape: 'ppung',
        persistEmotion: true,
        skinExpiresAt: '2026-12-31T00:00:00Z',
      });
    });

    it('row 없으면 null 반환', async () => {
      const chain = createChain({ data: null, error: { code: 'PGRST116' } });
      mockFrom.mockReturnValue(chain);

      const result = await loadUserProfile('user-1');
      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('snake_case 컬럼으로 update 호출', async () => {
      const chain = createChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await updateUserProfile('user-1', {
        jellyShape: 'star',
        persistEmotion: true,
        skinExpiresAt: null,
      });

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          jelly_shape: 'star',
          persist_emotion: true,
          skin_expires_at: null,
        })
      );
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-1');
    });
  });

  describe('loadUserSkins', () => {
    it('row 있으면 camelCase로 반환', async () => {
      const chain = createChain({
        data: {
          unlocked_skins: ['cat', 'dog'],
          active_skin: 'cat',
          skin_enabled: true,
          rewarded_ad_count: 3,
          updated_at: '2026-05-15T00:00:00Z',
        },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await loadUserSkins('user-1');
      expect(mockFrom).toHaveBeenCalledWith('user_skins');
      expect(result).toEqual({
        unlockedSkins: ['cat', 'dog'],
        activeSkin: 'cat',
        skinEnabled: true,
        rewardedAdCount: 3,
        updatedAt: '2026-05-15T00:00:00Z',
      });
    });

    it('row 없으면 null 반환', async () => {
      const chain = createChain({ data: null, error: { code: 'PGRST116' } });
      mockFrom.mockReturnValue(chain);
      const result = await loadUserSkins('user-1');
      expect(result).toBeNull();
    });
  });

  describe('upsertUserSkins', () => {
    it('upsert 호출 + user_id 포함', async () => {
      const chain = createChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await upsertUserSkins('user-1', {
        unlockedSkins: ['cat'],
        activeSkin: 'cat',
        skinEnabled: true,
        rewardedAdCount: 5,
      });

      expect(mockFrom).toHaveBeenCalledWith('user_skins');
      expect(chain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          unlocked_skins: ['cat'],
          active_skin: 'cat',
          skin_enabled: true,
          rewarded_ad_count: 5,
        }),
        expect.anything()
      );
    });
  });

  describe('incrementRewardedAdAndUnlock', () => {
    it('RPC 호출 및 결과 반환', async () => {
      mockRpc.mockResolvedValue({
        data: {
          unlocked_skins: ['cat'],
          active_skin: null,
          skin_enabled: false,
          rewarded_ad_count: 1,
          updated_at: '2026-05-15T00:00:00Z',
        },
        error: null,
      });

      const result = await incrementRewardedAdAndUnlock('user-1', 'cat');

      expect(mockRpc).toHaveBeenCalledWith('increment_rewarded_and_unlock', {
        p_user_id: 'user-1',
        p_new_skin_id: 'cat',
      });
      expect(result.unlockedSkins).toEqual(['cat']);
      expect(result.rewardedAdCount).toBe(1);
    });

    it('RPC 에러 시 throw', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'rpc failed' } });
      await expect(incrementRewardedAdAndUnlock('user-1', null)).rejects.toThrow();
    });
  });

  describe('loadTodayAdImpressions', () => {
    it('row 있으면 카운트 반환', async () => {
      const chain = createChain({
        data: { interstitial_count: 2, rewarded_count: 1, ad_date: '2026-05-15' },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await loadTodayAdImpressions('user-1', '2026-05-15');
      expect(mockFrom).toHaveBeenCalledWith('ad_impressions');
      expect(result).toEqual({
        interstitialCount: 2,
        rewardedCount: 1,
        adDate: '2026-05-15',
      });
    });

    it('row 없으면 0으로 초기화된 객체 반환', async () => {
      const chain = createChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await loadTodayAdImpressions('user-1', '2026-05-15');
      expect(result).toEqual({
        interstitialCount: 0,
        rewardedCount: 0,
        adDate: '2026-05-15',
      });
    });
  });

  describe('incrementAdImpression', () => {
    it('interstitial 카운트 증가 (upsert)', async () => {
      // First call: load current row, second call: upsert
      const loadChain = createChain({
        data: { interstitial_count: 2, rewarded_count: 1, ad_date: '2026-05-15' },
        error: null,
      });
      const upsertChain = createChain({ data: null, error: null });
      mockFrom.mockReturnValueOnce(loadChain).mockReturnValueOnce(upsertChain);

      const result = await incrementAdImpression('user-1', '2026-05-15', 'interstitial');

      expect(upsertChain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          ad_date: '2026-05-15',
          interstitial_count: 3,
          rewarded_count: 1,
        }),
        expect.anything()
      );
      expect(result.interstitialCount).toBe(3);
      expect(result.rewardedCount).toBe(1);
    });

    it('rewarded 카운트 증가 (신규 row)', async () => {
      const loadChain = createChain({ data: null, error: null });
      const upsertChain = createChain({ data: null, error: null });
      mockFrom.mockReturnValueOnce(loadChain).mockReturnValueOnce(upsertChain);

      const result = await incrementAdImpression('user-1', '2026-05-15', 'rewarded');

      expect(upsertChain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          ad_date: '2026-05-15',
          interstitial_count: 0,
          rewarded_count: 1,
        }),
        expect.anything()
      );
      expect(result.rewardedCount).toBe(1);
    });
  });

  describe('resetUserData', () => {
    it('RPC reset_user_data 호출', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await resetUserData('user-1');

      expect(mockRpc).toHaveBeenCalledWith('reset_user_data', {
        p_user_id: 'user-1',
      });
    });

    it('에러 시 throw', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'reset failed' } });
      await expect(resetUserData('user-1')).rejects.toThrow();
    });
  });
});
