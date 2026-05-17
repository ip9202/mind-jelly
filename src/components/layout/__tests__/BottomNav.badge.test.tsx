/**
 * SPEC-FRIEND-004 TASK-004: BottomNav 친구 탭 뱃지 UI 테스트
 * TDD Phase: RED → GREEN → REFACTOR
 *
 * 친구 요청 pendingCount 뱃지가 올바르게 렌더링되는지 검증
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// next/link 모킹
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// useFriendStore 모킹
jest.mock('@/stores/friendStore', () => ({
  useFriendStore: jest.fn(),
}));

// 모킹된 useFriendStore 참조
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedUseFriendStore = (jest.requireMock('@/stores/friendStore') as any).useFriendStore as jest.Mock;

describe('TASK-004: BottomNav 친구 탭 뱃지', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본값: 뱃지 숨김
    mockedUseFriendStore.mockReturnValue({
      pendingCount: 0,
      isBadgeVisible: false,
    });
  });

  it('pendingCount가 0이면 뱃지가 렌더링되지 않아야 함', async () => {
    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    // 빨간색 뱃지 요소가 없어야 함
    const badge = screen.queryByLabelText('친구 요청 수');
    expect(badge).not.toBeInTheDocument();
  });

  it('pendingCount > 0이고 isBadgeVisible=true면 뱃지에 숫자가 표시되어야 함', async () => {
    mockedUseFriendStore.mockReturnValue({
      pendingCount: 3,
      isBadgeVisible: true,
    });

    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    const badge = screen.getByLabelText('친구 요청 수');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('pendingCount가 10 초과면 뱃지에 "9+"가 표시되어야 함', async () => {
    mockedUseFriendStore.mockReturnValue({
      pendingCount: 15,
      isBadgeVisible: true,
    });

    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    const badge = screen.getByLabelText('친구 요청 수');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('9+');
  });

  it('isBadgeVisible=false면 pendingCount > 0이어도 뱃지가 숨겨져야 함', async () => {
    mockedUseFriendStore.mockReturnValue({
      pendingCount: 5,
      isBadgeVisible: false,
    });

    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    const badge = screen.queryByLabelText('친구 요청 수');
    expect(badge).not.toBeInTheDocument();
  });

  it('뱃지가 친구 탭에만 표시되고 다른 탭에는 표시되지 않아야 함', async () => {
    mockedUseFriendStore.mockReturnValue({
      pendingCount: 7,
      isBadgeVisible: true,
    });

    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    // 뱃지 요소는 단 하나만 존재해야 함
    const badges = screen.queryAllByLabelText('친구 요청 수');
    expect(badges).toHaveLength(1);

    // 뱃지가 친구 탭 내부에 위치해야 함
    const friendsLink = screen.getByLabelText('친구');
    const badge = screen.getByLabelText('친구 요청 수');
    expect(friendsLink).toContainElement(badge);
  });
});
