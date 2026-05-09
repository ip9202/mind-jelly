/**
 * BottomNav 컴포넌트 테스트
 * 하단 네비게이션 바 - 3개 탭 (jelly, history, garden)
 */
import { render, screen } from '@testing-library/react';
import BottomNav from '@/components/layout/BottomNav';

// next/link 모킹 - 실제 라우팅 없이 href를 표시하는 <a> 태그로 대체
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('BottomNav', () => {
  it('3개의 탭을 렌더링한다', () => {
    render(<BottomNav />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('각 탭에 올바른 라벨을 표시한다', () => {
    render(<BottomNav />);

    expect(screen.getByText('Jelly')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Garden')).toBeInTheDocument();
  });

  it('각 탭에 올바른 아이콘을 표시한다', () => {
    render(<BottomNav />);

    expect(screen.getByText('pets')).toBeInTheDocument();
    expect(screen.getByText('analytics')).toBeInTheDocument();
    expect(screen.getByText('eco')).toBeInTheDocument();
  });

  it('각 탭에 올바른 href를 가진다', () => {
    render(<BottomNav />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/home');
    expect(links[1]).toHaveAttribute('href', '/diary');
    expect(links[2]).toHaveAttribute('href', '/settings');
  });

  it('기본 activeTab이 jelly일 때 첫 번째 탭이 활성화된다', () => {
    render(<BottomNav />);

    const links = screen.getAllByRole('link');
    expect(links[0].className).toContain('bg-primary-container');
  });

  it('activeTab이 history일 때 두 번째 탭이 활성화된다', () => {
    render(<BottomNav activeTab="history" />);

    const links = screen.getAllByRole('link');
    // 비활성 탭은 text-text-primary 클래스
    expect(links[0].className).toContain('text-text-primary');
    // 활성 탭은 bg-primary-container 클래스
    expect(links[1].className).toContain('bg-primary-container');
  });

  it('activeTab이 garden일 때 세 번째 탭이 활성화된다', () => {
    render(<BottomNav activeTab="garden" />);

    const links = screen.getAllByRole('link');
    expect(links[2].className).toContain('bg-primary-container');
  });

  it('활성 탭의 아이콘에 FILL 1이 적용된다', () => {
    render(<BottomNav activeTab="jelly" />);

    const links = screen.getAllByRole('link');
    const activeIcon = links[0].querySelector('.material-symbols-outlined');
    expect(activeIcon).toHaveStyle({
      fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24',
    });
  });

  it('비활성 탭의 아이콘에 FILL 0이 적용된다', () => {
    render(<BottomNav activeTab="jelly" />);

    const links = screen.getAllByRole('link');
    const inactiveIcon = links[1].querySelector('.material-symbols-outlined');
    expect(inactiveIcon).toHaveStyle({
      fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
    });
  });

  it('nav 엘리먼트를 렌더링한다', () => {
    render(<BottomNav />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
