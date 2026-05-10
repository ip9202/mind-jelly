/**
 * SettingsPage 컴포넌트 테스트
 * 설정 페이지 - 색상 테마, 소리, 알림, 정보
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

// BottomNav 모킹
jest.mock('@/components/layout/BottomNav', () => {
  const MockNav = () => <nav data-testid="bottom-nav">Nav</nav>;
  return { __esModule: true, default: MockNav };
});

import SettingsPage from '@/app/settings/page';

describe('SettingsPage', () => {
  it('설정 타이틀을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('뒤로가기 링크가 /home으로 연결된다', () => {
    render(<SettingsPage />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('색상 테마 섹션을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('색상 테마')).toBeInTheDocument();
  });

  it('소리 설정 섹션을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('소리 설정')).toBeInTheDocument();
  });

  it('알림 섹션을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('알림')).toBeInTheDocument();
  });

  it('정보 섹션을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('정보')).toBeInTheDocument();
  });

  it('배경 음악 설정을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('배경 음악')).toBeInTheDocument();
  });

  it('효과음 설정을 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('효과음')).toBeInTheDocument();
  });

  it('데일리 리마인더를 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('데일리 리마인더')).toBeInTheDocument();
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

    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('색상 테마 설명 문구를 렌더링한다', () => {
    render(<SettingsPage />);

    expect(
      screen.getByText('젤리의 기분에 맞춰 색상을 변경해보세요'),
    ).toBeInTheDocument();
  });
});
