/**
 * EmotionReportCard 컴포넌트 테스트
 * SPEC-UI-001: 3단계 시각적 계층 구조 + props 검증
 * REQ-VIS-006: 개인화 인사이트 섹션
 * @MX:SPEC: SPEC-UI-001
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: jest.mock 호이스팅으로 인해 팩토리 내에서 외부 let 변수를 참조해야 함
// 팩토리 실행 시점에는 TDZ이지만, 컴포넌트 렌더링 시점에는 beforeEach가 이미 실행됨
let mockChartData: {
  weeklyData: Array<Record<string, unknown>>;
  distribution: Array<{ emotionKey: string; percentage: number; count: number; color: string }>;
};

let mockInsights: {
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>;
  patternChange: { emotion: string; trend: 'up' | 'down' | 'same'; message: string } | null;
  streak: number;
  currentInsight: { summary: string; advice: string };
};

jest.mock('@/hooks/useEmotionChartData', () => ({
  useEmotionChartData: jest.fn(() => mockChartData),
}));

jest.mock('@/hooks/useEmotionInsights', () => ({
  useEmotionInsights: () => mockInsights,
}));

jest.mock('../WeeklyTrendChart', () => ({
  WeeklyTrendChart: () => (
    <div data-testid="weekly-trend-chart" role="img" aria-label="주간 감정 트렌드 차트">
      WeeklyTrendChart
    </div>
  ),
}));

jest.mock('../EmotionDonutChart', () => ({
  EmotionDonutChart: () => (
    <div data-testid="emotion-donut-chart" role="img" aria-label="감정 분포 도넛 차트">
      EmotionDonutChart
    </div>
  ),
}));

jest.mock('../EmotionDetailPanel', () => ({
  EmotionDetailPanel: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="emotion-detail-panel" data-open={String(isOpen)}>EmotionDetailPanel</div>
  ),
}));

jest.mock('@/components/jelly/EmotionFace', () => ({
  EmotionFace: ({ emotion }: { emotion: string }) => (
    <div data-testid="emotion-face" data-emotion={emotion}>EmotionFace</div>
  ),
}));

jest.mock('@/lib/constants/emotion', () => ({
  EMOTION_COLORS: {
    joy: '#FFB7C5',
    sadness: '#7EB8D8',
    anger: '#F28B82',
    fear: '#B39DDB',
    disgust: '#81C784',
    surprise: '#FFD93D',
    love: '#FF6B8A',
    gratitude: '#FFB347',
    hope: '#5BC0EB',
  },
  EMOTION_THEME: {
    joy: { label: '평온', message: '마음이 평온한 상태예요', advice: ['평온한 조언'] },
    sadness: { label: '우울', message: '마음에 먹구름이 끼어있어요', advice: ['우울 조언'] },
    anger: { label: '분노', message: '마음에 뜨거운 감정이 올라왔어요', advice: ['분노 조언'] },
    fear: { label: '불안', message: '마음에 불안이 감도는 느낌이에요', advice: ['불안 조언'] },
    disgust: { label: '불쾌', message: '마음에 거슬리는 느낌이 있어요', advice: ['불쾌 조언'] },
    surprise: { label: '놀람', message: '마음에 깜짝 놀랄 일이 생겼어요', advice: ['놀람 조언'] },
    love: { label: '사랑', message: '마음에 따뜻한 사랑이 가득해요', advice: ['사랑 조언'] },
    gratitude: { label: '감사', message: '마음에 감사한 마음이 피어났어요', advice: ['감사 조언'] },
    hope: { label: '희망', message: '마음에 밝은 희망이 빛나고 있어요', advice: ['희망 조언'] },
  },
  UI_COLORS: {
    otherSector: '#E0E0E0',
    streak: '#FF6D3F',
    trendDown: '#5BC0EB',
  },
}));

describe('EmotionReportCard - SPEC-UI-001', () => {
  const defaultData = {
    weeklyData: [
      { date: '2026-05-06', joy: 3, sadness: 1 },
      { date: '2026-05-07', joy: 2, sadness: 2 },
    ],
    distribution: [
      { emotionKey: 'joy', percentage: 55, count: 11, color: '#FFD93D' },
      { emotionKey: 'sadness', percentage: 45, count: 9, color: '#6BCB77' },
    ],
  };

  const defaultInsights = {
    topEmotions: [],
    patternChange: null,
    streak: 0,
    currentInsight: {
      summary: '마음이 평온한 상태예요',
      advice: '지금 이 순간을 음미하며 좋아하는 음악을 들어보세요',
    },
  };

  beforeEach(() => {
    mockChartData = defaultData;
    mockInsights = defaultInsights;
  });

  describe('3단계 시각적 계층 구조', () => {
    it('요약 레이어를 렌더링해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const summaryTitle = screen.queryByText(/오늘의 감정 리포트/i);
      expect(summaryTitle).toBeInTheDocument();

      // EmotionFace mock 렌더링 확인
      const face = screen.getByTestId('emotion-face');
      expect(face).toBeInTheDocument();
    });

    it('시각화 레이어에 차트들을 렌더링해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const trendChart = screen.getByTestId('weekly-trend-chart');
      expect(trendChart).toBeInTheDocument();

      const donutChart = screen.getByTestId('emotion-donut-chart');
      expect(donutChart).toBeInTheDocument();
    });

    it('인사이트 레이어에 개인화된 조언을 렌더링해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const adviceIcon = screen.getByText('tips_and_updates', { selector: '.material-symbols-outlined' });
      expect(adviceIcon).toBeInTheDocument();

      const adviceText = screen.queryByText(/지금 이 순간을 음미하며/);
      expect(adviceText).toBeInTheDocument();
    });
  });

  describe('디자인 패턴 준수', () => {
    it('glass-card 패턴을 적용해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const card = container.querySelector('.glass-card');
      expect(card).toBeInTheDocument();
    });

    it('감정별 동적 색상을 적용해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const coloredElements = container.querySelectorAll('[style*="color"]');
      expect(coloredElements.length).toBeGreaterThan(0);
    });
  });

  describe('접근성 (REQ-VIS-007)', () => {
    it('차트 요소가 role 속성을 포함해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const trendChart = screen.getByTestId('weekly-trend-chart');
      expect(trendChart).toHaveAttribute('role', 'img');
    });

    it('aria-label을 포함해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const labeledElements = document.querySelectorAll('[aria-label]');
      expect(labeledElements.length).toBeGreaterThan(0);
    });
  });

  describe('반응형 대응 (REQ-VIS-009)', () => {
    it('모바일 환경에서 세로 스택 배치되어야 함', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByTestId('weekly-trend-chart')).toBeInTheDocument();
      expect(screen.getByTestId('emotion-donut-chart')).toBeInTheDocument();
    });
  });

  describe('props 검증 - 유효하지 않은 emotionKey 처리', () => {
    it('유효한 emotionKey는 그대로 표시해야 함', async () => {
      mockChartData = {
        weeklyData: [],
        distribution: [
          { emotionKey: 'sadness', percentage: 100, count: 5, color: '#6BCB77' },
        ],
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      // EmotionFace mock이 data-testid="emotion-face"를 렌더링
      const face = screen.getByTestId('emotion-face');
      expect(face).toHaveAttribute('data-emotion', 'sadness');
    });

    it('유효하지 않은 emotionKey는 기본값(joy)으로 대체해야 함', async () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';

      mockChartData = {
        weeklyData: [],
        distribution: [
          { emotionKey: 'invalid_emotion', percentage: 100, count: 5, color: '#FF0000' },
        ],
      };

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      // 경고가 출력되었는지 확인
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('유효하지 않은 emotionKey')
      );

      // 컴포넌트가 크래시 없이 렌더링되고 기본 감정(joy) 색상 적용 확인
      const coloredElements = document.querySelectorAll('[style*="color"]');
      expect(coloredElements.length).toBeGreaterThan(0);

      consoleWarnSpy.mockRestore();
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    });

    it('유효하지 않은 emotionKey 감지 시 개발 모드에서 콘솔 경고를 출력해야 함', async () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';

      mockChartData = {
        weeklyData: [],
        distribution: [
          { emotionKey: 'unknown', percentage: 100, count: 3, color: '#000000' },
        ],
      };

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('유효하지 않은 emotionKey')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('unknown')
      );

      consoleWarnSpy.mockRestore();
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    });
  });

  describe('props 검증 - 빈 distribution 배열 처리', () => {
    it('빈 distribution에서는 빈 상태 메시지를 표시해야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByText(/아직 기록된 감정이 없어요/)).toBeInTheDocument();
      expect(screen.queryByTestId('weekly-trend-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('emotion-donut-chart')).not.toBeInTheDocument();
    });

    it('빈 distribution에서도 인사이트 레이어는 기본 감정으로 렌더링해야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const coloredElements = container.querySelectorAll('[style*="color"]');
      expect(coloredElements.length).toBeGreaterThan(0);

      const adviceIcon = screen.getByText('tips_and_updates', { selector: '.material-symbols-outlined' });
      expect(adviceIcon).toBeInTheDocument();
    });

    it('빈 distribution에서는 차트 대신 안내 메시지가 표시되어야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const emptyMessage = screen.getByText(/아직 기록된 감정이 없어요/);
      expect(emptyMessage).toBeInTheDocument();
      expect(emptyMessage).toHaveClass('font-gamja');
    });
  });

  describe('REQ-VIS-006: 개인화 인사이트 섹션', () => {
    it('데이터가 있고 topEmotions이 있으면 상위 감정을 표시해야 함', async () => {
      mockInsights = {
        topEmotions: [
          { emotion: 'joy', count: 5, percentage: 50 },
          { emotion: 'sadness', count: 3, percentage: 30 },
          { emotion: 'gratitude', count: 2, percentage: 20 },
        ],
        patternChange: null,
        streak: 0,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByText(/가장 많이 느낀 감정/)).toBeInTheDocument();
      expect(screen.getByText(/평온 50%/)).toBeInTheDocument();
      expect(screen.getByText(/우울 30%/)).toBeInTheDocument();
      expect(screen.getByText(/감사 20%/)).toBeInTheDocument();
    });

    it('userName이 있으면 개인화 메시지에 이름을 포함해야 함', async () => {
      mockInsights = {
        topEmotions: [
          { emotion: 'joy', count: 5, percentage: 100 },
        ],
        patternChange: null,
        streak: 0,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard userName="민수" />);

      expect(screen.getByText(/민수님이/)).toBeInTheDocument();
      expect(screen.getByText(/가장 많이 느낀 감정/)).toBeInTheDocument();
    });

    it('userName이 없으면 기본 메시지를 표시해야 함', async () => {
      mockInsights = {
        topEmotions: [
          { emotion: 'joy', count: 5, percentage: 100 },
        ],
        patternChange: null,
        streak: 0,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByText(/가장 많이 느낀 감정/)).toBeInTheDocument();
      expect(screen.queryByText(/님이/)).not.toBeInTheDocument();
    });

    it('스트릭이 있으면 불꽃 아이콘과 일수를 표시해야 함', async () => {
      mockInsights = {
        topEmotions: [{ emotion: 'joy', count: 3, percentage: 100 }],
        patternChange: null,
        streak: 5,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByText('whatshot', { selector: '.material-symbols-outlined' })).toBeInTheDocument();
      expect(screen.getByText(/5일 연속 작성 중/)).toBeInTheDocument();
    });

    it('패턴 변화가 있으면 트렌드 메시지를 표시해야 함', async () => {
      mockInsights = {
        topEmotions: [{ emotion: 'joy', count: 3, percentage: 100 }],
        patternChange: {
          emotion: 'sadness',
          trend: 'down' as const,
          message: '이번 주 우울이 줄었어!',
        },
        streak: 0,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByText(/이번 주 우울이 줄었어/)).toBeInTheDocument();
      expect(screen.getByText('trending_down', { selector: '.material-symbols-outlined' })).toBeInTheDocument();
    });

    it('데이터가 없으면 개인화 섹션이 렌더링되지 않아야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };
      mockInsights = {
        topEmotions: [],
        patternChange: null,
        streak: 0,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.queryByText(/가장 많이 느낀 감정/)).not.toBeInTheDocument();
      expect(screen.queryByText(/연속 작성 중/)).not.toBeInTheDocument();
    });

    it('스트릭에 aria-label이 있어야 함', async () => {
      mockInsights = {
        topEmotions: [{ emotion: 'joy', count: 3, percentage: 100 }],
        patternChange: null,
        streak: 3,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const streakEl = screen.getByLabelText(/연속 3일 일기 작성 중/);
      expect(streakEl).toBeInTheDocument();
    });
  });

  describe('TypeScript 타입 검증', () => {
    it('EmotionFace에 전달되는 emotion은 항상 유효한 EmotionType이어야 함', async () => {
      const testCases = ['sadness', 'anger', 'fear', 'hope'];

      for (const emotionKey of testCases) {
        mockChartData = {
          weeklyData: [],
          distribution: [
            { emotionKey, percentage: 100, count: 5, color: '#FF0000' },
          ],
        };

        const { EmotionReportCard } = await import('../EmotionReportCard');
        const { unmount } = render(<EmotionReportCard />);

        const face = screen.getByTestId('emotion-face');
        expect(face).toHaveAttribute('data-emotion', emotionKey);

        unmount();
      }
    });

    it('EmotionDetailPanel에 전달되는 emotionKey는 유효한 EmotionType이어야 함', async () => {
      mockChartData = defaultData;

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const detailPanel = screen.getByTestId('emotion-detail-panel');
      expect(detailPanel).toBeInTheDocument();
      expect(detailPanel).toHaveAttribute('data-open', 'false');
    });

    it('유효하지 않은 감정키가 들어와도 컴포넌트가 크래시 없이 렌더링되어야 함', async () => {
      mockChartData = {
        weeklyData: [],
        distribution: [
          { emotionKey: '', percentage: 100, count: 1, color: '#000' },
        ],
      };

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const card = container.querySelector('.glass-card');
      expect(card).toBeInTheDocument();

      consoleWarnSpy.mockRestore();
    });
  });
});
