/**
 * BridgeInitializer 컴포넌트 테스트
 * M4-T4: Toss Bridge 비동기 초기화
 */
import { render } from '@testing-library/react';
import BridgeInitializer from '@/components/bridge/BridgeInitializer';
import { tossStore } from '@/stores/tossStore';

// bridge 모듈 모킹
const mockDetectWebView = jest.fn();
const mockConnectBridge = jest.fn();
jest.mock('@/lib/toss/bridge', () => ({
  detectWebView: () => mockDetectWebView(),
  connectBridge: () => mockConnectBridge(),
}));

// Supabase auth / db 모킹 (BridgeInitializer가 init 시 호출)
jest.mock('@/lib/supabase/auth', () => ({
  initSupabaseSession: jest.fn().mockResolvedValue(null),
}));
jest.mock('@/lib/supabase/db', () => ({
  getMyProfile: jest.fn().mockResolvedValue(null),
}));

// diaryStore / jellyStore의 setUserId / setJellyName 호출 회피
jest.mock('@/stores/diaryStore', () => ({
  diaryStore: {
    getState: () => ({ setUserId: jest.fn().mockResolvedValue(undefined) }),
  },
}));
jest.mock('@/stores/jellyStore', () => ({
  jellyStore: {
    getState: () => ({ setJellyName: jest.fn() }),
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

  it('WebView가 아닐 때 connectBridge를 호출하지 않는다', async () => {
    mockDetectWebView.mockReturnValue(false);

    render(<BridgeInitializer />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockConnectBridge).not.toHaveBeenCalled();
  });

  it('WebView 환경에서 connectBridge를 호출한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockConnectBridge.mockResolvedValue(null);

    render(<BridgeInitializer />);

    // 비동기 호출 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockConnectBridge).toHaveBeenCalledTimes(1);
  });

  it('브릿지 연결 성공 시 userInfo를 설정한다', async () => {
    const mockUserInfo = { name: '테스트유저', userId: '123' };
    mockDetectWebView.mockReturnValue(true);
    mockConnectBridge.mockResolvedValue(mockUserInfo);

    render(<BridgeInitializer />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(tossStore.getState().userInfo).toEqual(mockUserInfo);
  });

  it('브릿지 연결 성공 시 isBridgeReady를 true로 설정한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockConnectBridge.mockResolvedValue(null);

    render(<BridgeInitializer />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(tossStore.getState().isBridgeReady).toBe(true);
  });

  it('브릿지 연결 실패 시 isWebView를 false로 되돌린다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockConnectBridge.mockRejectedValue(new Error('연결 실패'));

    render(<BridgeInitializer />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(tossStore.getState().isWebView).toBe(false);
  });

  it('브릿지 연결 실패 시 userInfo를 null로 설정한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockConnectBridge.mockRejectedValue(new Error('연결 실패'));

    render(<BridgeInitializer />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(tossStore.getState().userInfo).toBeNull();
  });

  it('언마운트 시 취소 플래그가 설정되어 후속 작업이 무시된다', async () => {
    mockDetectWebView.mockReturnValue(true);
    // 의도적으로 지연되는 promise
    let resolveBridge: (value: any) => void;
    mockConnectBridge.mockReturnValue(
      new Promise((resolve) => {
        resolveBridge = resolve;
      }),
    );

    const { unmount } = render(<BridgeInitializer />);

    // 언마운트 (취소)
    unmount();

    // 이제 브릿지가 완료되어도 상태가 변경되지 않아야 함
    resolveBridge!({ name: 'test' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // userInfo가 설정되지 않아야 함 (cancelled)
    expect(tossStore.getState().userInfo).toBeNull();
    expect(tossStore.getState().isBridgeReady).toBe(false);
  });

  it('userInfo가 null일 때 setUserInfo를 호출하지 않고 setBridgeReady만 호출한다', async () => {
    mockDetectWebView.mockReturnValue(true);
    mockConnectBridge.mockResolvedValue(null);

    render(<BridgeInitializer />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(tossStore.getState().userInfo).toBeNull();
    expect(tossStore.getState().isBridgeReady).toBe(true);
  });
});
