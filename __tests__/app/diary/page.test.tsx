/**
 * DiaryPage 컴포넌트 테스트
 * 감정 일기 페이지 - 캘린더, 타임라인, 주간 감정 흐름
 * 동적 렌더링 (diaryStore 연동)
 */
import { render, screen } from '@testing-library/react';

// BottomNav 모킹
jest.mock('@/components/layout/BottomNav', () => {
  const MockNav = () => <nav data-testid="bottom-nav">Nav</nav>;
  return { __esModule: true, default: MockNav };
});

// diaryStore 모킹 - 빈 엔트리 상태
jest.mock('@/stores/diaryStore', () => {
  const mockState = {
    entries: [],
    addEntry: jest.fn(),
    getEntriesByDate: () => [],
    getEntriesByMonth: () => [],
    getWeekStats: () => ({
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      disgust: 0,
    }),
    deleteEntry: jest.fn(),
  };

  // Zustand store는 callable(=hook)이며 .getState()도 지원해야 함
  const mockStoreHook = Object.assign(
    jest.fn((selector: (state: { entries: unknown[] }) => unknown) => {
      if (selector) return selector({ entries: [] });
      return [];
    }),
    {
      getState: () => mockState,
      setState: jest.fn(),
      subscribe: jest.fn(),
    },
  );

  return {
    diaryStore: mockStoreHook,
  };
});

import DiaryPage from '@/app/diary/page';

describe('DiaryPage', () => {
  it('페이지 타이틀을 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('오늘의 감정 일기')).toBeInTheDocument();
  });

  it('캘린더 월 표시를 렌더링한다', () => {
    render(<DiaryPage />);

    // 현재 월 표시 (동적)
    const monthText = screen.getByText(/년 \d+월/);
    expect(monthText).toBeInTheDocument();
  });

  it('요일 헤더를 렌더링한다', () => {
    const { container } = render(<DiaryPage />);

    // 캘린더 그리드 내의 요일 헤더 확인
    const gridHeaders = container.querySelectorAll('.grid-cols-7 > div');
    const headerTexts = Array.from(gridHeaders).map((el) => el.textContent);
    expect(headerTexts).toContain('일');
    expect(headerTexts).toContain('월');
    expect(headerTexts).toContain('화');
    expect(headerTexts).toContain('수');
    expect(headerTexts).toContain('목');
    expect(headerTexts).toContain('금');
    expect(headerTexts).toContain('토');
  });

  it('타임라인 섹션을 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('타임라인')).toBeInTheDocument();
  });

  it('엔트리가 없으면 빈 상태 메시지를 렌더링한다', () => {
    render(<DiaryPage />);

    expect(
      screen.getByText('이 날의 감정 기록이 없어요'),
    ).toBeInTheDocument();
  });

  it('주간 감정 흐름 섹션을 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('이번 주 감정 흐름')).toBeInTheDocument();
  });

  it('감정 범례를 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('평온')).toBeInTheDocument();
    expect(screen.getByText('분노')).toBeInTheDocument();
    expect(screen.getByText('우울')).toBeInTheDocument();
    expect(screen.getByText('불안')).toBeInTheDocument();
  });

  it('감정 일기 헤더를 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('오늘의 감정 일기')).toBeInTheDocument();
  });

  it('월 이동 버튼이 렌더링된다', () => {
    render(<DiaryPage />);

    const prevButton = screen.getByLabelText('이전 달');
    const nextButton = screen.getByLabelText('다음 달');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });
});
