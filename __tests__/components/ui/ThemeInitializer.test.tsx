/**
 * ThemeInitializer 컴포넌트 테스트
 * 클라이언트에서 themeStore.initTheme() 호출
 */
import { render } from '@testing-library/react';
import { ThemeInitializer } from '@/components/ui/ThemeInitializer';
import { themeStore } from '@/stores/themeStore';

// window.matchMedia 모킹 (themeStore.initTheme에서 사용)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('ThemeInitializer', () => {
  beforeEach(() => {
    // 스토어 초기화
    themeStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
    });
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('아무것도 렌더링하지 않는다', () => {
    const { container } = render(<ThemeInitializer />);

    expect(container.innerHTML).toBe('');
  });

  it('마운트 시 initTheme을 호출한다', () => {
    const initSpy = jest.spyOn(themeStore.getState(), 'initTheme');

    render(<ThemeInitializer />);

    expect(initSpy).toHaveBeenCalledTimes(1);

    initSpy.mockRestore();
  });

  it('컴포넌트가 null을 반환한다', () => {
    const { container } = render(<ThemeInitializer />);

    expect(container.childNodes).toHaveLength(0);
  });
});
