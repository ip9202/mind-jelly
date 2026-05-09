// usePhysicsInit 훅 테스트
import { renderHook, act } from '@testing-library/react';
import { usePhysicsInit } from '@/app/home/usePhysicsInit';

// requestAnimationFrame / cancelAnimationFrame 폴리필 (jsdom)
let rafCallbacks: FrameRequestCallback[] = [];
let rafIdCounter = 0;
const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;

beforeAll(() => {
  global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
    const id = ++rafIdCounter;
    rafCallbacks.push(cb);
    return id;
  });
  global.cancelAnimationFrame = jest.fn((id: number) => {
    rafCallbacks = rafCallbacks.filter((_, i) => i !== id - 1);
  });
});

afterAll(() => {
  global.requestAnimationFrame = originalRAF;
  global.cancelAnimationFrame = originalCAF;
});

// ---------- 모킹 ----------

// 가짜 바디 생성 헬퍼
function createFakeBody(label: string, x = 400, y = 200) {
  return {
    label,
    position: { x, y },
    mass: 1,
    id: Math.random(),
  };
}

// 가짜 엔진
function createFakeEngine(bodies: ReturnType<typeof createFakeBody>[] = []) {
  return {
    world: { bodies, __bodies: bodies },
    gravity: { x: 0, y: 1, scale: 0.001 },
  };
}

// Matter.js 모킹
const mockBodiesCircle = jest.fn((x: number, y: number, _r: number, opts: Record<string, unknown>) => ({
  label: opts?.label ?? 'jelly',
  position: { x, y },
  mass: 1,
  id: 1,
}));

const mockBodiesRectangle = jest.fn((_x: number, _y: number, _w: number, _h: number, opts: Record<string, unknown>) => ({
  label: 'wall',
  position: { x: _x, y: _y },
  mass: 0,
  id: Math.random(),
  isStatic: opts?.isStatic,
}));

const mockCompositeAdd = jest.fn();
const mockCompositeAllBodies = jest.fn();
const mockBodyApplyForce = jest.fn();

jest.mock('matter-js', () => ({
  Bodies: {
    circle: (...args: unknown[]) => mockBodiesCircle(...args),
    rectangle: (...args: unknown[]) => mockBodiesRectangle(...args),
  },
  Composite: {
    add: (...args: unknown[]) => mockCompositeAdd(...args),
    allBodies: (...args: unknown[]) => mockCompositeAllBodies(...args),
  },
  Body: {
    applyForce: (...args: unknown[]) => mockBodyApplyForce(...args),
  },
}));

// jellyStore 모킹
const mockTransitionState = jest.fn(() => true);
const mockDecrementBeadCount = jest.fn();
const mockGetState = jest.fn(() => ({
  currentState: 'idle',
  transitionState: mockTransitionState,
  decrementBeadCount: mockDecrementBeadCount,
}));

jest.mock('@/stores/jellyStore', () => ({
  jellyStore: {
    getState: () => mockGetState(),
    // Zustand selector 패턴 지원 (컴포넌트에서 사용하지 않으므로 최소한)
    subscribe: jest.fn(),
  },
}));

// 충돌 감지 모킹
const mockSetupCollisionDetection = jest.fn();
jest.mock('@/lib/physics/collisions', () => ({
  setupCollisionDetection: (...args: unknown[]) => mockSetupCollisionDetection(...args),
}));

// 자기장 모킹
const mockApplyMagneticField = jest.fn();
jest.mock('@/lib/physics/forces', () => ({
  applyMagneticField: (...args: unknown[]) => mockApplyMagneticField(...args),
}));

// ---------- 테스트 ----------

describe('usePhysicsInit', () => {
  // 기본 옵션 (matterReady=true, matterRef 설정됨)
  const defaultMatterRef = { current: require('matter-js') };

  function createDefaultOptions() {
    return {
      matterReady: true,
      matterRef: defaultMatterRef as React.RefObject<typeof import('matter-js') | null>,
      setJellyPos: jest.fn(),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    rafCallbacks = [];
    rafIdCounter = 0;
    mockTransitionState.mockClear();
    mockDecrementBeadCount.mockClear();
    mockGetState.mockReturnValue({
      currentState: 'idle',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });
  });

  // --- 1. 엔진 초기화 테스트 ---
  it('engine && matterReady 조건에서 엔진을 초기화해야 함', () => {
    const fakeEngine = createFakeEngine();
    const options = createDefaultOptions();

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // 젤리 바디 생성 확인
    expect(mockBodiesCircle).toHaveBeenCalledWith(400, 180, 40, {
      label: 'jelly',
      restitution: 0.5,
      friction: 0.1,
      density: 0.002,
    });

    // 벽 4개 생성 확인
    expect(mockBodiesRectangle).toHaveBeenCalledTimes(4);

    // Composite.add 호출 확인 (jelly + walls = 2번)
    expect(mockCompositeAdd).toHaveBeenCalledTimes(2);

    // 충돌 감지 설정 확인
    expect(mockSetupCollisionDetection).toHaveBeenCalledTimes(1);
    expect(mockSetupCollisionDetection).toHaveBeenCalledWith(
      fakeEngine,
      expect.any(Function),
    );

    // engineRef에 엔진 저장 확인
    expect(result.current.engineRef.current).toBe(fakeEngine);
  });

  // --- 2. 이미 초기화된 경우 재초기화 방지 ---
  it('engineRef.current가 이미 설정되어 있으면 재초기화하지 않아야 함', () => {
    const fakeEngine = createFakeEngine();
    const options = createDefaultOptions();

    const { result } = renderHook(() => usePhysicsInit(options));

    // 첫 번째 초기화
    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    const callCountAfterFirst = mockBodiesCircle.mock.calls.length;

    // 두 번째 호출 (재초기화 시도)
    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // Bodies.circle 호출 횟수가 늘어나지 않아야 함
    expect(mockBodiesCircle.mock.calls.length).toBe(callCountAfterFirst);
  });

  // --- 3. 충돌 콜백 상태 전이 테스트 ---
  it('충돌 콜백이 idle -> anticipation -> eating 전이를 트리거해야 함', () => {
    const fakeEngine = createFakeEngine();
    const options = createDefaultOptions();

    // 충돌 콜백 내부에서 allBodies 호출 시 배열 반환
    mockCompositeAllBodies.mockReturnValue([]);

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // setupCollisionDetection에 전달된 콜백 추출
    const collisionCallback = mockSetupCollisionDetection.mock.calls[0][1];
    const fakeBeadBody = createFakeBody('bead');
    const fakeJellyBody = createFakeBody('jelly');

    // idle 상태에서 충돌 발생
    mockGetState.mockReturnValue({
      currentState: 'idle',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    act(() => {
      collisionCallback(fakeBeadBody, fakeJellyBody);
    });

    // idle -> anticipation 전이 확인
    expect(mockTransitionState).toHaveBeenCalledWith('anticipation');
    // 구슬 개수 감소 확인
    expect(mockDecrementBeadCount).toHaveBeenCalled();
  });

  it('충돌 콜백이 anticipation 상태에서 eating 전이를 트리거해야 함', () => {
    const fakeEngine = createFakeEngine();
    const options = createDefaultOptions();

    // 충돌 콜백 내부에서 allBodies 호출 시 배열 반환
    mockCompositeAllBodies.mockReturnValue([]);

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    const collisionCallback = mockSetupCollisionDetection.mock.calls[0][1];
    const fakeBeadBody = createFakeBody('bead');
    const fakeJellyBody = createFakeBody('jelly');

    // anticipation 상태
    mockGetState.mockReturnValue({
      currentState: 'anticipation',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    act(() => {
      collisionCallback(fakeBeadBody, fakeJellyBody);
    });

    // anticipation -> eating 전이 확인
    expect(mockTransitionState).toHaveBeenCalledWith('eating');
  });

  // --- 4. 애니메이션 루프 테스트 ---
  it('애니메이션 루프가 젤리 위치를 추적하고 setJellyPos를 호출해야 함', () => {
    const fakeJelly = createFakeBody('jelly', 350, 150);
    const fakeEngine = createFakeEngine([fakeJelly]);
    const options = createDefaultOptions();

    mockCompositeAllBodies.mockReturnValue([fakeJelly]);

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // requestAnimationFrame이 호출되었는지 확인
    expect(global.requestAnimationFrame).toHaveBeenCalled();

    // 첫 번째 RAF 콜백 수동 실행 (애니메이션 루프 1프레임)
    const trackCallback = rafCallbacks[0];
    if (trackCallback) {
      act(() => {
        trackCallback(0);
      });
    }

    // setJellyPos가 젤리 위치로 호출되었는지 확인
    expect(options.setJellyPos).toHaveBeenCalledWith({ x: 350, y: 150 });
  });

  it('애니메이션 루프에서 구슬에 자기장과 부유력을 적용해야 함', () => {
    const fakeJelly = createFakeBody('jelly', 400, 200);
    const fakeBead = createFakeBody('bead', 300, 150);
    const fakeEngine = createFakeEngine([fakeJelly, fakeBead]);

    mockCompositeAllBodies.mockReturnValue([fakeJelly, fakeBead]);

    const options = createDefaultOptions();
    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // 첫 번째 RAF 콜백 수동 실행
    const trackCallback = rafCallbacks[0];
    if (trackCallback) {
      act(() => {
        trackCallback(0);
      });
    }

    // 자기장 적용 확인
    expect(mockApplyMagneticField).toHaveBeenCalledWith(
      [fakeBead],
      fakeJelly.position,
    );

    // 부유력 적용 확인 (applyForce 호출)
    expect(mockBodyApplyForce).toHaveBeenCalled();
  });

  it('구슬이 자기장 반경 내에 있으면 anticipation 상태로 전이해야 함', () => {
    // 젤리 근처에 있는 구슬 (거리 < 250)
    const fakeJelly = createFakeBody('jelly', 400, 200);
    const fakeBead = createFakeBody('bead', 420, 210); // ~22px 거리
    const fakeEngine = createFakeEngine([fakeJelly, fakeBead]);

    mockCompositeAllBodies.mockReturnValue([fakeJelly, fakeBead]);

    const options = createDefaultOptions();
    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // idle 상태로 설정
    mockGetState.mockReturnValue({
      currentState: 'idle',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    // RAF 콜백 실행
    const trackCallback = rafCallbacks[0];
    if (trackCallback) {
      act(() => {
        trackCallback(0);
      });
    }

    // anticipation 전이 확인
    expect(mockTransitionState).toHaveBeenCalledWith('anticipation');
  });

  // --- 5. 언마운트 정리 테스트 ---
  it('언마운트 시 animationFrame과 timer를 정리해야 함', () => {
    const fakeEngine = createFakeEngine();
    const options = createDefaultOptions();

    const { result, unmount } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // 초기화 후 engineRef가 설정됨
    expect(result.current.engineRef.current).toBe(fakeEngine);

    // 언마운트
    unmount();

    // cancelAnimationFrame 호출 확인
    expect(global.cancelAnimationFrame).toHaveBeenCalled();

    // engineRef 초기화 확인
    expect(result.current.engineRef.current).toBeNull();
  });

  // --- 6. 조건 불충족 시 초기화 안 함 ---
  it('matterReady가 false면 초기화하지 않아야 함', () => {
    const fakeEngine = createFakeEngine();
    const options = {
      ...createDefaultOptions(),
      matterReady: false,
    };

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    expect(mockBodiesCircle).not.toHaveBeenCalled();
    expect(result.current.engineRef.current).toBeNull();
  });

  it('engine이 null이면 초기화하지 않아야 함', () => {
    const options = createDefaultOptions();

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(null);
    });

    expect(mockBodiesCircle).not.toHaveBeenCalled();
    expect(result.current.engineRef.current).toBeNull();
  });

  // --- 7. satisfied 타이머 테스트 ---
  it('남은 구슬이 1개 이하면 satisfied -> idle 타이머를 설정해야 함', () => {
    jest.useFakeTimers();
    const fakeEngine = createFakeEngine();
    const options = createDefaultOptions();

    // 마지막 구슬 1개 (remainingBeads = 1 → allBodies에서 bead 1개 반환)
    const fakeBead = createFakeBody('bead');
    mockCompositeAllBodies.mockReturnValue([fakeBead]);

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    const collisionCallback = mockSetupCollisionDetection.mock.calls[0][1];

    // idle 상태, 아직 satisfied 아님
    mockGetState.mockReturnValue({
      currentState: 'idle',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    act(() => {
      collisionCallback(fakeBead, createFakeBody('jelly'));
    });

    // 첫 번째 타이머 (500ms) 경과 → satisfied 전이
    mockGetState.mockReturnValue({
      currentState: 'idle',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // satisfied 전이 확인
    expect(mockTransitionState).toHaveBeenCalledWith('satisfied');

    // 두 번째 타이머 (3000ms) 경과 → idle 전이
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockTransitionState).toHaveBeenCalledWith('idle');

    jest.useRealTimers();
  });

  // --- 8. idle 충돌 시 eating 지연 전이 테스트 ---
  it('idle 상태 충돌 후 150ms 뒤 eating으로 전이해야 함', () => {
    jest.useFakeTimers();
    const fakeEngine = createFakeEngine();
    const options = createDefaultOptions();

    // remainingBeads > 1이므로 satisfied 타이머 미발생
    mockCompositeAllBodies.mockReturnValue([
      createFakeBody('bead'),
      createFakeBody('bead'),
      createFakeBody('bead'),
    ]);

    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    const collisionCallback = mockSetupCollisionDetection.mock.calls[0][1];
    const fakeBeadBody = createFakeBody('bead');
    const fakeJellyBody = createFakeBody('jelly');

    // idle 상태
    mockGetState.mockReturnValue({
      currentState: 'idle',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    act(() => {
      collisionCallback(fakeBeadBody, fakeJellyBody);
    });

    // 즉시 anticipation 전이
    expect(mockTransitionState).toHaveBeenCalledWith('anticipation');

    // 150ms 후 eating 전이
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockTransitionState).toHaveBeenCalledWith('eating');

    jest.useRealTimers();
  });

  // --- 9. anticipation 근접 트리거 시 idle이 아니면 전이하지 않음 ---
  it('구슬이 근접해도 idle 상태가 아니면 anticipation 전이하지 않아야 함', () => {
    const fakeJelly = createFakeBody('jelly', 400, 200);
    const fakeBead = createFakeBody('bead', 420, 210);
    const fakeEngine = createFakeEngine([fakeJelly, fakeBead]);

    mockCompositeAllBodies.mockReturnValue([fakeJelly, fakeBead]);

    const options = createDefaultOptions();
    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // eating 상태 (idle이 아님)
    mockGetState.mockReturnValue({
      currentState: 'eating',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    mockTransitionState.mockClear();

    const trackCallback = rafCallbacks[0];
    if (trackCallback) {
      act(() => {
        trackCallback(0);
      });
    }

    // eating 상태에서는 anticipation 전이가 호출되지 않아야 함
    expect(mockTransitionState).not.toHaveBeenCalled();
  });

  // --- 10. 구슬이 자기장 반경 밖이면 anticipation 전이하지 않음 ---
  it('구슬이 자기장 반경 밖에 있으면 anticipation 전이하지 않아야 함', () => {
    const fakeJelly = createFakeBody('jelly', 400, 200);
    const fakeBead = createFakeBody('bead', 100, 100); // 거리 ~360px > 250
    const fakeEngine = createFakeEngine([fakeJelly, fakeBead]);

    mockCompositeAllBodies.mockReturnValue([fakeJelly, fakeBead]);

    const options = createDefaultOptions();
    const { result } = renderHook(() => usePhysicsInit(options));

    act(() => {
      result.current.initPhysics(fakeEngine as unknown as import('matter-js').Engine);
    });

    // idle 상태
    mockGetState.mockReturnValue({
      currentState: 'idle',
      transitionState: mockTransitionState,
      decrementBeadCount: mockDecrementBeadCount,
    });

    mockTransitionState.mockClear();

    const trackCallback = rafCallbacks[0];
    if (trackCallback) {
      act(() => {
        trackCallback(0);
      });
    }

    // 원거리 구슬은 anticipation 트리거하지 않음
    expect(mockTransitionState).not.toHaveBeenCalled();
  });
});
