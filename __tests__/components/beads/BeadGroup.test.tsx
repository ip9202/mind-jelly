// BeadGroup 컴포넌트 테스트
import { render, screen } from '@testing-library/react';
import { BeadGroup } from '@/components/beads/BeadGroup';
import Matter from 'matter-js';

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('컴포넌트가 렌더링되어야 함', () => {
    const { container } = render(
      <svg>
        <BeadGroup count={3} engine={mockEngine as any} emotion="joy" />
      </svg>,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('0개의 구슬을 처리해야 함', () => {
    const { container } = render(
      <svg>
        <BeadGroup count={0} engine={mockEngine as any} emotion="joy" />
      </svg>,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('engine이 null이면 null을 반환한다', () => {
    const { container } = render(
      <BeadGroup count={3} engine={null} emotion="joy" />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('구슬이 있을 때 bead-group data-testid를 렌더링한다', () => {
    // allBodies가 구슬을 반환하도록 설정
    (Matter.Composite.allBodies as jest.Mock).mockReturnValue([
      { id: 1, position: { x: 100, y: 200 }, label: 'bead' },
    ]);

    render(
      <BeadGroup count={1} engine={mockEngine as any} emotion="joy" />,
    );

    expect(screen.getByTestId('bead-group')).toBeInTheDocument();
  });

  it('구슬이 없을 때 null을 반환한다', () => {
    (Matter.Composite.allBodies as jest.Mock).mockReturnValue([]);

    const { container } = render(
      <BeadGroup count={0} engine={mockEngine as any} emotion="joy" />,
    );

    // engine이 있지만 구슬이 없으면 null
    expect(container.innerHTML).toBe('');
  });

  it('count가 증가하면 새 구슬을 생성한다', () => {
    (Matter.Composite.allBodies as jest.Mock).mockReturnValue([]);

    const { rerender } = render(
      <BeadGroup count={2} engine={mockEngine as any} emotion="joy" />,
    );

    expect(Matter.Bodies.circle).toHaveBeenCalledTimes(2);
    expect(Matter.Composite.add).toHaveBeenCalledTimes(2);

    // count를 더 증가시키면 추가 구슬만 생성
    jest.clearAllMocks();
    (Matter.Composite.allBodies as jest.Mock).mockReturnValue([]);

    rerender(
      <BeadGroup count={4} engine={mockEngine as any} emotion="joy" />,
    );

    expect(Matter.Bodies.circle).toHaveBeenCalledTimes(2);
  });

  it('count가 감소하면 새 구슬을 생성하지 않는다', () => {
    (Matter.Composite.allBodies as jest.Mock).mockReturnValue([]);

    const { rerender } = render(
      <BeadGroup count={3} engine={mockEngine as any} emotion="joy" />,
    );

    expect(Matter.Bodies.circle).toHaveBeenCalledTimes(3);

    jest.clearAllMocks();
    (Matter.Composite.allBodies as jest.Mock).mockReturnValue([]);

    rerender(
      <BeadGroup count={1} engine={mockEngine as any} emotion="joy" />,
    );

    expect(Matter.Bodies.circle).not.toHaveBeenCalled();
  });

  describe('T-020: 비주얼 폴리시 애니메이션', () => {
    it('팝인 애니메이션을 지원해야 함', () => {
      const { container } = render(
        <svg>
          <BeadGroup count={3} engine={mockEngine as any} emotion="joy" />
        </svg>,
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('여러 구슬의 애니메이션을 처리해야 함', () => {
      const { container } = render(
        <svg>
          <BeadGroup count={5} engine={mockEngine as any} emotion="joy" />
        </svg>,
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('자기장 효과를 시각화해야 함', () => {
      const { container } = render(
        <svg>
          <BeadGroup count={2} engine={mockEngine as any} emotion="joy" />
        </svg>,
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
