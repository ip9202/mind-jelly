/**
 * EmotionReportCard SPEC-UI-002 회귀/변경 테스트
 * SPEC-UI-003: 개인화 인사이트 섹션은 바텀시트 인사이트 탭으로 이동
 * @MX:SPEC: SPEC-UI-003
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

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

describe('EmotionReportCard - SPEC-UI-002 인라인 차트 제거', () => {
  const defaultData = {
    weeklyData: [
      { date: '2026-05-06', joy: 3, sadness: 1 },
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

  // AC-008: 인라인 차트 제거
  describe('AC-008: 인라인 차트 제거', () => {
    it('WeeklyTrendChart가 인라인에 렌더링되지 않아야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.queryByTestId('weekly-trend-chart')).not.toBeInTheDocument();
    });

    it('EmotionDonutChart가 인라인에 렌더링되지 않아야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.queryByTestId('emotion-donut-chart')).not.toBeInTheDocument();
    });

    it('요약 레이어(1단계)는 인라인에 표시되어야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByText(/오늘의 감정 리포트/)).toBeInTheDocument();
      expect(screen.getByTestId('emotion-face')).toBeInTheDocument();
    });

    it('인사이트 레이어(3단계)는 인라인에 표시되어야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      const adviceText = screen.getByText(/지금 이 순간을 음미하며/);
      expect(adviceText).toBeInTheDocument();
    });

    it('빈 데이터일 때 안내 메시지가 인라인에 유지되어야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.getByText(/아직 기록된 감정이 없어요/)).toBeInTheDocument();
    });
  });

  // 회귀: 기존 기능 유지
  describe('회귀: 기존 기능 유지', () => {
    it('glass-card 패턴이 유지되어야 함', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      const { container } = render(<EmotionReportCard />);

      const card = container.querySelector('.glass-card');
      expect(card).toBeInTheDocument();
    });

    it('EmotionDetailPanel이 제거되어야 함 (바텀시트로 이동)', async () => {
      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      expect(screen.queryByTestId('emotion-detail-panel')).not.toBeInTheDocument();
    });

    it('개인화 인사이트 섹션은 SPEC-UI-003에서 바텀시트로 이동하여 카드에 표시되지 않아야 함', async () => {
      mockInsights = {
        topEmotions: [{ emotion: 'joy', count: 5, percentage: 100 }],
        patternChange: null,
        streak: 3,
        currentInsight: {
          summary: '마음이 평온한 상태예요',
          advice: '평온한 조언',
        },
      };

      const { EmotionReportCard } = await import('../EmotionReportCard');
      render(<EmotionReportCard />);

      // SPEC-UI-003: 개인화 인사이트는 바텀시트 인사이트 탭으로 이동
      expect(screen.queryByText(/3일 연속 작성 중/)).not.toBeInTheDocument();
    });
  });
});
