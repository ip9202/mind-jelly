/**
 * DiaryPage 컴포넌트 테스트
 * 감정 일기 페이지 - 캘린더, 타임라인, 주간 감정 흐름
 */
import { render, screen } from '@testing-library/react';

// BottomNav 모킹
jest.mock('@/components/layout/BottomNav', () => {
  const MockNav = () => <nav data-testid="bottom-nav">Nav</nav>;
  return { __esModule: true, default: MockNav };
});

import DiaryPage from '@/app/diary/page';

describe('DiaryPage', () => {
  it('페이지 타이틀을 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('오늘의 감정 일기')).toBeInTheDocument();
  });

  it('캘린더 월 표시를 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('2024년 5월')).toBeInTheDocument();
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

  it('타임라인 항목을 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('조금 답답한 오후')).toBeInTheDocument();
    expect(screen.getByText('갑자기 울컥한 기분')).toBeInTheDocument();
    expect(screen.getByText('평온한 시작')).toBeInTheDocument();
  });

  it('시간 정보를 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('오후 2:30')).toBeInTheDocument();
    expect(screen.getByText('오전 11:15')).toBeInTheDocument();
    expect(screen.getByText('오전 8:00')).toBeInTheDocument();
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
    expect(screen.getByText('피곤')).toBeInTheDocument();
  });

  it('하단 네비게이션을 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('날짜들을 렌더링한다', () => {
    render(<DiaryPage />);

    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
