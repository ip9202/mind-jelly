/**
 * SettingsPage 컴포넌트 테스트
 * 설정 페이지 - 프로필, 젤리 모양, 정보
 */
import { render, screen } from '@testing-library/react';

// next/link 모킹
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

// NavMenu 모킹
jest.mock('@/components/layout/NavMenu', () => {
  const MockNav = () => <nav data-testid="nav-menu">Nav</nav>;
  return { __esModule: true, default: MockNav };
});

// Supabase db 모킹
jest.mock('@/lib/supabase/db', () => ({
  getMyProfile: jest.fn().mockResolvedValue(null),
  setNickname: jest.fn().mockResolvedValue(undefined),
}));

import SettingsPage from '@/app/settings/page';

describe('SettingsPage', () => {
  it('설정 타이틀을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument();
  });

  it('뒤로가기 링크가 /home으로 연결된다', () => {
    render(<SettingsPage />);

    const backLink = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/home');
    expect(backLink).toBeDefined();
  });

  it('프로필 섹션을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('프로필')).toBeInTheDocument();
  });

  it('젤리 모양 섹션을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('젤리 모양')).toBeInTheDocument();
  });

  it('정보 섹션을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('정보')).toBeInTheDocument();
  });

  it('버전 정보를 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('버전 정보')).toBeInTheDocument();
    expect(screen.getByText('v1.2.4')).toBeInTheDocument();
  });

  it('데이터 초기화를 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('데이터 초기화')).toBeInTheDocument();
  });

  it('설정 페이지 헤더를 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument();
  });

  it('젤리 모양 설명 문구를 렌더링한다', () => {
    render(<SettingsPage />);

    expect(
      screen.getByText(/젤리의 기본 모양을 선택해보세요/),
    ).toBeInTheDocument();
  });
});
