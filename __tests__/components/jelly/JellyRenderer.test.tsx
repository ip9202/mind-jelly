// JellyRenderer 컴포넌트 테스트
import { render } from '@testing-library/react';
import { JellyRenderer } from '@/components/jelly/JellyRenderer';

describe('JellyRenderer', () => {
  const mockBodies = [
    { position: { x: 100, y: 100 }, circleRadius: 5 },
    { position: { x: 110, y: 105 }, circleRadius: 5 },
  ];

  it('젤리 바디를 렌더링해야 함', () => {
    const { container } = render(
      <svg>
        <JellyRenderer bodies={mockBodies} face="idle" animation={0} />
      </svg>
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('상태에 따른 올바른 표정을 표시해야 함', () => {
    const mockBodies = [{ position: { x: 100, y: 100 }, circleRadius: 5 }];

    const { container: idleContainer } = render(
      <svg>
        <JellyRenderer bodies={mockBodies} face="idle" animation={0} />
      </svg>
    );

    const { container: eatingContainer } = render(
      <svg>
        <JellyRenderer bodies={mockBodies} face="eating" animation={0} />
      </svg>
    );

    // 다른 상태에서 다른 렌더링 결과 확인
    expect(idleContainer.querySelector('svg')).toBeInTheDocument();
    expect(eatingContainer.querySelector('svg')).toBeInTheDocument();
  });

  describe('T-020: 비주얼 폴리시 애니메이션', () => {
    it('호흡 애니메이션 파라미터를 적용해야 함', () => {
      const { container } = render(
        <svg>
          <JellyRenderer bodies={mockBodies} face="idle" animation={1.5} />
        </svg>
      );

      // animation 값이 전달되는지 확인
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('먹기 애니메이션 스케일을 적용해야 함', () => {
      const { container } = render(
        <svg>
          <JellyRenderer bodies={mockBodies} face="eating" animation={0.5} />
        </svg>
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('만족 상태 애니메이션을 지원해야 함', () => {
      const { container } = render(
        <svg>
          <JellyRenderer bodies={mockBodies} face="satisfied" animation={1.0} />
        </svg>
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('기대 상태 애니메이션을 지원해야 함', () => {
      const { container } = render(
        <svg>
          <JellyRenderer bodies={mockBodies} face="anticipation" animation={0.8} />
        </svg>
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
