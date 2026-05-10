/**
 * HowtoPage 컴포넌트 테스트
 * 온보딩 두 번째 페이지 - 사용법 안내
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

import HowtoPage from '@/app/onboarding/howto/page';

describe('HowtoPage', () => {
  it('페이지 타이틀을 렌더링한다', () => {
    render(<HowtoPage />);

    expect(screen.getByText('Mind Jelly')).toBeInTheDocument();
  });

  it('소제목을 렌더링한다', () => {
    render(<HowtoPage />);

    expect(screen.getByText('어떻게 하지?')).toBeInTheDocument();
  });

  it('설명 문구를 렌더링한다', () => {
    render(<HowtoPage />);

    expect(screen.getByText('네 감정을 젤리에게 선물해줘.')).toBeInTheDocument();
  });

  it('3단계 카드를 렌더링한다', () => {
    render(<HowtoPage />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('각 단계 설명을 렌더링한다', () => {
    render(<HowtoPage />);

    expect(screen.getByText(/감정 구슬을/)).toBeInTheDocument();
    expect(screen.getByText(/젤리가 맛있게/)).toBeInTheDocument();
    expect(screen.getByText(/마음이 한결/)).toBeInTheDocument();
  });

  it('다음 버튼이 /onboarding/ready로 연결된다', () => {
    render(<HowtoPage />);

    const link = screen.getByRole('link', { name: /다음/ });
    expect(link).toHaveAttribute('href', '/onboarding/ready');
  });

  it('감정 구슬 아이콘을 표시한다', () => {
    render(<HowtoPage />);

    expect(screen.getByText('mood')).toBeInTheDocument();
    expect(screen.getByText('water_drop')).toBeInTheDocument();
    expect(screen.getByText('bolt')).toBeInTheDocument();
  });
});
