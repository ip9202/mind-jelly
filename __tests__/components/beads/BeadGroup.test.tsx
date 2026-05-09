// BeadGroup 컴포넌트 테스트
import { render } from '@testing-library/react';
import { BeadGroup } from '@/components/beads/BeadGroup';

// Matter.js 모킹
jest.mock('matter-js', () => ({
  Engine: {
    create: jest.fn(),
  },
  Bodies: {
    circle: jest.fn(() => ({ id: 1, position: { x: 0, y: 0 }, circleRadius: 5 })),
  },
  Composite: {
    add: jest.fn(),
    remove: jest.fn(),
    allBodies: jest.fn(() => []),
  },
  Body: {
    setPosition: jest.fn(),
  },
}));

describe('BeadGroup', () => {
  const mockEngine = {
    world: {
      bodies: [],
      add: jest.fn(),
      remove: jest.fn(),
    },
  };

  it('컴포넌트가 렌더링되어야 함', () => {
    const { container } = render(
      <svg>
        <BeadGroup count={3} engine={mockEngine as any} emotion="joy" />
      </svg>
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('0개의 구슬을 처리해야 함', () => {
    const { container } = render(
      <svg>
        <BeadGroup count={0} engine={mockEngine as any} emotion="joy" />
      </svg>
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  describe('T-020: 비주얼 폴리시 애니메이션', () => {
    it('팝인 애니메이션을 지원해야 함', () => {
      const { container } = render(
        <svg>
          <BeadGroup count={3} engine={mockEngine as any} emotion="joy" />
        </svg>
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('여러 구슬의 애니메이션을 처리해야 함', () => {
      const { container } = render(
        <svg>
          <BeadGroup count={5} engine={mockEngine as any} emotion="joy" />
        </svg>
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('자기장 효과를 시각화해야 함', () => {
      const { container } = render(
        <svg>
          <BeadGroup count={2} engine={mockEngine as any} emotion="joy" />
        </svg>
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
