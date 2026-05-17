/**
 * SPEC-FRIEND-004 TASK-004: BottomNav 친구 탭 뱃지 UI 테스트
 * TDD Phase: RED → GREEN → REFACTOR
 *
 * 친구 요청 pendingCount 뱃지가 올바르게 렌더링되는지 검증
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
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

// 기본 스토어 상태
let mockStoreState = {
  pendingCount: 0,
  isBadgeVisible: false,
};

// useFriendStore 모킹 - selector 패턴 지원
jest.mock('@/stores/friendStore', () => ({
  useFriendStore: jest.fn((selector?: (state: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState
  ),
}));

describe('TASK-004: BottomNav 친구 탭 뱃지', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState = { pendingCount: 0, isBadgeVisible: false };
  });

  it('pendingCount가 0이면 뱃지가 렌더링되지 않아야 함', async () => {
    const { default: BottomNav } = await import('../BottomNav');
    await act(async () => { render(<BottomNav />); });

    const badge = screen.queryByLabelText('친구 요청 수');
    expect(badge).not.toBeInTheDocument();
  });

  it('pendingCount > 0이고 isBadgeVisible=true면 뱃지에 숫자가 표시되어야 함', async () => {
    mockStoreState = { pendingCount: 3, isBadgeVisible: true };

    const { default: BottomNav } = await import('../BottomNav');
    await act(async () => { render(<BottomNav />); });

    const badge = screen.getByLabelText('친구 요청 수');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('pendingCount가 10 초과면 뱃지에 "9+"가 표시되어야 함', async () => {
    mockStoreState = { pendingCount: 15, isBadgeVisible: true };

    const { default: BottomNav } = await import('../BottomNav');
    await act(async () => { render(<BottomNav />); });

    const badge = screen.getByLabelText('친구 요청 수');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('9+');
  });

  it('isBadgeVisible=false면 pendingCount > 0이어도 뱃지가 숨겨져야 함', async () => {
    mockStoreState = { pendingCount: 5, isBadgeVisible: false };

    const { default: BottomNav } = await import('../BottomNav');
    await act(async () => { render(<BottomNav />); });

    const badge = screen.queryByLabelText('친구 요청 수');
    expect(badge).not.toBeInTheDocument();
  });

  it('뱃지가 친구 탭에만 표시되고 다른 탭에는 표시되지 않아야 함', async () => {
    mockStoreState = { pendingCount: 7, isBadgeVisible: true };

    const { default: BottomNav } = await import('../BottomNav');
    await act(async () => { render(<BottomNav />); });

    // 뱃지 요소는 단 하나만 존재해야 함
    const badges = screen.queryAllByLabelText('친구 요청 수');
    expect(badges).toHaveLength(1);

    // 뱃지가 친구 탭 내부에 위치해야 함
    const friendsLink = screen.getByLabelText('친구');
    const badge = screen.getByLabelText('친구 요청 수');
    expect(friendsLink).toContainElement(badge);
  });
});
