/**
 * ReadyPage 컴포넌트 테스트
 * 온보딩 세 번째 페이지 - 준비 완료 + 젤리 이름 입력
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

import ReadyPage from '@/app/onboarding/ready/page';

describe('ReadyPage', () => {
  it('페이지 타이틀을 렌더링한다', () => {
    render(<ReadyPage />);

    expect(screen.getByText('Mind Jelly')).toBeInTheDocument();
  });

  it('인사말을 렌더링한다', () => {
    render(<ReadyPage />);

    expect(screen.getByText('준비 완료! 시작해볼까?')).toBeInTheDocument();
  });

  it('시작 버튼이 /home으로 연결된다', () => {
    render(<ReadyPage />);

    const link = screen.getByRole('link', { name: '시작!' });
    expect(link).toHaveAttribute('href', '/home');
  });

  it('젤리 이름 입력 필드를 렌더링한다', () => {
    render(<ReadyPage />);

    const input = screen.getByPlaceholderText('젤리 이름 지어주기');
    expect(input).toBeInTheDocument();
  });

  it('입력 필드에 텍스트를 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<ReadyPage />);

    const input = screen.getByPlaceholderText('젤리 이름 지어주기');
    await user.type(input, '몽실이');

    expect(input).toHaveValue('몽실이');
  });

  it('입력 안내 문구를 렌더링한다', () => {
    render(<ReadyPage />);

    expect(
      screen.getByText('나만의 소중한 젤리에게 이름을 선물해주세요.'),
    ).toBeInTheDocument();
  });

  it('진행률 표시 3/3을 렌더링한다', () => {
    render(<ReadyPage />);

    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('파티 햇 아이콘을 표시한다', () => {
    render(<ReadyPage />);

    expect(screen.getByText('celebration')).toBeInTheDocument();
  });

  it('젤리 캐릭터 영역이 렌더링된다', () => {
    const { container } = render(<ReadyPage />);

    const jellyElement = container.querySelector('.jelly-float');
    expect(jellyElement).toBeInTheDocument();
  });
});
