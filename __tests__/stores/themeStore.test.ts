/**
 * themeStore 테스트
 * M3-T1: 다크 모드 테마 상태 관리
 */
import { themeStore } from '@/stores/themeStore';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// matchMedia 모킹
const createMatchMedia = (prefersDark: boolean) => {
  let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;
  return {
    mock: jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
    getChangeHandler: () => changeHandler,
    resetHandler: () => { changeHandler = null; },
  };
};

describe('themeStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.restoreAllMocks();
    // document.documentElement.className 초기화
    document.documentElement.className = '';
    // 스토어 초기화
    themeStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
    });
  });

  describe('초기 상태', () => {
    it('기본 테마가 system이어야 한다', () => {
      expect(themeStore.getState().theme).toBe('system');
    });

    it('resolvedTheme이 light 또는 dark이어야 한다', () => {
      const { resolvedTheme } = themeStore.getState();
      expect(['light', 'dark']).toContain(resolvedTheme);
    });
  });

  describe('setTheme', () => {
    it('테마를 light로 설정할 수 있다', () => {
      themeStore.getState().setTheme('light');

      expect(themeStore.getState().theme).toBe('light');
      expect(themeStore.getState().resolvedTheme).toBe('light');
    });

    it('테마를 dark로 설정할 수 있다', () => {
      themeStore.getState().setTheme('dark');

      expect(themeStore.getState().theme).toBe('dark');
      expect(themeStore.getState().resolvedTheme).toBe('dark');
    });

    it('테마를 system으로 설정할 수 있다', () => {
      // 시스템이 라이트 모드인 경우
      const mm = createMatchMedia(false);
      window.matchMedia = mm.mock;

      themeStore.getState().setTheme('system');

      expect(themeStore.getState().theme).toBe('system');
      expect(themeStore.getState().resolvedTheme).toBe('light');
    });

    it('system 테마에서 OS 다크 모드 시 resolvedTheme이 dark가 되어야 한다', () => {
      const mm = createMatchMedia(true);
      window.matchMedia = mm.mock;

      themeStore.getState().setTheme('system');

      expect(themeStore.getState().theme).toBe('system');
      expect(themeStore.getState().resolvedTheme).toBe('dark');
    });

    it('테마 변경 시 localStorage에 저장해야 한다', () => {
      themeStore.getState().setTheme('dark');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mind-jelly-theme',
        'dark'
      );
    });

    it('dark 테마 시 html 요소에 dark 클래스를 추가해야 한다', () => {
      themeStore.getState().setTheme('dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('light 테마 시 html 요소에서 dark 클래스를 제거해야 한다', () => {
      document.documentElement.classList.add('dark');

      themeStore.getState().setTheme('light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    it('light에서 dark로 토글해야 한다', () => {
      themeStore.setState({ theme: 'light', resolvedTheme: 'light' });

      themeStore.getState().toggleTheme();

      expect(themeStore.getState().theme).toBe('dark');
      expect(themeStore.getState().resolvedTheme).toBe('dark');
    });

    it('dark에서 light로 토글해야 한다', () => {
      themeStore.setState({ theme: 'dark', resolvedTheme: 'dark' });

      themeStore.getState().toggleTheme();

      expect(themeStore.getState().theme).toBe('light');
      expect(themeStore.getState().resolvedTheme).toBe('light');
    });

    it('system (resolved: light)에서 dark로 토글해야 한다', () => {
      themeStore.setState({ theme: 'system', resolvedTheme: 'light' });

      themeStore.getState().toggleTheme();

      expect(themeStore.getState().theme).toBe('dark');
      expect(themeStore.getState().resolvedTheme).toBe('dark');
    });

    it('system (resolved: dark)에서 light로 토글해야 한다', () => {
      themeStore.setState({ theme: 'system', resolvedTheme: 'dark' });

      themeStore.getState().toggleTheme();

      expect(themeStore.getState().theme).toBe('light');
      expect(themeStore.getState().resolvedTheme).toBe('light');
    });
  });

  describe('localStorage 초기화', () => {
    it('localStorage에 저장된 테마를 읽어와야 한다', () => {
      localStorageMock.getItem.mockReturnValueOnce('dark');

      // store 재초기화 (initTheme 호출 시뮬레이션)
      themeStore.getState().initTheme();

      expect(themeStore.getState().theme).toBe('dark');
      expect(themeStore.getState().resolvedTheme).toBe('dark');
    });

    it('localStorage가 비어있으면 system으로 기본 설정해야 한다', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      themeStore.getState().initTheme();

      expect(themeStore.getState().theme).toBe('system');
    });
  });

  describe('시스템 테마 변경 감지', () => {
    it('system 모드에서 OS 테마 변경 시 resolvedTheme이 업데이트되어야 한다', () => {
      const mm = createMatchMedia(false);
      window.matchMedia = mm.mock;

      themeStore.setState({ theme: 'system', resolvedTheme: 'light' });

      // initTheme 호출로 리스너 등록 시뮬레이션
      themeStore.getState().initTheme();

      // matchMedia 콜백 시뮬레이션 - addEventListener 호출 확인
      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
    });

    it('system 모드에서 OS가 다크로 변경되면 resolvedTheme이 dark가 되어야 한다', () => {
      const mm = createMatchMedia(false);
      window.matchMedia = mm.mock;

      themeStore.setState({ theme: 'system', resolvedTheme: 'light' });
      themeStore.getState().initTheme();

      // matchMedia change 이벤트 핸들러 수동 호출
      const handler = mm.getChangeHandler();
      expect(handler).not.toBeNull();

      handler!({ matches: true } as MediaQueryListEvent);

      expect(themeStore.getState().resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('system 모드에서 OS가 라이트로 변경되면 resolvedTheme이 light가 되어야 한다', () => {
      const mm = createMatchMedia(true);
      window.matchMedia = mm.mock;

      themeStore.setState({ theme: 'system', resolvedTheme: 'dark' });
      document.documentElement.classList.add('dark');
      themeStore.getState().initTheme();

      const handler = mm.getChangeHandler();
      handler!({ matches: false } as MediaQueryListEvent);

      expect(themeStore.getState().resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('non-system 모드에서는 OS 테마 변경이 무시되어야 한다', () => {
      const mm = createMatchMedia(false);
      window.matchMedia = mm.mock;

      // localStorage에 dark 저장
      localStorageMock.setItem('mind-jelly-theme', 'dark');

      themeStore.setState({ theme: 'dark', resolvedTheme: 'dark' });
      themeStore.getState().initTheme();

      const handler = mm.getChangeHandler();
      handler!({ matches: false } as MediaQueryListEvent);

      // dark 테마가 유지되어야 함
      expect(themeStore.getState().theme).toBe('dark');
      expect(themeStore.getState().resolvedTheme).toBe('dark');
    });
  });
});
