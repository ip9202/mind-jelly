/**
 * EmotionStatsBottomSheet 컴포넌트 테스트
 * SPEC-UI-002: 감정 통계 바텀시트 모달
 * AC-001 ~ AC-014 인수 테스트 시나리오
 * @MX:SPEC: SPEC-UI-002
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock hooks
let mockChartData: {
  weeklyData: Array<Record<string, unknown>>;
  distribution: Array<{ emotionKey: string; percentage: number; count: number; color: string }>;
};

jest.mock('@/hooks/useEmotionChartData', () => ({
  useEmotionChartData: jest.fn(() => mockChartData),
}));

jest.mock('../WeeklyTrendChart', () => ({
  WeeklyTrendChart: () => (
    <div data-testid="weekly-trend-chart" role="img" aria-label="주간 감정 트렌드 차트">
      WeeklyTrendChart
    </div>
  ),
}));

jest.mock('../EmotionDonutChart', () => ({
  EmotionDonutChart: ({ onEmotionSelect }: { onEmotionSelect?: (e: string) => void }) => (
    <div data-testid="emotion-donut-chart" role="img" aria-label="감정 분포 도넛 차트">
      <button
        data-testid="donut-sector-joy"
        onClick={() => onEmotionSelect?.('joy')}
      >
        joy sector
      </button>
    </div>
  ),
}));

jest.mock('../EmotionDetailPanel', () => ({
  EmotionDetailPanel: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="emotion-detail-panel" data-open={String(isOpen)}>
      EmotionDetailPanel
    </div>
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

describe('EmotionStatsBottomSheet - SPEC-UI-002', () => {
  const mockOnClose = jest.fn();
  const mockTriggerRef = { current: document.createElement('button') };

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

  beforeEach(() => {
    mockChartData = defaultData;
    mockOnClose.mockClear();

    // window.matchMedia mock (jsdom에 없음)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  // AC-001: 바텀시트 열기
  describe('AC-001: 바텀시트 열기', () => {
    it('isOpen=false일 때 아무것도 렌더링하지 않아야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      const { container } = render(
        <EmotionStatsBottomSheet isOpen={false} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );
      expect(container.innerHTML).toBe('');
    });

    it('isOpen=true일 때 바텀시트가 렌더링되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const sheet = screen.getByRole('dialog');
      expect(sheet).toBeInTheDocument();
    });

    it('바텀시트 내부에 WeeklyTrendChart가 렌더링되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      expect(screen.getByTestId('weekly-trend-chart')).toBeInTheDocument();
    });

    it('바텀시트 내부에 EmotionDonutChart가 탭 전환 후 렌더링되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      // 기본 상태에서는 WeeklyTrendChart만 렌더링됨
      expect(screen.getByTestId('weekly-trend-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('emotion-donut-chart')).not.toBeInTheDocument();

      // 도넛 탭으로 전환
      const donutTabButton = screen.getByRole('button', { name: '도넛 차트' });
      await userEvent.click(donutTabButton);

      // 도넛 차트가 렌더링되는지 확인
      await waitFor(() => {
        expect(screen.getByTestId('emotion-donut-chart')).toBeInTheDocument();
      });
    });

    it('드래그 핸들이 표시되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const handle = screen.getByTestId('drag-handle');
      expect(handle).toBeInTheDocument();
    });

    it('백드롭 오버레이가 표시되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const backdrop = screen.getByTestId('backdrop');
      expect(backdrop).toBeInTheDocument();
    });
  });

  // AC-002: 백드롭 탭으로 닫기
  describe('AC-002: 백드롭 탭으로 바텀시트 닫기', () => {
    it('백드롭을 클릭하면 onClose가 호출되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const backdrop = screen.getByTestId('backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // AC-003: 드래그 핸들 스와이프다운으로 닫기
  describe('AC-003: 드래그 핸들 스와이프다운으로 닫기', () => {
    it('드래그 핸들을 아래로 50px 이상 스와이프하면 onClose가 호출되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const handle = screen.getByTestId('drag-handle');

      // 터치 시작
      fireEvent.touchStart(handle, {
        touches: [{ clientY: 100, clientX: 0 }],
      });

      // 50px 아래로 스와이프
      fireEvent.touchMove(handle, {
        touches: [{ clientY: 160, clientX: 0 }],
      });

      // 터치 끝
      fireEvent.touchEnd(handle);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('50px 미만 스와이프에는 onClose가 호출되지 않아야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const handle = screen.getByTestId('drag-handle');

      // 터치 시작
      fireEvent.touchStart(handle, {
        touches: [{ clientY: 100, clientX: 0 }],
      });

      // 30px 아래로 스와이프 (50px 미만)
      fireEvent.touchMove(handle, {
        touches: [{ clientY: 130, clientX: 0 }],
      });

      fireEvent.touchEnd(handle);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // AC-004: ESC 키로 닫기
  describe('AC-004: ESC 키로 바텀시트 닫기', () => {
    it('ESC 키를 누르면 onClose가 호출되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // AC-005: 닫기 버튼으로 닫기
  describe('AC-005: 닫기 버튼으로 바텀시트 닫기', () => {
    it('닫기 버튼을 클릭하면 onClose가 호출되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const closeButton = screen.getByLabelText('감정 통계 닫기');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // AC-009: 바텀시트 내 차트 인터랙션
  describe('AC-009: 바텀시트 내 차트 인터랙션', () => {
    it('도넛 차트 섹터 클릭 시 EmotionDetailPanel이 표시되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      // 먼저 도넛 탭으로 전환
      const donutTabButton = screen.getByRole('button', { name: '도넛 차트' });
      await userEvent.click(donutTabButton);

      // 도넛 차트가 렌더링될 때까지 기다린 후 섹터 클릭
      await waitFor(() => {
        const sector = screen.getByTestId('donut-sector-joy');
        expect(sector).toBeInTheDocument();
      });

      const sector = screen.getByTestId('donut-sector-joy');
      await userEvent.click(sector);

      const panel = screen.getByTestId('emotion-detail-panel');
      expect(panel).toHaveAttribute('data-open', 'true');
    });
  });

  // AC-011: 접근성 속성
  describe('AC-011: 접근성 속성', () => {
    it('role="dialog" 속성이 있어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('aria-modal="true" 속성이 있어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('aria-label="감정 통계" 속성이 있어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', '감정 통계');
    });

    it('백드롭에 aria-hidden="true"가 있어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const backdrop = screen.getByTestId('backdrop');
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // AC-013: reduced-motion 대응
  describe('AC-013: reduced-motion 대응', () => {
    it('prefers-reduced-motion이 설정되면 애니메이션 없이 즉시 표시되어야 함', async () => {
      // reduced-motion matchMedia mock
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      const { container } = render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      // reduced-motion 시 animation class가 없어야 함
      const sheet = container.querySelector('[data-testid="sheet-content"]');
      expect(sheet).toBeInTheDocument();
      expect(sheet?.className).not.toContain('animate-slide-up');
    });
  });

  // AC-014: 빈 데이터 상태
  describe('AC-014: 빈 데이터 상태', () => {
    it('데이터가 없을 때 바텀시트가 열리고 빈 상태 메시지가 표시되어야 함', async () => {
      mockChartData = { weeklyData: [], distribution: [] };

      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/아직 기록된 감정이 없어요/)).toBeInTheDocument();
    });
  });

  // UI 제약사항: max-h-[85vh]
  describe('UI 제약사항', () => {
    it('바텀시트 최대 높이가 85vh로 제한되어야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      const { container } = render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const sheetContent = container.querySelector('[data-testid="sheet-content"]');
      expect(sheetContent).toBeInTheDocument();
      // max-h-[85vh] class check
      expect(sheetContent?.className).toContain('max-h-[85vh]');
    });

    it('바텀시트가 glass-card 패턴을 따라야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      const { container } = render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      const sheetContent = container.querySelector('[data-testid="sheet-content"]');
      expect(sheetContent?.className).toContain('glass-card');
    });

    it('드래그 핸들이 올바른 스타일을 가져야 함', async () => {
      const { EmotionStatsBottomSheet } = await import('../EmotionStatsBottomSheet');
      const { container } = render(
        <EmotionStatsBottomSheet isOpen={true} onClose={mockOnClose} triggerRef={mockTriggerRef} />
      );

      // drag-handle wrapper 내부에 bg-gray-300 막대가 있어야 함
      const handleBar = container.querySelector('.bg-gray-300');
      expect(handleBar).toBeInTheDocument();
    });
  });
});
