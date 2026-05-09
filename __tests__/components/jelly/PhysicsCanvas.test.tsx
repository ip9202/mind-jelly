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
      </PhysicsCanvas>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '800');

    // 리사이즈 시뮬레이션
    rerender(
      <PhysicsCanvas width={1024} height={768}>
        <div>Child</div>
      </PhysicsCanvas>,
    );

    expect(canvas).toHaveAttribute('width', '1024');
  });

  it('children이 함수면 engine을 인자로 호출한다', async () => {
    const childrenFn = jest.fn(() => <div data-testid="fn-child">Fn Child</div>);

    render(
      <PhysicsCanvas width={800} height={600}>
        {childrenFn}
      </PhysicsCanvas>,
    );

    // 비동기로 engine이 설정됨
    await waitFor(() => {
      expect(childrenFn).toHaveBeenCalled();
    });

    // children 함수의 첫 번째 인자가 engine 또는 null
    const calls = childrenFn.mock.calls as unknown as [unknown[]][];

    expect(calls[0]?.[0]).toBeDefined();

    expect(screen.getByTestId('fn-child')).toBeInTheDocument();
  });

  it('children 함수에 engine이 null로 전달된 후 엔진 생성 후 업데이트된다', async () => {
    let receivedEngine: any = 'not-set';

    render(
      <PhysicsCanvas width={800} height={600}>
        {(engine) => {
          receivedEngine = engine;
          return <div>{engine ? 'engine ready' : 'no engine'}</div>;
        }}
      </PhysicsCanvas>,
    );

    // 처음에는 engine이 null
    await waitFor(() => {
      expect(receivedEngine).toBe(mockEngine);
    });
  });
});
