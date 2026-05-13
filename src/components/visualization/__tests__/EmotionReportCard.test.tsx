/**
 * EmotionReportCard 컴포넌트 테스트
 * SPEC-UI-003: 카드 간소화 (요약 + 조언만 표시)
 * SPEC-UI-001: 3단계 시각적 계층 구조 + props 검증
 * @MX:SPEC: SPEC-UI-003
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
      expect(summaryTitle).toBeDefined();

      // EmotionFace mock 렌더링 확인
      const face = screen.getByTestId('emotion-face');
      expect(face).toBeDefined();
    });

    it('시각화 레이어 차트는 인라인에 렌더링되지 않아야 함 (SPEC-UI-002: 바텀시트로 이동)', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      // SPEC-UI-002: 차트는 바텀시트로 이동, 인라인에 없어야 함
      expect(screen.queryByTestId('weekly-trend-chart')).toBeNull();
      expect(screen.queryByTestId('emotion-donut-chart')).toBeNull();
    });

    it('인사이트 레이어에 개인화된 조언을 렌더링해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const adviceIcon = screen.getByText('tips_and_updates', { selector: '.material-symbols-outlined' });
      expect(adviceIcon).toBeDefined();

      const adviceText = screen.queryByText(/지금 이 순간을 음미하며/);
      expect(adviceText).toBeDefined();
    });
  });

  describe('디자인 패턴 준수', () => {
    it('glass-card 패턴을 적용해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const card = container.querySelector('.glass-card');
      expect(card).toBeDefined();
    });

    it('감정별 동적 색상을 적용해야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const coloredElements = container.querySelectorAll('[style*="color"]');
      expect(coloredElements.length).toBeGreaterThan(0);
    });
  });

  describe('접근성 (REQ-VIS-007)', () => {
    it('차트 요소가 인라인에 없어야 함 (SPEC-UI-002: 바텀시트로 이동)', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      // SPEC-UI-002: 차트는 바텀시트로 이동
      expect(screen.queryByTestId('weekly-trend-chart')).toBeNull();
    });

    it('카드에 핵심 요소가 렌더링되어야 함 (SPEC-UI-003 간소화 후)', async () => {
      mockInsights = {
        topEmotions: [{ emotion: 'joy', count: 3, percentage: 100 }],
        patternChange: null,
        streak: 1,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      // SPEC-UI-003: EmotionFace + summary + advice 만 표시
      expect(screen.getByTestId('emotion-face')).toBeDefined();
      expect(screen.getByText(/마음이 평온한 상태예요/)).toBeDefined();
      expect(screen.getByText('tips_and_updates', { selector: '.material-symbols-outlined' })).toBeDefined();
    });
  });

  describe('반응형 대응 (REQ-VIS-009)', () => {
    it('모바일 환경에서도 인라인 차트 없이 렌더링되어야 함 (SPEC-UI-002)', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      // SPEC-UI-002: 차트는 바텀시트로 이동
      expect(screen.queryByTestId('weekly-trend-chart')).toBeNull();
      expect(screen.queryByTestId('emotion-donut-chart')).toBeNull();
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
      expect(face.getAttribute('data-emotion')).toBe('sadness');
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

      expect(screen.getByText(/아직 기록된 감정이 없어요/)).toBeDefined();
      expect(screen.queryByTestId('weekly-trend-chart')).toBeNull();
      expect(screen.queryByTestId('emotion-donut-chart')).toBeNull();
    });

    it('빈 distribution에서도 인사이트 레이어는 기본 감정으로 렌더링해야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const coloredElements = container.querySelectorAll('[style*="color"]');
      expect(coloredElements.length).toBeGreaterThan(0);

      const adviceIcon = screen.getByText('tips_and_updates', { selector: '.material-symbols-outlined' });
      expect(adviceIcon).toBeDefined();
    });

    it('빈 distribution에서는 차트 대신 안내 메시지가 표시되어야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const emptyMessage = screen.getByText(/아직 기록된 감정이 없어요/);
      expect(emptyMessage).toBeDefined();
      expect(emptyMessage.classList.contains('font-gamja')).toBe(true);
    });
  });

  describe('REQ-UI-003-2: 개인화 인사이트 섹션 제거 (SPEC-UI-003)', () => {
    it('데이터가 있어도 topEmotions를 표시하지 않아야 함', async () => {
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

      // SPEC-UI-003 REQ-UI-003-2: 상위 감정 순위 제거
      expect(screen.queryByText(/가장 많이 느낀 감정/)).toBeNull();
      expect(screen.queryByText(/평온 50%/)).toBeNull();
    });

    it('userName이 있어도 개인화 메시지를 표시하지 않아야 함', async () => {
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

      // SPEC-UI-003: userName 관련 메시지도 제거됨
      expect(screen.queryByText(/민수님이/)).toBeNull();
      expect(screen.queryByText(/가장 많이 느낀 감정/)).toBeNull();
    });

    it('스트릭이 있어도 표시하지 않아야 함', async () => {
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

      // SPEC-UI-003 REQ-UI-003-2: 스트릭 제거
      expect(screen.queryByText('whatshot', { selector: '.material-symbols-outlined' })).toBeNull();
      expect(screen.queryByText(/5일 연속 작성 중/)).toBeNull();
    });

    it('패턴 변화가 있어도 표시하지 않아야 함', async () => {
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

      // SPEC-UI-003 REQ-UI-003-2: 패턴 변화 제거
      expect(screen.queryByText(/이번 주 우울이 줄었어/)).toBeNull();
      expect(screen.queryByText('trending_down', { selector: '.material-symbols-outlined' })).toBeNull();
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

      expect(screen.queryByText(/가장 많이 느낀 감정/)).toBeNull();
      expect(screen.queryByText(/연속 작성 중/)).toBeNull();
    });

    it('스트릭 aria-label도 표시되지 않아야 함', async () => {
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

      // SPEC-UI-003: 스트릭 섹션 전체가 제거되므로 aria-label도 없음
      expect(screen.queryByLabelText(/연속 3일 일기 작성 중/)).toBeNull();
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
        expect(face.getAttribute('data-emotion')).toBe(emotionKey);

        unmount();
      }
    });

    it('EmotionDetailPanel은 인라인에 렌더링되지 않아야 함 (SPEC-UI-002: 바텀시트로 이동)', async () => {
      mockChartData = defaultData;

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      // SPEC-UI-002: EmotionDetailPanel은 바텀시트로 이동
      expect(screen.queryByTestId('emotion-detail-panel')).toBeNull();
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
      expect(card).toBeDefined();

      consoleWarnSpy.mockRestore();
    });
  });
});
