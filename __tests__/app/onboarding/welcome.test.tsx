/**
 * WelcomePage 컴포넌트 테스트
 * 온보딩 첫 번째 페이지
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

import WelcomePage from '@/app/onboarding/welcome/page';

describe('WelcomePage', () => {
  it('페이지 타이틀을 렌더링한다', () => {
    render(<WelcomePage />);

    expect(screen.getByText('Mind Jelly')).toBeInTheDocument();
  });

  it('인사말을 렌더링한다', () => {
    render(<WelcomePage />);

    expect(screen.getByText('안녕! 나는 마인드 젤리야')).toBeInTheDocument();
  });

  it('설명 문구를 렌더링한다', () => {
    render(<WelcomePage />);

    expect(screen.getByText('너의 감정을 먹고 커가는 젤리 친구')).toBeInTheDocument();
  });

  it('다음 버튼이 /onboarding/howto로 연결된다', () => {
    render(<WelcomePage />);

    const link = screen.getByRole('link', { name: /다음/ });
    expect(link).toHaveAttribute('href', '/onboarding/howto');
  });

  it('젤리 캐릭터 영역이 렌더링된다', () => {
    const { container } = render(<WelcomePage />);

    const jellyElement = container.querySelector('.jelly-float');
    expect(jellyElement).toBeInTheDocument();
  });

  it('손 흔드는 아이콘을 표시한다', () => {
    render(<WelcomePage />);

    expect(screen.getByText('front_hand')).toBeInTheDocument();
  });
});
