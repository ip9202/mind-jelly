/**
 * EmotionDetailPanel 컴포넌트 테스트
 * REQ-VIS-004: 인터랙티브 요소 검증
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import { EmotionDetailPanel } from '../EmotionDetailPanel';

// Mock dependencies
jest.mock('@/hooks/useEmotionChartData', () => ({
  useEmotionChartData: () => ({
    weeklyData: [
      { date: '2026-05-06', joy: 3, sadness: 1 },
      { date: '2026-05-07', joy: 2, sadness: 2 },
    ],
    distribution: [
      { emotionKey: 'joy', percentage: 55, count: 11, color: '#FFD93D' },
    ],
  }),
}));

describe('EmotionDetailPanel - REQ-VIS-004', () => {
  describe('슬라이드업 패널 기능', () => {
    it('isOpen이 true일 때 패널을 렌더링해야 함', () => {
      render(<EmotionDetailPanel isOpen={true} emotionKey="joy" onClose={() => {}} />);

      // 패널 컨테이너 확인
      const panel = screen.queryByTestId('emotion-detail-panel');
      expect(panel).toBeInTheDocument();
    });

    it('isOpen이 false일 때 패널을 렌더링하지 않아야 함', () => {
      render(<EmotionDetailPanel isOpen={false} emotionKey="joy" onClose={() => {}} />);

      // 패널이 렌더링되지 않아야 함
      const panel = screen.queryByTestId('emotion-detail-panel');
      expect(panel).not.toBeInTheDocument();
    });

    it('닫기 버튼을 렌더링해야 함', () => {
      render(<EmotionDetailPanel isOpen={true} emotionKey="joy" onClose={() => {}} />);

      // 닫기 버튼 확인
      const closeButton = screen.getByRole('button', { name: /닫기/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 onClose를 호출해야 함', () => {
      const handleClose = jest.fn();
      render(<EmotionDetailPanel isOpen={true} emotionKey="joy" onClose={handleClose} />);

      // 닫기 버튼 클릭
      const closeButton = screen.getByRole('button', { name: /닫기/i });
      fireEvent.click(closeButton);

      // onClose 호출 확인
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('선택된 감정의 일별 상세 내역을 표시해야 함', () => {
      render(<EmotionDetailPanel isOpen={true} emotionKey="joy" onClose={() => {}} />);

      // 감정 라벨 확인 (joy → 평온)
      const emotionLabel = screen.queryByText(/평온/);
      expect(emotionLabel).toBeInTheDocument();

      // 일별 상세 내역 확인 (날짜 또는 카운트)
      const detailContent = screen.queryByText(/\d+회/); // "X회 정화" 확인
      expect(detailContent).toBeInTheDocument();
    });
  });

  describe('애니메이션 (REQ-VIS-004)', () => {
    it('transition-all duration-300 클래스를 적용해야 함', () => {
      const { container } = render(<EmotionDetailPanel isOpen={true} emotionKey="joy" onClose={() => {}} />);

      // transition 클래스 확인
      const panel = container.querySelector('[class*="transition-all"]');
      expect(panel).toBeInTheDocument();

      // duration-300 확인
      const animatedElement = container.querySelector('[class*="duration-300"]');
      expect(animatedElement).toBeInTheDocument();
    });
  });

  describe('접근성 (REQ-VIS-007)', () => {
    it('role="dialog" 속성을 포함해야 함', () => {
      const { container } = render(<EmotionDetailPanel isOpen={true} emotionKey="joy" onClose={() => {}} />);

      // role="dialog" 확인
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it('aria-modal="true" 속성을 포함해야 함', () => {
      const { container } = render(<EmotionDetailPanel isOpen={true} emotionKey="joy" onClose={() => {}} />);

      // aria-modal 확인
      const modal = container.querySelector('[aria-modal="true"]');
      expect(modal).toBeInTheDocument();
    });
  });
});
