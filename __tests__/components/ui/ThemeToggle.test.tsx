/**
 * ThemeToggle 컴포넌트 테스트
 * M3-T3: 다크/라이트 토글 버튼
 */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { themeStore } from '@/stores/themeStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // 스토어 초기화
    themeStore.setState({
      theme: 'light',
      resolvedTheme: 'light',
    });
    document.documentElement.className = '';
  });

  it('data-testid="theme-toggle" 버튼을 렌더링한다', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('theme-toggle');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('라이트 모드에서 태양 아이콘을 표시한다', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('theme-toggle');
    const icon = button.querySelector('.material-symbols-outlined');
    expect(icon).toHaveTextContent('light_mode');
  });

  it('다크 모드에서 달 아이콘을 표시한다', () => {
    themeStore.setState({ theme: 'dark', resolvedTheme: 'dark' });

    render(<ThemeToggle />);

    const button = screen.getByTestId('theme-toggle');
    const icon = button.querySelector('.material-symbols-outlined');
    expect(icon).toHaveTextContent('dark_mode');
  });

  it('클릭 시 테마가 토글된다', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByTestId('theme-toggle');
    await user.click(button);

    expect(themeStore.getState().theme).toBe('dark');
    expect(themeStore.getState().resolvedTheme).toBe('dark');
  });

  it('다크 모드에서 클릭 시 라이트로 토글된다', async () => {
    const user = userEvent.setup();
    themeStore.setState({ theme: 'dark', resolvedTheme: 'dark' });

    render(<ThemeToggle />);

    const button = screen.getByTestId('theme-toggle');
    await user.click(button);

    expect(themeStore.getState().theme).toBe('light');
    expect(themeStore.getState().resolvedTheme).toBe('light');
  });

  it('버튼에 접근성 라벨이 있어야 한다', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('theme-toggle');
    expect(button).toHaveAttribute('aria-label');
  });
});
