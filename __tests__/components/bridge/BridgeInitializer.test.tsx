/**
 * BridgeInitializer 컴포넌트 테스트
 * SDK 기반: detectWebView, getUserIdentity 초기화 플로우
 * SPEC-SYNC-001 M7: 병렬 하이드레이션 (REQ-SYNC-002)
 */
import { render } from '@testing-library/react';
import BridgeInitializer from '@/components/bridge/BridgeInitializer';
import { tossStore } from '@/stores/tossStore';
import { initAdImpressionCache, recordSession } from '@/lib/ad/adFrequencyControl';
import { initializeAdMob } from '@/lib/ad/adInitializer';

const mockDetectWebView = jest.fn();
const mockGetUserIdentity = jest.fn();
const mockInitSupabaseSession = jest.fn();
const mockGetMyProfile = jest.fn();
const mockSetUserId = jest.fn().mockResolvedValue(undefined);
const mockCheckDiaryAndReset = jest.fn().mockResolvedValue(undefined);
const mockSetInitialized = jest.fn();
const mockSetJellyName = jest.fn();
const mockHydrateFromSupabaseJelly = jest.fn().mockResolvedValue(undefined);
const mockHydrateFromSupabaseReward = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/toss/bridge', () => ({
  detectWebView: () => mockDetectWebView(),
  getUserIdentity: () => mockGetUserIdentity(),
}));

jest.mock('@/lib/supabase/auth', () => ({
  initSupabaseSession: () => mockInitSupabaseSession(),
}));

jest.mock('@/lib/supabase/db', () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
}));

jest.mock('@/stores/diaryStore', () => ({
  diaryStore: {
    getState: () => ({ setUserId: mockSetUserId }),
  },
}));

jest.mock('@/stores/jellyStore', () => ({
  jellyStore: {
    getState: () => ({
      setJellyName: mockSetJellyName,
      checkDiaryAndReset: mockCheckDiaryAndReset,
      setInitialized: mockSetInitialized,
      hydrateFromSupabase: mockHydrateFromSupabaseJelly,
    }),
  },
}));

jest.mock('@/stores/rewardStore', () => ({
  rewardStore: {
    getState: () => ({
      hydrateFromSupabase: mockHydrateFromSupabaseReward,
    }),
  },
}));

jest.mock('@/lib/ad/adFrequencyControl', () => ({
  recordSession: jest.fn(),
  initAdImpressionCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/ad/adInitializer', () => ({
  initializeAdMob: jest.fn(),
}));

// window.location.href 모킹
const originalLocation = window.location;
beforeAll(() => {
  // @ts-expect-error - 테스트를 위해 location 모킹
  delete window.location;
  // @ts-expect-error - 테스트를 위해 location 모킹
  window.location = { ...originalLocation, href: '' };
});
afterAll(() => {
  // @ts-expect-error - 테스트를 위해 원래 location 복원
  window.location = originalLocation;
});

describe('BridgeInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tossStore.getState().reset();
    mockDetectWebView.mockReturnValue(false);
    mockInitSupabaseSession.mockResolvedValue(null);
    mockGetMyProfile.mockResolvedValue(null);
  });

  it('아무것도 렌더링하지 않는다', () => {
    const { container } = render(<BridgeInitializer />);
    expect(container.innerHTML).toBe('');
  });

  it('마운트 시 detectWebView를 호출한다', async () => {
    render(<BridgeInitializer />);
    await flushPromises();
    expect(mockDetectWebView).toHaveBeenCalledTimes(1);
  });

  it('WebView가 아닐 때 isWebView를 false로 설정한다', async () => {
    render(<BridgeInitializer />);
    await flushPromises();
    expect(tossStore.getState().isWebView).toBe(false);
  });

  it('WebView가 아닐 때 getUserIdentity를 호출하지 않는다', async () => {
    render(<BridgeInitializer />);
    await flushPromises();
    expect(mockGetUserIdentity).not.toHaveBeenCalled();
  });

  it('WebView 환경에서 getUserIdentity를 호출한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockResolvedValue(null);
    render(<BridgeInitializer />);
    await flushPromises();
    expect(mockGetUserIdentity).toHaveBeenCalledTimes(1);
  });

  it('getUserIdentity 성공 시 userIdentity를 설정하고 isBridgeReady를 true로 한다', async () => {
    const identity = { anonymousKey: 'hash-abc', deviceId: 'dev-xyz' };
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockResolvedValue(identity);
    render(<BridgeInitializer />);
    await flushPromises();
    expect(tossStore.getState().userIdentity).toEqual(identity);
    expect(tossStore.getState().isBridgeReady).toBe(true);
  });

  it('getUserIdentity가 null을 반환해도 isBridgeReady를 true로 한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockResolvedValue(null);
    render(<BridgeInitializer />);
    await flushPromises();
    expect(tossStore.getState().userIdentity).toBeNull();
    expect(tossStore.getState().isBridgeReady).toBe(true);
  });

  it('getUserIdentity 예외 발생 시 isWebView를 false로 되돌린다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockRejectedValue(new Error('SDK error'));
    render(<BridgeInitializer />);
    await flushPromises();
    expect(tossStore.getState().isWebView).toBe(false);
    expect(tossStore.getState().userIdentity).toBeNull();
  });

  it('언마운트 후 resolve 되어도 상태가 변경되지 않는다', async () => {
    mockDetectWebView.mockReturnValue(true);
    let resolveIdentity!: (v: unknown) => void;
    mockGetUserIdentity.mockReturnValue(new Promise((r) => { resolveIdentity = r; }));

    const { unmount } = render(<BridgeInitializer />);
    unmount();

    resolveIdentity({ anonymousKey: 'hash', deviceId: 'dev' });
    await flushPromises();

    expect(tossStore.getState().userIdentity).toBeNull();
    expect(tossStore.getState().isBridgeReady).toBe(false);
  });

  // ── SPEC-SYNC-001 M7: 병렬 하이드레이션 테스트 ──────────────────────

  describe('병렬 하이드레이션 (REQ-SYNC-002)', () => {
    const testUserId = 'test-user-123';

    beforeEach(() => {
      mockInitSupabaseSession.mockResolvedValue(testUserId);
      mockGetMyProfile.mockResolvedValue({ nickname: '테스트' });
      window.location.href = '/home';
    });

    it('Supabase 세션 초기화 후 병렬 하이드레이션을 실행한다', async () => {
      render(<BridgeInitializer />);
      await flushPromises();

      // 세 가지 하이드레이션이 모두 호출되어야 함
      expect(mockHydrateFromSupabaseJelly).toHaveBeenCalledWith(testUserId);
      expect(mockHydrateFromSupabaseReward).toHaveBeenCalled();
      expect(initAdImpressionCache).toHaveBeenCalledWith(
        testUserId,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      );
    });

    it('하이드레이션이 Promise.all로 병렬 실행된다', async () => {
      // 각 하이드레이션에 지연을 주어 병렬 실행 확인
      const jellyPromise = new Promise<void>((resolve) => setTimeout(resolve, 10));
      const rewardPromise = new Promise<void>((resolve) => setTimeout(resolve, 10));
      const adPromise = new Promise<void>((resolve) => setTimeout(resolve, 10));

      mockHydrateFromSupabaseJelly.mockReturnValue(jellyPromise);
      mockHydrateFromSupabaseReward.mockReturnValue(rewardPromise);
      (initAdImpressionCache as jest.Mock).mockReturnValue(adPromise);

      render(<BridgeInitializer />);
      await flushPromises();

      // 세 가지가 모두 호출되었는지 확인 (병렬 실행됨)
      expect(mockHydrateFromSupabaseJelly).toHaveBeenCalled();
      expect(mockHydrateFromSupabaseReward).toHaveBeenCalled();
      expect(initAdImpressionCache).toHaveBeenCalled();
    });

    it('jellyStore 하이드레이션 실패 시 다른 하이드레이션은 계속 진행된다', async () => {
      mockHydrateFromSupabaseJelly.mockRejectedValue(new Error('jelly fail'));

      render(<BridgeInitializer />);
      await flushPromises();

      // 다른 하이드레이션은 정상 실행
      expect(mockHydrateFromSupabaseReward).toHaveBeenCalled();
      expect(initAdImpressionCache).toHaveBeenCalled();
      // setInitialized는 여전히 호출되어 UI 렌더링이 차단되지 않음
      expect(mockSetInitialized).toHaveBeenCalledWith(true);
    });

    it('rewardStore 하이드레이션 실패 시 다른 하이드레이션은 계속 진행된다', async () => {
      mockHydrateFromSupabaseReward.mockRejectedValue(new Error('reward fail'));

      render(<BridgeInitializer />);
      await flushPromises();

      expect(mockHydrateFromSupabaseJelly).toHaveBeenCalled();
      expect(initAdImpressionCache).toHaveBeenCalled();
      expect(mockSetInitialized).toHaveBeenCalledWith(true);
    });

    it('initAdImpressionCache 실패 시 다른 하이드레이션은 계속 진행된다', async () => {
      (initAdImpressionCache as jest.Mock).mockRejectedValue(new Error('ad cache fail'));

      render(<BridgeInitializer />);
      await flushPromises();

      expect(mockHydrateFromSupabaseJelly).toHaveBeenCalled();
      expect(mockHydrateFromSupabaseReward).toHaveBeenCalled();
      expect(mockSetInitialized).toHaveBeenCalledWith(true);
    });

    it('모든 하이드레이션이 실패해도 UI 렌더링이 차단되지 않는다', async () => {
      mockHydrateFromSupabaseJelly.mockRejectedValue(new Error('jelly fail'));
      mockHydrateFromSupabaseReward.mockRejectedValue(new Error('reward fail'));
      (initAdImpressionCache as jest.Mock).mockRejectedValue(new Error('ad fail'));

      render(<BridgeInitializer />);
      await flushPromises();

      // setInitialized는 여전히 호출됨 - UI 렌더링 차단 없음
      expect(mockSetInitialized).toHaveBeenCalledWith(true);
    });

    it('Supabase 세션이 없으면 하이드레이션을 실행하지 않는다', async () => {
      mockInitSupabaseSession.mockResolvedValue(null);

      render(<BridgeInitializer />);
      await flushPromises();

      expect(mockHydrateFromSupabaseJelly).not.toHaveBeenCalled();
      expect(mockHydrateFromSupabaseReward).not.toHaveBeenCalled();
      expect(initAdImpressionCache).not.toHaveBeenCalled();
    });

    it('recordSession과 initializeAdMob은 항상 실행된다', async () => {
      render(<BridgeInitializer />);
      await flushPromises();

      expect(recordSession).toHaveBeenCalled();
      expect(initializeAdMob).toHaveBeenCalled();
    });
  });
});

// Promise 플러시 유틸리티
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
