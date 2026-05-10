/**
 * ThemeInitializer 컴포넌트 테스트
 * 앱인토스: 항상 라이트모드 강제, dark 클래스 제거
 */
import { render } from '@testing-library/react';
import { ThemeInitializer } from '@/components/ui/ThemeInitializer';

describe('ThemeInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('아무것도 렌더링하지 않는다', () => {
    const { container } = render(<ThemeInitializer />);

    expect(container.innerHTML).toBe('');
  });

  it('마운트 시 dark 클래스를 제거한다', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeInitializer />);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('localStorage에서 테마 설정을 제거한다', () => {
    localStorage.setItem('mind-jelly-theme', 'dark');
    render(<ThemeInitializer />);

    expect(localStorage.getItem('mind-jelly-theme')).toBeNull();
  });
});
