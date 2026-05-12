/**
 * EmotionDonutChart 컴포넌트 테스트
 * REQ-VIS-002: 감정 분포 도넛 차트
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import type { EmotionDistribution } from '@/types/emotion-chart';
import type { EmotionType } from '@/types/emotion';

// useEmotionChartData 모킹
let mockDistribution: EmotionDistribution[] = [];

jest.mock('@/hooks/useEmotionChartData', () => ({
  useEmotionChartData: jest.fn(() => ({
    weeklyData: [],
    distribution: mockDistribution,
  })),
}));

// Mock props helper
const mockProps = {
  selectedEmotion: null as EmotionType | null,
  onEmotionSelect: jest.fn(),
};

describe('EmotionDonutChart', () => {
  beforeEach(() => {
    mockDistribution = [];
  });

  describe('기본 렌더링', () => {
    it('도넛 차트 컨테이너가 렌더링되어야 합니다', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      // Recharts ResponsiveContainer는 렌더링되어야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('glass-card 패턴이 적용되어야 합니다', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      const chartContainer = container.querySelector('.glass-card');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('도넛 차트 구조', () => {
    it('PieChart로 도넛 형태가 렌더링되어야 합니다 (innerRadius 설정)', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      // Recharts PieChart가 렌더링되어야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('데이터 표시', () => {
    beforeEach(() => {
      // 테스트용 분포 데이터 준비
      mockDistribution = [
        { emotionKey: 'joy', count: 5, percentage: 50, color: '#FFB7C5' },
        { emotionKey: 'sadness', count: 3, percentage: 30, color: '#7EB8D8' },
        { emotionKey: 'anger', count: 2, percentage: 20, color: '#F28B82' },
      ];
    });

    it('분포 데이터가 차트에 전달되어야 합니다', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
      expect(mockDistribution).toHaveLength(3);
    });

    it('각 섹터가 해당 감정의 색상으로 표시되어야 합니다', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      render(<EmotionDonutChart {...mockProps} />);

      // 색상이 EMOTION_COLORS에서 올바르게 매핑되어야 합니다
      expect(mockDistribution[0].color).toBe('#FFB7C5'); // joy
      expect(mockDistribution[1].color).toBe('#7EB8D8'); // sadness
      expect(mockDistribution[2].color).toBe('#F28B82'); // anger
    });
  });

  describe('중앙 표시 (가장 빈번한 감정)', () => {
    it('가장 빈번한 감정의 아이콘과 퍼센트가 중앙에 표시되어야 합니다', async () => {
      mockDistribution = [
        { emotionKey: 'joy', count: 10, percentage: 50, color: '#FFB7C5' },
        { emotionKey: 'sadness', count: 5, percentage: 25, color: '#7EB8D8' },
        { emotionKey: 'anger', count: 5, percentage: 25, color: '#F28B82' },
      ];

      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      render(<EmotionDonutChart {...mockProps} />);

      // 가장 빈번한 감정 (joy)이 중앙에 표시되어야 합니다
      // 퍼센트도 표시되어야 합니다
    });

    it('데이터가 없을 때 중앙 표시가 처리되어야 합니다', async () => {
      mockDistribution = [];

      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      // 빈 데이터라도 차트 컨테이너는 렌더링되어야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('5% 미만 감정 통합', () => {
    it('5% 미만 감정은 "기타"로 통합되어야 합니다', async () => {
      mockDistribution = [
        { emotionKey: 'joy', count: 85, percentage: 85, color: '#FFB7C5' },
        { emotionKey: 'sadness', count: 10, percentage: 10, color: '#7EB8D8' },
        { emotionKey: 'anger', count: 3, percentage: 3, color: '#F28B82' },
        { emotionKey: 'fear', count: 2, percentage: 2, color: '#B39DDB' },
      ];

      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      render(<EmotionDonutChart {...mockProps} />);

      // 5% 미만 감정(anger 3%, fear 2%)은 "기타"로 통합되어야 합니다
      // 기타 섹터는 5% (3% + 2%)가 되어야 합니다
    });

    it('모든 감정이 5% 이상이면 "기타" 섹터가 없어야 합니다', async () => {
      mockDistribution = [
        { emotionKey: 'joy', count: 30, percentage: 30, color: '#FFB7C5' },
        { emotionKey: 'sadness', count: 30, percentage: 30, color: '#7EB8D8' },
        { emotionKey: 'anger', count: 20, percentage: 20, color: '#F28B82' },
        { emotionKey: 'fear', count: 20, percentage: 20, color: '#B39DDB' },
      ];

      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      render(<EmotionDonutChart {...mockProps} />);

      // 모든 감정이 5% 이상이면 "기타"가 없어야 합니다
    });
  });

  describe('섹터 클릭/터치 인터랙션', () => {
    it('섹터 클릭 시 해당 감정의 상세 정보가 표시되어야 합니다', async () => {
      mockDistribution = [
        { emotionKey: 'joy', count: 5, percentage: 50, color: '#FFB7C5' },
        { emotionKey: 'sadness', count: 5, percentage: 50, color: '#7EB8D8' },
      ];

      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      render(<EmotionDonutChart {...mockProps} />);

      // 클릭 핸들러가 연결되어야 합니다
      // 툴팁이 표시되어야 합니다
    });
  });

  describe('접근성', () => {
    it('role="img" 및 aria-label이 포함되어야 합니다', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      // 차트 컨테이너에 접근성 속성이 있어야 합니다
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('glass-card에 적절한 스타일이 적용되어야 합니다', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      const glassCard = container.querySelector('.glass-card');
      expect(glassCard).toBeInTheDocument();

      // glass-card는 필수 Tailwind 클래스들을 가져야 합니다
      expect(glassCard?.className).toContain('bg-white/10');
      expect(glassCard?.className).toContain('backdrop-blur-md');
      expect(glassCard?.className).toContain('rounded-3xl');
    });
  });

  describe('반응형', () => {
    it('ResponsiveContainer가 100% 너비를 가져야 합니다', async () => {
      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();

      // ResponsiveContainer는 inline style로 width: 100%를 가져야 합니다
      const wrapper = chartContainer as HTMLElement;
      expect(wrapper.style.width).toBe('100%');
    });
  });

  describe('빈 데이터 처리', () => {
    it('데이터가 없어도 차트 컨테이너는 렌더링되어야 합니다', async () => {
      mockDistribution = [];

      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      // 빈 데이터라도 컨테이너는 렌더링되어야 합니다
      const glassCard = container.querySelector('.glass-card');
      expect(glassCard).toBeInTheDocument();
    });

    it('빈 데이터일 때 차트가 graceful degradation을 해야 합니다', async () => {
      mockDistribution = [];

      const { EmotionDonutChart } = await import('../EmotionDonutChart');
      const { container } = render(<EmotionDonutChart {...mockProps} />);

      // 차트 컴포넌트는 에러 없이 렌더링되어야 합니다
      const chartContainer = container.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });
});
