/**
 * ReadyPage 컴포넌트 테스트
 * 온보딩 세 번째 페이지 - 준비 완료 + 젤리 이름 입력
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// next/navigation 모킹
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// jellyStore 모킹
const mockSetJellyName = jest.fn();
jest.mock('@/stores/jellyStore', () => ({
  jellyStore: {
    getState: () => ({ setJellyName: mockSetJellyName }),
  },
}));

import ReadyPage from '@/app/onboarding/ready/page';

describe('ReadyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인사말을 렌더링한다', () => {
    render(<ReadyPage />);

    expect(screen.getByText('준비 완료! 시작해볼까?')).toBeInTheDocument();
  });

  it('시작 버튼이 렌더링된다', () => {
    render(<ReadyPage />);

    expect(screen.getByRole('button', { name: '시작!' })).toBeInTheDocument();
  });

  it('시작 버튼 클릭 시 jellyName을 저장하고 /home으로 이동한다', async () => {
    const user = userEvent.setup();
    render(<ReadyPage />);

    const input = screen.getByPlaceholderText('젤리 이름 지어주기');
    await user.type(input, '몽실이');

    const button = screen.getByRole('button', { name: '시작!' });
    await user.click(button);

    expect(mockSetJellyName).toHaveBeenCalledWith('몽실이');
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('빈 이름일 때 기본값 "내 젤리"로 저장된다', async () => {
    const user = userEvent.setup();
    render(<ReadyPage />);

    const button = screen.getByRole('button', { name: '시작!' });
    await user.click(button);

    expect(mockSetJellyName).toHaveBeenCalledWith('내 젤리');
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

  it('진행률 표시 3/3을 렌더링한다', () => {
    render(<ReadyPage />);

    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('젤리 캐릭터 영역이 렌더링된다', () => {
    const { container } = render(<ReadyPage />);

    const jellyElement = container.querySelector('.jelly-float');
    expect(jellyElement).toBeInTheDocument();
  });
});
