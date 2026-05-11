/**
 * Toss Bridge 유틸리티 테스트
 * M4-T3: detectWebView, connectBridge, getDeviceInfo
 * M4-T6: Bridge Fallback (try/catch + timeout)
 */

// Window 확장 타입을 위한 설정
declare global {
  interface Window {
    __TOSS_BRIDGE__?: {
      getUserInfo: () => Promise<{ name: string; userId: string }>;
      getDeviceInfo?: () => Promise<{ darkMode: boolean; screenWidth: number }>;
    };
  }
}

export {};

// navigator.userAgent mock을 위한 유틸
function mockUserAgent(ua: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
    writable: true,
  });
}

describe('Toss Bridge', () => {
  let bridge: typeof import('@/lib/toss/bridge');

  beforeEach(() => {
    // 모듈 캐시 초기화
    jest.resetModules();

    // window 초기화
    delete window.__TOSS_BRIDGE__;
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    );
  });

  afterEach(() => {
    // 정리
    delete window.__TOSS_BRIDGE__;
    mockUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    );
  });

  // --- detectWebView ---

  describe('detectWebView', () => {
    it('window.__TOSS_BRIDGE__가 있고 User-Agent에 Toss가 있으면 true를 반환한다', async () => {
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn(),
      };
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      expect(bridge.detectWebView()).toBe(true);
    });

    it('window.__TOSS_BRIDGE__가 있어도 User-Agent에 Toss가 없으면 false를 반환한다', async () => {
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn(),
      };
      mockUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      );

      bridge = await import('@/lib/toss/bridge');
      expect(bridge.detectWebView()).toBe(false);
    });

    it('User-Agent에 Toss가 있어도 window.__TOSS_BRIDGE__가 없으면 false를 반환한다', async () => {
      delete window.__TOSS_BRIDGE__;
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      expect(bridge.detectWebView()).toBe(false);
    });

    it('둘 다 없으면 false를 반환한다', async () => {
      delete window.__TOSS_BRIDGE__;
      mockUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      );

      bridge = await import('@/lib/toss/bridge');
      expect(bridge.detectWebView()).toBe(false);
    });
  });

  // --- connectBridge ---

  describe('connectBridge', () => {
    it('브릿지에서 사용자 정보를 성공적으로 가져온다', async () => {
      const mockUserInfo = { name: '홍길동', userId: 'user-123' };
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn().mockResolvedValue(mockUserInfo),
      };
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.connectBridge();

      expect(result).toEqual(mockUserInfo);
    });

    it('WebView가 아니면 null을 반환한다', async () => {
      delete window.__TOSS_BRIDGE__;
      mockUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      );

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.connectBridge();

      expect(result).toBeNull();
    });

    it('getUserInfo가 에러를 던지면 null을 반환한다 (silent fallback)', async () => {
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn().mockRejectedValue(new Error('Bridge error')),
      };
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.connectBridge();

      expect(result).toBeNull();
    });

    it('5초 타임아웃 시 null을 반환한다', async () => {
      // 영원히 resolve되지 않는 Promise
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn().mockReturnValue(new Promise(() => {})),
      };
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');

      // 타임아웃을 100ms로 단축하여 테스트 속도 향상
      jest.useFakeTimers();
      const connectPromise = bridge.connectBridge(100);

      // 100ms 타이머 진행
      jest.advanceTimersByTime(150);

      const result = await connectPromise;
      expect(result).toBeNull();

      jest.useRealTimers();
    });

    it('브릿지 객체에 getUserInfo가 없으면 null을 반환한다', async () => {
      window.__TOSS_BRIDGE__ = {
        getDeviceInfo: jest.fn(),
      } as any;
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.connectBridge();

      expect(result).toBeNull();
    });
  });

  // --- getDeviceInfo ---

  describe('getDeviceInfo', () => {
    it('브릿지에서 디바이스 정보를 성공적으로 가져온다', async () => {
      const mockDeviceInfo = { darkMode: true, screenWidth: 390 };
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn().mockResolvedValue({
          name: '테스트',
          userId: '1',
        }),
        getDeviceInfo: jest.fn().mockResolvedValue(mockDeviceInfo),
      };
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.getDeviceInfo();

      expect(result).toEqual(mockDeviceInfo);
    });

    it('getDeviceInfo가 없으면 null을 반환한다', async () => {
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn().mockResolvedValue({
          name: '테스트',
          userId: '1',
        }),
      };
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.getDeviceInfo();

      expect(result).toBeNull();
    });

    it('WebView가 아니면 null을 반환한다', async () => {
      delete window.__TOSS_BRIDGE__;
      mockUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      );

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.getDeviceInfo();

      expect(result).toBeNull();
    });

    it('getDeviceInfo가 에러를 던지면 null을 반환한다', async () => {
      window.__TOSS_BRIDGE__ = {
        getUserInfo: jest.fn().mockResolvedValue({
          name: '테스트',
          userId: '1',
        }),
        getDeviceInfo: jest.fn().mockRejectedValue(new Error('Device error')),
      };
      mockUserAgent('Mozilla/5.0 Toss/1.0 AppleWebKit/605.1.15');

      bridge = await import('@/lib/toss/bridge');
      const result = await bridge.getDeviceInfo();

      expect(result).toBeNull();
    });
  });
});
