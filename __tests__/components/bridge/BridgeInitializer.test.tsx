/**
 * BridgeInitializer 컴포넌트 테스트
 * SDK 기반: detectWebView, getUserIdentity 초기화 플로우
 */
import { render } from '@testing-library/react';
import BridgeInitializer from '@/components/bridge/BridgeInitializer';
import { tossStore } from '@/stores/tossStore';

const mockDetectWebView = jest.fn();
const mockGetUserIdentity = jest.fn();

jest.mock('@/lib/toss/bridge', () => ({
  detectWebView: () => mockDetectWebView(),
  getUserIdentity: () => mockGetUserIdentity(),
}));

jest.mock('@/lib/supabase/auth', () => ({
  initSupabaseSession: jest.fn().mockResolvedValue(null),
}));
jest.mock('@/lib/supabase/db', () => ({
  getMyProfile: jest.fn().mockResolvedValue(null),
}));
jest.mock('@/stores/diaryStore', () => ({
  diaryStore: {
    getState: () => ({ setUserId: jest.fn().mockResolvedValue(undefined) }),
  },
}));
jest.mock('@/stores/jellyStore', () => ({
  jellyStore: {
    getState: () => ({
      setJellyName: jest.fn(),
      checkDiaryAndReset: jest.fn().mockResolvedValue(undefined),
      setInitialized: jest.fn(),
    }),
  },
}));

describe('BridgeInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tossStore.getState().reset();
  });

  it('아무것도 렌더링하지 않는다', () => {
    mockDetectWebView.mockReturnValue(false);
    const { container } = render(<BridgeInitializer />);
    expect(container.innerHTML).toBe('');
  });

  it('마운트 시 detectWebView를 호출한다', async () => {
    mockDetectWebView.mockReturnValue(false);
    render(<BridgeInitializer />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockDetectWebView).toHaveBeenCalledTimes(1);
  });

  it('WebView가 아닐 때 isWebView를 false로 설정한다', async () => {
    mockDetectWebView.mockReturnValue(false);
    render(<BridgeInitializer />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(tossStore.getState().isWebView).toBe(false);
  });

  it('WebView가 아닐 때 getUserIdentity를 호출하지 않는다', async () => {
    mockDetectWebView.mockReturnValue(false);
    render(<BridgeInitializer />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockGetUserIdentity).not.toHaveBeenCalled();
  });

  it('WebView 환경에서 getUserIdentity를 호출한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockResolvedValue(null);
    render(<BridgeInitializer />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockGetUserIdentity).toHaveBeenCalledTimes(1);
  });

  it('getUserIdentity 성공 시 userIdentity를 설정하고 isBridgeReady를 true로 한다', async () => {
    const identity = { anonymousKey: 'hash-abc', deviceId: 'dev-xyz' };
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockResolvedValue(identity);
    render(<BridgeInitializer />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(tossStore.getState().userIdentity).toEqual(identity);
    expect(tossStore.getState().isBridgeReady).toBe(true);
  });

  it('getUserIdentity가 null을 반환해도 isBridgeReady를 true로 한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockResolvedValue(null);
    render(<BridgeInitializer />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(tossStore.getState().userIdentity).toBeNull();
    expect(tossStore.getState().isBridgeReady).toBe(true);
  });

  it('getUserIdentity 예외 발생 시 isWebView를 false로 되돌린다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockGetUserIdentity.mockRejectedValue(new Error('SDK error'));
    render(<BridgeInitializer />);
    await new Promise((resolve) => setTimeout(resolve, 0));
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
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(tossStore.getState().userIdentity).toBeNull();
    expect(tossStore.getState().isBridgeReady).toBe(false);
  });
});
