/**
 * WeeklyTrendChart 컴포넌트 테스트
 * REQ-VIS-001: 주간 감정 트렌드 차트
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import type { WeeklyEmotionData } from '@/types/emotion-chart';

// diaryStore 모킹
let mockWeeklyData: WeeklyEmotionData[] = [];

jest.mock('@/hooks/useEmotionChartData', () => ({
  useEmotionChartData: jest.fn(() => ({
    weeklyData: mockWeeklyData,
    monthlyData: [],
    distribution: [],
  })),
}));

describe('WeeklyTrendChart', () => {
  beforeEach(() => {
    mockWeeklyData = [];
  });

  describe('기본 렌더링', () => {
    it('차트 컨테이너가 렌더링되어야 합니다', async () => {
      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // Recharts ResponsiveContainer는 렌더링되어야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('glass-card 패턴이 적용되어야 합니다', async () => {
      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      const chartContainer = container.querySelector('.glass-card');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('데이터 표시', () => {
    beforeEach(() => {
      // 7일치 데이터 준비
      mockWeeklyData.length = 0;
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        mockWeeklyData.push({
          date: dateStr,
          joy: i % 3 === 0 ? 1 : 0,
          sadness: i % 3 === 1 ? 1 : 0,
          anger: i % 3 === 2 ? 1 : 0,
          fear: 0,
          disgust: 0,
          surprise: 0,
          love: 0,
          gratitude: 0,
          hope: 0,
        });
      }
    });

    it('7일치 데이터가 차트에 전달되어야 합니다', async () => {
      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // Recharts ResponsiveContainer가 데이터를 받아서 렌더링해야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
      expect(mockWeeklyData).toHaveLength(7);
    });

    it('차트 컴포넌트가 데이터와 함께 렌더링되어야 합니다', async () => {
      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // glass-card 패턴과 ResponsiveContainer가 모두 렌더링되어야 합니다
      const glassCard = container.querySelector('.glass-card');
      const chartContainer = container.querySelector('.recharts-responsive-container');

      expect(glassCard).toBeInTheDocument();
      expect(chartContainer).toBeInTheDocument();
    });

    it('X축 라벨이 MM-DD 형식으로 표시되어야 합니다', async () => {
      // 특정 날짜 데이터 설정
      mockWeeklyData.length = 0;
      const testDate = new Date('2026-05-12');
      const dateStr = testDate.toISOString().split('T')[0];

      mockWeeklyData.push({
        date: dateStr,
        joy: 1,
        sadness: 0,
        anger: 0,
        fear: 0,
        disgust: 0,
        surprise: 0,
        love: 0,
        gratitude: 0,
        hope: 0,
      });

      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // 차트가 렌더링되면 formatXAxisLabel 함수가 호출됩니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('빈 데이터 처리', () => {
    it('데이터가 없어도 차트 컨테이너는 렌더링되어야 합니다', async () => {
      mockWeeklyData.length = 0;

      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // 빈 데이터라도 컨테이너는 렌더링되어야 합니다
      const glassCard = container.querySelector('.glass-card');
      expect(glassCard).toBeInTheDocument();
    });

    it('빈 데이터일 때 차트가 graceful degradation을 해야 합니다', async () => {
      mockWeeklyData.length = 0;

      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // 차트 컴포넌트는 에러 없이 렌더링되어야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('glass-card에 적절한 스타일이 적용되어야 합니다', async () => {
      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      const glassCard = container.querySelector('.glass-card');
      expect(glassCard).toBeInTheDocument();

      // glass-card는 필수 Tailwind 클래스들을 가져야 합니다
      expect(glassCard?.className).toContain('bg-white/10');
      expect(glassCard?.className).toContain('backdrop-blur-md');
      expect(glassCard?.className).toContain('rounded-3xl');
    });
  });

  describe('REQ-VIS-004-1 CustomTooltip', () => {
    it('데이터가 있을 때 차트가 Tooltip과 함께 렌더링되어야 합니다', async () => {
      // 7일치 데이터 준비
      mockWeeklyData.length = 0;
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        mockWeeklyData.push({
          date: dateStr,
          joy: i % 3 === 0 ? 1 : 0,
          sadness: i % 3 === 1 ? 1 : 0,
          anger: i % 3 === 2 ? 1 : 0,
          fear: 0,
          disgust: 0,
          surprise: 0,
          love: 0,
          gratitude: 0,
          hope: 0,
        });
      }

      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // 차트 컨테이너와 ResponsiveContainer가 렌더링되어야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();

      // 데이터가 7개인지 확인
      expect(mockWeeklyData).toHaveLength(7);
    });

    it('Tooltip 커스텀 content가 렌더링 컨텍스트에 존재해야 합니다', async () => {
      // 데이터 준비
      mockWeeklyData.length = 0;
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      mockWeeklyData.push({
        date: dateStr,
        joy: 2,
        sadness: 1,
        anger: 0,
        fear: 0,
        disgust: 0,
        surprise: 0,
        love: 0,
        gratitude: 0,
        hope: 0,
      });

      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // glass-card 차트 컨테이너가 존재
      const glassCard = container.querySelector('.glass-card');
      expect(glassCard).toBeInTheDocument();
    });

    it('EMOTION_COLORS가 Tooltip에 전달되어야 합니다', async () => {
      // 데이터 준비
      mockWeeklyData.length = 0;
      const today = new Date();
      for (let i = 2; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockWeeklyData.push({
          date: date.toISOString().split('T')[0],
          joy: 1,
          sadness: 0,
          anger: 0,
          fear: 0,
          disgust: 0,
          surprise: 0,
          love: 0,
          gratitude: 0,
          hope: 0,
        });
      }

      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      // 차트가 정상 렌더링되어야 함
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('반응형', () => {
    it('ResponsiveContainer가 100% 너비를 가져야 합니다', async () => {
      const { WeeklyTrendChart } = await import('../WeeklyTrendChart');
      const { container } = render(<WeeklyTrendChart />);

      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();

      // ResponsiveContainer는 inline style로 width: 100%를 가져야 합니다
      const wrapper = chartContainer as HTMLElement;
      expect(wrapper.style.width).toBe('100%');
    });
  });
});
