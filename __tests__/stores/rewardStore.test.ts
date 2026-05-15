/**
 * rewardStore.test.ts
 *
 * TDD: Zustand rewardStore 테스트 + SPEC-SYNC-001 M5 Supabase write-through
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { act } from '@testing-library/react';

jest.mock('@/lib/supabase/sync', () => ({
  createSyncQueue: jest.fn(() => ({
    enqueueWrite: jest.fn(),
    flushQueue: jest.fn().mockResolvedValue(undefined),
    isOnline: () => true,
    getQueueLength: () => 0,
    destroy: jest.fn(),
  })),
}));

import {
  rewardStore,
  RewardType,
  canShowRewardedAd,
  initRewardSync,
  destroyRewardSync,
  resetRewardStore,
  _setDbFns,
} from '@/stores/rewardStore';

// ── 모킹 함수 ──────────────────────────────────
const mockLoadUserSkins = jest.fn() as any;
const mockUpsertUserSkins = jest.fn() as any;
const mockIncrementRewardedAdAndUnlock = jest.fn() as any;

// DB 함수 주입 (rewardStore._setDbFns를 통해 교체)
_setDbFns({
  loadUserSkins: mockLoadUserSkins,
  upsertUserSkins: mockUpsertUserSkins,
  incrementRewardedAdAndUnlock: mockIncrementRewardedAdAndUnlock,
});

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock as unknown as Storage;

// @MX:NOTE: [AUTO] fake timer 환경에서 Promise microtask flush 헬퍼
const flushPromises = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
};

// ── 기존 rewardStore 기능 테스트 ──────────────────────────────────

describe('rewardStore (기본 기능)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-11T12:00:00Z'));
    jest.clearAllMocks();
    rewardStore.setState({
      rewardsHistory: [],
      activeSkin: null,
      unlockedSkins: [],
      rewardedAdCount: 0,
    });
  });

  describe('초기 상태', () => {
    it('빈 rewardsHistory 배열로 시작해야 함', () => {
      expect(rewardStore.getState().rewardsHistory).toEqual([]);
    });

    it('activeSkin이 null이어야 함', () => {
      expect(rewardStore.getState().activeSkin).toBeNull();
    });

    it('unlockedSkins가 빈 배열이어야 함', () => {
      expect(rewardStore.getState().unlockedSkins).toEqual([]);
    });
  });

  describe('보상 이력 관리', () => {
    it('addReward로 보상을 추가해야 함', () => {
      act(() => {
        rewardStore.getState().addReward({
          type: 'emotion_keywords' as RewardType,
          claimedAt: '2026-05-11T12:00:00Z',
        });
      });

      const state = rewardStore.getState();
      expect(state.rewardsHistory).toHaveLength(1);
      expect(state.rewardsHistory[0].type).toBe('emotion_keywords');
    });

    it('addReward 시 claimedAt를 현재 시간으로 설정해야 함', () => {
      const beforeTime = Date.now();

      act(() => {
        rewardStore.getState().addReward({
          type: 'weekly_report' as RewardType,
          claimedAt: new Date().toISOString(),
        });
      });

      const claimedTime = new Date(rewardStore.getState().rewardsHistory[0].claimedAt).getTime();
      expect(claimedTime).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('한정판 스킨 관리', () => {
    it('unlockSkin으로 스킨을 해금하고 24시간 타이머를 설정해야 함', async () => {
      const beforeTime = Date.now();

      await act(async () => {
        rewardStore.getState().unlockSkin('bear');
      });

      const state = rewardStore.getState();
      expect(state.activeSkin?.id).toBe('bear');

      const expiresTime = new Date(state.activeSkin?.expiresAt || '').getTime();
      const expectedExpires = beforeTime + 24 * 60 * 60 * 1000;
      expect(expiresTime).toBeGreaterThanOrEqual(expectedExpires - 1000);
      expect(expiresTime).toBeLessThanOrEqual(expectedExpires + 1000);
    });

    it('unlockSkin 시 unlockedSkins에 추가해야 함', async () => {
      await act(async () => {
        rewardStore.getState().unlockSkin('cat');
      });

      expect(rewardStore.getState().unlockedSkins).toContain('cat');
    });

    it('이미 활성화된 스킨이 있으면 교체하고 타이머를 리셋해야 함', async () => {
      await act(async () => {
        rewardStore.getState().unlockSkin('bear');
      });

      const firstExpires = rewardStore.getState().activeSkin?.expiresAt;
      jest.advanceTimersByTime(1000);

      await act(async () => {
        rewardStore.getState().unlockSkin('cat');
      });

      const state = rewardStore.getState();
      expect(state.activeSkin?.id).toBe('cat');
      expect(state.activeSkin?.expiresAt).not.toBe(firstExpires);
    });

    it('checkSkinExpiration으로 만료된 스킨을 비활성화해야 함', () => {
      act(() => {
        rewardStore.setState({
          activeSkin: {
            id: 'panda',
            name: '판다',
            emoji: '🐼',
            expiresAt: new Date('2026-05-10T12:00:00Z').toISOString(),
          },
        });
        rewardStore.getState().checkSkinExpiration();
      });

      expect(rewardStore.getState().activeSkin).toBeNull();
    });
  });

  describe('보상형 광고 빈도 제어', () => {
    it('canShowRewardedAd로 광고 표시 가능 여부를 확인해야 함', () => {
      expect(typeof canShowRewardedAd).toBe('function');
    });

    it('incrementRewardedAdCount로 카운터를 증가시켜야 함', () => {
      const before = rewardStore.getState().rewardedAdCount;

      act(() => {
        rewardStore.getState().incrementRewardedAdCount();
      });

      expect(rewardStore.getState().rewardedAdCount).toBe(before + 1);
    });
  });
});

// ── SPEC-SYNC-001 M5: Supabase write-through ──────────────────────

describe('rewardStore Supabase write-through (SPEC-SYNC-001 M5)', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-11T12:00:00Z'));
    jest.clearAllMocks();
    rewardStore.setState({
      rewardsHistory: [],
      activeSkin: null,
      unlockedSkins: [],
      rewardedAdCount: 0,
      skinEnabled: true,
    });
  });

  afterEach(() => {
    destroyRewardSync();
  });

  describe('unlockSkin - incrementRewardedAdAndUnlock RPC', () => {
    it('unlockSkin이 RPC를 호출하고 로컬 상태를 업데이트해야 함', async () => {
      initRewardSync(testUserId);

      mockIncrementRewardedAdAndUnlock.mockResolvedValueOnce({
        unlockedSkins: ['bear'],
        activeSkin: 'bear',
        skinEnabled: true,
        rewardedAdCount: 1,
        updatedAt: '2026-05-11T12:00:00Z',
      });

      await act(async () => {
        rewardStore.getState().unlockSkin('bear');
      });

      expect(mockIncrementRewardedAdAndUnlock).toHaveBeenCalledWith(testUserId, 'bear');

      const state = rewardStore.getState();
      expect(state.unlockedSkins).toContain('bear');
      expect(state.rewardedAdCount).toBe(1);
    });

    it('RPC 실패 시에도 로컬 상태는 낙관적으로 업데이트되어야 함', async () => {
      initRewardSync(testUserId);

      mockIncrementRewardedAdAndUnlock.mockRejectedValueOnce(new Error('RPC failed'));

      await act(async () => {
        rewardStore.getState().unlockSkin('cat');
      });

      expect(mockIncrementRewardedAdAndUnlock).toHaveBeenCalledWith(testUserId, 'cat');
      expect(rewardStore.getState().unlockedSkins).toContain('cat');
    });
  });

  describe('toggleSkinEnabled write-through', () => {
    it('toggleSkinEnabled가 로컬 상태를 즉시 변경해야 함', () => {
      initRewardSync(testUserId);
      expect(rewardStore.getState().skinEnabled).toBe(true);

      act(() => {
        rewardStore.getState().toggleSkinEnabled();
      });

      expect(rewardStore.getState().skinEnabled).toBe(false);
    });

    it('toggleSkinEnabled 후 2초 디바운스로 upsertUserSkins 호출되어야 함', async () => {
      initRewardSync(testUserId);
      mockUpsertUserSkins.mockResolvedValue(undefined);

      act(() => {
        rewardStore.getState().toggleSkinEnabled();
      });

      expect(mockUpsertUserSkins).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      expect(mockUpsertUserSkins).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      await act(async () => {
        await flushPromises();
      });

      expect(mockUpsertUserSkins).toHaveBeenCalledWith(testUserId, {
        skinEnabled: false,
      });
    });

    it('연속 toggle은 마지막 상태만 동기화해야 함', async () => {
      initRewardSync(testUserId);
      mockUpsertUserSkins.mockResolvedValue(undefined);

      act(() => {
        rewardStore.getState().toggleSkinEnabled();
      });
      jest.advanceTimersByTime(500);

      act(() => {
        rewardStore.getState().toggleSkinEnabled();
      });
      jest.advanceTimersByTime(2000);

      await act(async () => {
        await flushPromises();
      });

      expect(mockUpsertUserSkins).toHaveBeenCalledTimes(1);
      expect(mockUpsertUserSkins).toHaveBeenCalledWith(testUserId, {
        skinEnabled: true,
      });
    });
  });

  describe('setActiveSkin write-through', () => {
    it('setActiveSkin이 로컬 상태를 즉시 변경해야 함', () => {
      initRewardSync(testUserId);

      const skin = { id: 'fox', name: '여우', emoji: '🦊', expiresAt: '2026-05-12T12:00:00Z' };

      act(() => {
        rewardStore.getState().setActiveSkin(skin);
      });

      expect(rewardStore.getState().activeSkin).toEqual(skin);
    });

    it('setActiveSkin 후 2초 디바운스로 upsertUserSkins 호출되어야 함', async () => {
      initRewardSync(testUserId);
      mockUpsertUserSkins.mockResolvedValue(undefined);

      const skin = { id: 'fox', name: '여우', emoji: '🦊', expiresAt: '2026-05-12T12:00:00Z' };

      act(() => {
        rewardStore.getState().setActiveSkin(skin);
      });

      expect(mockUpsertUserSkins).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);

      await act(async () => {
        await flushPromises();
      });

      expect(mockUpsertUserSkins).toHaveBeenCalledWith(testUserId, {
        activeSkin: 'fox',
      });
    });

    it('빠른 스킨 변경 시 마지막 스킨만 동기화해야 함', async () => {
      initRewardSync(testUserId);
      mockUpsertUserSkins.mockResolvedValue(undefined);

      const foxSkin = { id: 'fox', name: '여우', emoji: '🦊', expiresAt: '2026-05-12T12:00:00Z' };
      const catSkin = { id: 'cat', name: '고양이', emoji: '🐱', expiresAt: '2026-05-12T12:00:00Z' };

      act(() => {
        rewardStore.getState().setActiveSkin(foxSkin);
      });
      jest.advanceTimersByTime(500);

      act(() => {
        rewardStore.getState().setActiveSkin(catSkin);
      });
      jest.advanceTimersByTime(2000);

      await act(async () => {
        await flushPromises();
      });

      expect(mockUpsertUserSkins).toHaveBeenCalledTimes(1);
      expect(mockUpsertUserSkins).toHaveBeenCalledWith(testUserId, {
        activeSkin: 'cat',
      });
    });
  });

  describe('hydrateFromSupabase', () => {
    it('Supabase에서 스킨 상태를 로드하여 로컬 상태를 업데이트해야 함', async () => {
      initRewardSync(testUserId);

      mockLoadUserSkins.mockResolvedValueOnce({
        unlockedSkins: ['bear', 'cat', 'fox'],
        activeSkin: 'fox',
        skinEnabled: true,
        rewardedAdCount: 5,
        updatedAt: '2026-05-11T10:00:00Z',
      });

      await act(async () => {
        rewardStore.getState().hydrateFromSupabase();
        await flushPromises();
      });

      expect(mockLoadUserSkins).toHaveBeenCalledWith(testUserId);

      const state = rewardStore.getState();
      expect(state.unlockedSkins).toEqual(['bear', 'cat', 'fox']);
      expect(state.rewardedAdCount).toBe(5);
      expect(state.skinEnabled).toBe(true);
    });

    it('Supabase 실패 시 기존 상태를 유지해야 함 (localStorage 폴백)', async () => {
      initRewardSync(testUserId);

      mockLoadUserSkins.mockRejectedValueOnce(new Error('Supabase connection failed'));

      await act(async () => {
        rewardStore.getState().hydrateFromSupabase();
        await flushPromises();
      });

      const state = rewardStore.getState();
      expect(state.unlockedSkins).toEqual([]);
      expect(state.rewardedAdCount).toBe(0);
    });

    it('Supabase에서 null 응답 시 기존 상태를 유지해야 함', async () => {
      initRewardSync(testUserId);

      mockLoadUserSkins.mockResolvedValueOnce(null);

      await act(async () => {
        rewardStore.getState().hydrateFromSupabase();
        await flushPromises();
      });

      const state = rewardStore.getState();
      expect(state.unlockedSkins).toEqual([]);
      expect(state.rewardedAdCount).toBe(0);
      expect(state.activeSkin).toBeNull();
    });

    it('initRewardSync 없이 호출 시 아무 동작도 하지 않아야 함', async () => {
      // syncUserId가 없으면 hydrateFromSupabase는 즉시 반환
      await act(async () => {
        rewardStore.getState().hydrateFromSupabase();
        await flushPromises();
      });

      expect(mockLoadUserSkins).not.toHaveBeenCalled();
    });
  });

  describe('write-through 없이 기본 동작', () => {
    it('initRewardSync 없이 toggleSkinEnabled는 로컬 상태만 변경해야 함', () => {
      act(() => {
        rewardStore.getState().toggleSkinEnabled();
      });

      expect(rewardStore.getState().skinEnabled).toBe(false);
      expect(mockUpsertUserSkins).not.toHaveBeenCalled();
    });

    it('initRewardSync 없이 setActiveSkin은 로컬 상태만 변경해야 함', () => {
      const skin = { id: 'fox', name: '여우', emoji: '🦊', expiresAt: '2026-05-12T12:00:00Z' };

      act(() => {
        rewardStore.getState().setActiveSkin(skin);
      });

      expect(rewardStore.getState().activeSkin).toEqual(skin);
      expect(mockUpsertUserSkins).not.toHaveBeenCalled();
    });

    it('resetRewardStore가 상태를 초기화해야 함', () => {
      // 상태 변경
      act(() => {
        rewardStore.getState().incrementRewardedAdCount();
        rewardStore.getState().toggleSkinEnabled();
      });

      expect(rewardStore.getState().rewardedAdCount).toBe(1);

      // resetRewardStore 함수 직접 호출
      act(() => {
        resetRewardStore();
      });

      const state = rewardStore.getState();
      expect(state.rewardsHistory).toEqual([]);
      expect(state.activeSkin).toBeNull();
      expect(state.unlockedSkins).toEqual([]);
      expect(state.rewardedAdCount).toBe(0);
      expect(state.skinEnabled).toBe(true);
    });

    it('hydrate에서 잘못된 JSON은 에러를 무시해야 함', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue('invalid-json');

      // 에러가 발생하지 않아야 함
      act(() => {
        rewardStore.getState().hydrate();
      });

      // 상태는 변경되지 않음 (에러가 발생해도 앱이 중단되지 않음)
      expect(rewardStore.getState().rewardsHistory).toEqual([]);

      consoleSpy.mockRestore();
    });
  });
});
