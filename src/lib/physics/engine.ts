import { Engine, World, Bodies } from 'matter-js';

// 엔진 싱글톤 인스턴스
let engineInstance: Engine | null = null;
let currentCanvas: HTMLCanvasElement | null = null;

/**
 * Matter.js 물리 엔진을 생성하고 초기화한다
 *
 * @param canvas - 캔버스 요소 (경계 벽 생성에 사용)
 * @returns Matter.js Engine 인스턴스
 */
// @MX:ANCHOR: 물리 엔진의 단일 인스턴스 관리 (REQ-UBI-001, REQ-UNW-002)
// @MX:REASON: 엔진은 전역에서 하나만 유지하며, 모든 물리 계산이 이 엔진을 통해 이루어짐
// @MX:SPEC: SPEC-JELLY-001 REQ-UBI-001, REQ-UNW-002, REQ-UNW-003
export function createPhysicsEngine(canvas: HTMLCanvasElement): Engine {
  // 이미 엔진이 있고 같은 캔버스면 기존 엔진 반환
  if (engineInstance && currentCanvas === canvas) {
    return engineInstance;
  }

  // 기존 엔진 정리
  if (engineInstance) {
    destroyPhysicsEngine();
  }

  // 새 엔진 생성
  const engine = Engine.create();
  engine.gravity.y = 1; // 기본 중력 (나중에 scale 적용)

  // 캔버스 경계 벽 생성 (REQ-UNW-003)
  const { width, height } = canvas;
  createBoundaryWalls(engine, width, height);

  // 인스턴스 저장
  engineInstance = engine;
  currentCanvas = canvas;

  return engine;
}

/**
 * 캔버스 경계에 정적 벽을 생성하고 반환한다
 *
 * @param engine - Matter.js 엔진
 * @param canvasWidth - 캔버스 너비
 * @param canvasHeight - 캔버스 높이
 * @returns 생성된 벽들의 배열
 */
// @MX:NOTE: 경계 벽은 두께 10px, Restitution 0.8, Friction 0.0
// @MX:ANCHOR: 경계 벽 생성 함수 (REQ-UBI-004, REQ-UNW-003)
// @MX:REASON: 물리 객체들이 캔버스 밖으로 벗어나는 것을 방지
// @MX:SPEC: SPEC-JELLY-001 REQ-UNW-003
export function createBoundaryWalls(
  engine: Engine,
  canvasWidth: number,
  canvasHeight: number,
): Matter.Body[] {
  const wallThickness = 10;

  const walls = [
    // 상단 벽
    Bodies.rectangle(canvasWidth / 2, 0, canvasWidth, wallThickness, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.0,
      render: { visible: false },
    }),
    // 하단 벽
    Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight,
      canvasWidth,
      wallThickness,
      {
        isStatic: true,
        restitution: 0.8,
        friction: 0.0,
        render: { visible: false },
      },
    ),
    // 좌측 벽
    Bodies.rectangle(0, canvasHeight / 2, wallThickness, canvasHeight, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.0,
      render: { visible: false },
    }),
    // 우측 벽
    Bodies.rectangle(canvasWidth, canvasHeight / 2, wallThickness, canvasHeight, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.0,
      render: { visible: false },
    }),
  ];

  World.add(engine.world, walls);

  return walls;
}

/**
 * 물리 엔진을 정리하고 리소스를 해제한다
 */
// @MX:NOTE: 메모리 누수 방지를 위해 엔진, 월드, 이벤트 리스너 정리
// @MX:SPEC: SPEC-JELLY-001 REQ-UNW-002
export function destroyPhysicsEngine(): void {
  if (!engineInstance) {
    return;
  }

  // 월드에서 모든 바디 제거
  World.clear(engineInstance.world, false);

  // 엔진 정리
  Engine.clear(engineInstance);

  // 인스턴스 초기화
  engineInstance = null;
  currentCanvas = null;
}

/**
 * 엔진을 업데이트한다
 *
 * @param engine - Matter.js 엔진
 * @param deltaTime - 델타 타임 (ms)
 */
// @MX:NOTE: 60fps 기준 16.67ms 타임스텝으로 엔진 업데이트
// @MX:SPEC: SPEC-JELLY-001 REQ-UBI-001
export function updateEngine(engine: Engine, deltaTime: number): void {
  Engine.update(engine, deltaTime);
}

/**
 * 현재 엔진 인스턴스를 반환한다
 *
 * @returns 엔진 인스턴스 또는 null
 */
export function getEngineInstance(): Engine | null {
  return engineInstance;
}
