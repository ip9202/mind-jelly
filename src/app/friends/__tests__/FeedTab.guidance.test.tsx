/**
 * SPEC-FRIEND-003: FeedTab 제로-프렌즈 가이드 테스트
 * TDD Phase: RED → GREEN
 *
 * T-004: 친구가 없을 때 피드 탭 가이드
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── diaryStore 모킹 (zustand hook 패턴 지원) ──
jest.mock('@/stores/diaryStore', () => {
  const state = {
    entries: [],
    supabaseUserId: 'test-user-id',
    isLoading: false,
  };
  return {
    diaryStore: Object.assign(
      (selector: (s: typeof state) => unknown) => selector(state),
      { getState: () => state, subscribe: jest.fn(() => jest.fn()) }
    ),
  };
});

// ── supabase db 모킹 ──
const mockGetMyFriends = jest.fn().mockResolvedValue([]);
const mockGetFriendsFeed = jest.fn().mockResolvedValue([]);

jest.mock('@/lib/supabase/db', () => ({
  findUserByInviteCode: jest.fn(),
  sendFriendRequest: jest.fn(),
  acceptFriendRequest: jest.fn(),
  rejectFriendRequest: jest.fn(),
  removeFriend: jest.fn(),
  getMyFriends: mockGetMyFriends,
  getPendingFriendRequests: jest.fn().mockResolvedValue([]),
  getFriendsFeed: mockGetFriendsFeed,
  getMyProfile: jest.fn().mockResolvedValue({ id: 'test', nickname: '테스트', invite_code: 'ABC123', avatar_emotion: null }),
  checkFriendshipStatus: jest.fn(),
}));

// ── BottomNav 모킹 ──
jest.mock('@/components/layout/BottomNav', () => {
  return function MockBottomNav() {
    return <div data-testid="bottom-nav" />;
  };
});

describe('T-004: FeedTab 제로-프렌즈 가이드', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMyFriends.mockResolvedValue([]);
    mockGetFriendsFeed.mockResolvedValue([]);
  });

  it('친구가 없을 때 "먼저 친구를 추가해주세요" 메시지가 표시되어야 함', async () => {
    const { default: FriendsPage } = await import('../page');
    render(<FriendsPage />);

    // 피드 탭으로 전환
    const feedTab = screen.getByText('피드');
    fireEvent.click(feedTab);

    await waitFor(() => {
      expect(screen.getByText(/먼저 친구를 추가해주세요/)).toBeInTheDocument();
    });
  });

  it('친구가 없을 때 피드 탭 내에 CTA 버튼이 표시되어야 함', async () => {
    const { default: FriendsPage } = await import('../page');
    render(<FriendsPage />);

    const feedTab = screen.getByText('피드');
    fireEvent.click(feedTab);

    await waitFor(() => {
      // 피드 탭 내 CTA (data-testid로 식별)
      expect(screen.getByTestId('feed-cta-search')).toBeInTheDocument();
    });
  });

  it('CTA 버튼 클릭 시 찾기 탭으로 전환되어야 함', async () => {
    const { default: FriendsPage } = await import('../page');
    render(<FriendsPage />);

    const feedTab = screen.getByText('피드');
    fireEvent.click(feedTab);

    await waitFor(() => {
      expect(screen.getByTestId('feed-cta-search')).toBeInTheDocument();
    });

    const ctaButton = screen.getByTestId('feed-cta-search');
    fireEvent.click(ctaButton);

    // 찾기 탭 활성화 확인
    await waitFor(() => {
      expect(screen.getByText('초대코드로 찾기')).toBeInTheDocument();
    });
  });

  it('친구는 있지만 공유된 감정이 없을 때 기존 메시지가 유지되어야 함', async () => {
    mockGetMyFriends.mockResolvedValue([
      { requester_id: 'test-user-id', receiver_id: 'friend-1', status: 'accepted' },
    ]);
    mockGetFriendsFeed.mockResolvedValue([]);

    const { default: FriendsPage } = await import('../page');
    render(<FriendsPage />);

    const feedTab = screen.getByText('피드');
    fireEvent.click(feedTab);

    await waitFor(() => {
      expect(screen.getByText(/공유된 감정이 없어요/)).toBeInTheDocument();
    });
  });
});
