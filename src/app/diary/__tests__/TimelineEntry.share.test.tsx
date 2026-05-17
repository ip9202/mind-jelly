/**
 * SPEC-FRIEND-003: 감정 공유 & 피드 UI 테스트
 * TDD Phase: GREEN
 *
 * T-001: TimelineEntry 공유 아이콘
 * T-002: 친구 수 + 비활성화 가이드
 * T-003: 모달 상세 공유 토글
 *
 * diaryStore는 diaryStore.getState() 패턴으로 사용됨
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ── diaryStore 모킹 ──
const mockToggleShare = jest.fn();
const mockDeleteEntry = jest.fn();

const baseStoreState = {
  entries: [] as import('@/types/diary').DiaryEntry[],
  supabaseUserId: 'test-user-id' as string | null,
  isLoading: false,
  setUserId: jest.fn(),
  addEntry: jest.fn(),
  getEntriesByDate: jest.fn(() => []),
  getEntriesByMonth: jest.fn(() => []),
  getWeekStats: jest.fn(() => ({
    joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0,
    surprise: 0, love: 0, gratitude: 0, hope: 0,
  })),
  deleteEntry: mockDeleteEntry,
  toggleShare: mockToggleShare,
};

jest.mock('@/stores/diaryStore', () => {
  const state = {
    entries: [],
    supabaseUserId: 'test-user-id',
    isLoading: false,
    setUserId: jest.fn(),
    addEntry: jest.fn(),
    getEntriesByDate: jest.fn(() => []),
    getEntriesByMonth: jest.fn(() => []),
    getWeekStats: jest.fn(() => ({
      joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0,
      surprise: 0, love: 0, gratitude: 0, hope: 0,
    })),
    deleteEntry: jest.fn(),
    toggleShare: jest.fn(),
  };
  return {
    diaryStore: Object.assign(
      (selector: (s: typeof state) => unknown) => selector(state),
      { getState: () => state, subscribe: jest.fn(() => jest.fn()) }
    ),
  };
});

// ── getMyFriends 모킹 ──
const mockGetMyFriends = jest.fn().mockResolvedValue([]);
jest.mock('@/lib/supabase/db', () => ({
  getMyFriends: mockGetMyFriends,
  toggleDiaryShare: jest.fn(),
}));

// ── EmotionFace 모킹 ──
jest.mock('@/components/jelly/EmotionFace', () => ({
  EmotionFace: () => <div data-testid="emotion-face" />,
}));

// ── BottomNav 모킹 ──
jest.mock('@/components/layout/BottomNav', () => {
  return function MockBottomNav() {
    return <div data-testid="bottom-nav" />;
  };
});

// 테스트용 엔트리
function createTestEntry(overrides: Record<string, unknown> = {}): import('@/types/diary').DiaryEntry {
  return {
    id: 'test-entry-id',
    text: '테스트 일기 내용입니다',
    emotion: 'joy',
    confidence: 0.9,
    emotionKo: '평온',
    createdAt: new Date().toISOString(),
    isShared: false,
    ...overrides,
  };
}

// store state에 테스트 엔트리 설정
function setStoreEntries(entries: ReturnType<typeof createTestEntry>[]) {
  const { diaryStore } = jest.requireMock('@/stores/diaryStore');
  const state = diaryStore.getState();
  state.entries = entries;
  state.getEntriesByDate = jest.fn(() => entries);
  state.getEntriesByMonth = jest.fn(() => entries);
  state.toggleShare = mockToggleShare;
  state.deleteEntry = mockDeleteEntry;
}

describe('T-001: TimelineEntry 공유 아이콘', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMyFriends.mockResolvedValue([
      { requester_id: 'test-user-id', receiver_id: 'friend-1', status: 'accepted' },
    ]);
    setStoreEntries([createTestEntry()]);
  });

  it('공유 아이콘이 카드에 렌더링되어야 함', async () => {
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    // 엔트리가 렌더링될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    });
  });

  it('isShared=false일 때 surface-variant 색상 클래스가 적용되어야 함', async () => {
    setStoreEntries([createTestEntry({ isShared: false })]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    await waitFor(() => {
      const shareIcon = screen.getByTestId('share-icon');
      expect(shareIcon.className).toContain('text-on-surface-variant');
    });
  });

  it('isShared=true일 때 primary 색상 클래스가 적용되어야 함', async () => {
    setStoreEntries([createTestEntry({ isShared: true })]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    await waitFor(() => {
      const shareIcon = screen.getByTestId('share-icon');
      expect(shareIcon.className).toContain('text-primary');
    });
  });

  it('공유 아이콘 클릭 시 toggleShare가 호출되어야 함', async () => {
    setStoreEntries([createTestEntry({ isShared: false })]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    });

    const shareIcon = screen.getByTestId('share-icon');
    fireEvent.click(shareIcon);

    expect(mockToggleShare).toHaveBeenCalledWith('test-entry-id', true);
  });

  it('공유 아이콘 클릭이 카드 모달을 열지 않아야 함 (stopPropagation)', async () => {
    setStoreEntries([createTestEntry()]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    });

    const shareIcon = screen.getByTestId('share-icon');
    fireEvent.click(shareIcon);

    // 모달 오버레이가 나타나지 않아야 함
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });
});

describe('T-002: 친구 수 + 비활성화 가이드', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setStoreEntries([createTestEntry()]);
  });

  it('친구가 0명일 때 공유 아이콘이 시각적으로 비활성화되어야 함', async () => {
    mockGetMyFriends.mockResolvedValue([]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    await waitFor(() => {
      const shareIcon = screen.getByTestId('share-icon');
      expect(shareIcon.className).toContain('opacity-50');
    });
  });

  it('친구가 0명일 때 공유 아이콘 클릭 시 토스트가 표시되어야 함', async () => {
    mockGetMyFriends.mockResolvedValue([]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    });

    const shareIcon = screen.getByTestId('share-icon');
    fireEvent.click(shareIcon);

    // 토스트 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('친구를 먼저 추가해주세요')).toBeInTheDocument();
    });
  });

  it('친구가 있을 때 공유 아이콘이 활성화되어야 함', async () => {
    mockGetMyFriends.mockResolvedValue([
      { requester_id: 'test-user-id', receiver_id: 'friend-1', status: 'accepted' },
    ]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    await waitFor(() => {
      const shareIcon = screen.getByTestId('share-icon');
      expect(shareIcon).not.toHaveAttribute('disabled');
    });
  });
});

describe('T-003: 모달 상세 공유 토글', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMyFriends.mockResolvedValue([
      { requester_id: 'test-user-id', receiver_id: 'friend-1', status: 'accepted' },
    ]);
    setStoreEntries([createTestEntry()]);
  });

  it('모달에 "친구에게 공유" 토글 스위치가 있어야 함', async () => {
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    // 카드 클릭으로 모달 열기 (share-icon이 아닌 카드 본문 클릭)
    const card = screen.getByText('테스트 일기 내용입니다');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('친구에게 공유')).toBeInTheDocument();
      expect(screen.getByTestId('share-toggle')).toBeInTheDocument();
    });
  });

  it('토글 클릭 시 toggleShare가 호출되어야 함', async () => {
    setStoreEntries([createTestEntry({ isShared: false })]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    // 카드 클릭으로 모달 열기
    const card = screen.getByText('테스트 일기 내용입니다');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId('share-toggle')).toBeInTheDocument();
    });

    const toggle = screen.getByTestId('share-toggle');
    fireEvent.click(toggle);

    expect(mockToggleShare).toHaveBeenCalledWith('test-entry-id', true);
  });

  it('친구가 0명일 때 토글이 비활성화 + 안내 문구 표시', async () => {
    mockGetMyFriends.mockResolvedValue([]);
    const { default: DiaryPage } = await import('../page');
    render(<DiaryPage />);

    // 카드 클릭으로 모달 열기
    const card = screen.getByText('테스트 일기 내용입니다');
    fireEvent.click(card);

    await waitFor(() => {
      const toggle = screen.getByTestId('share-toggle');
      expect(toggle).toHaveAttribute('disabled');
      expect(screen.getByText('먼저 친구를 추가해주세요')).toBeInTheDocument();
    });
  });
});
