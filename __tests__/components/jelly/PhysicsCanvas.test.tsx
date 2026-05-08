// PhysicsCanvas 컴포넌트 테스트
import { render, screen, waitFor } from '@testing-library/react';
import { PhysicsCanvas } from '@/components/jelly/PhysicsCanvas';

// Matter.js 모킹
const mockEngine = {
  world: {},
  gravity: { x: 0, y: 1 },
};

const mockRunner = {
  run: jest.fn(),
  stop: jest.fn(),
};

jest.mock('matter-js', () => ({
  Engine: {
    create: jest.fn(() => mockEngine),
    clear: jest.fn(),
    update: jest.fn(),
  },
  Runner: {
    create: jest.fn(() => mockRunner),
    run: jest.fn(),
    stop: jest.fn(() => mockRunner.stop()),
  },
  Events: {
    on: jest.fn(),
  },
}));

describe('PhysicsCanvas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('canvas 요소를 렌더링해야 함', () => {
    const { container } = render(
      <PhysicsCanvas width={800} height={600}>
        <div data-testid="child">Child Component</div>
      </PhysicsCanvas>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('마운트 시 물리 엔진을 초기화해야 함', async () => {
    const Matter = require('matter-js');

    render(
      <PhysicsCanvas width={800} height={600}>
        <div>Child</div>
      </PhysicsCanvas>
    );

    // Engine.create가 호출되었는지 확인
    expect(Matter.Engine.create).toHaveBeenCalled();
    expect(Matter.Runner.create).toHaveBeenCalled();
    expect(Matter.Runner.run).toHaveBeenCalledWith(mockRunner, mockEngine);
  });

  it('언마운트 시 정리해야 함 (Engine.clear)', () => {
    const Matter = require('matter-js');

    const { unmount } = render(
      <PhysicsCanvas width={800} height={600}>
        <div>Child</div>
      </PhysicsCanvas>
    );

    unmount();

    // Engine.clear가 호출되었는지 확인
    expect(Matter.Engine.clear).toHaveBeenCalledWith(mockEngine);
    expect(mockRunner.stop).toHaveBeenCalled();
  });

  it('children을 렌더링해야 함', () => {
    render(
      <PhysicsCanvas width={800} height={600}>
        <div data-testid="test-child">Test Child</div>
      </PhysicsCanvas>
    );

    const child = screen.getByTestId('test-child');
    expect(child).toBeInTheDocument();
  });

  it('resize 이벤트를 처리해야 함', () => {
    const { container, rerender } = render(
      <PhysicsCanvas width={800} height={600}>
        <div>Child</div>
      </PhysicsCanvas>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '800');

    // 리사이즈 시뮬레이션
    rerender(
      <PhysicsCanvas width={1024} height={768}>
        <div>Child</div>
      </PhysicsCanvas>
    );

    expect(canvas).toHaveAttribute('width', '1024');
  });
});
