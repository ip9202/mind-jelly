/**
 * 물리 상수 정의
 * REQ-UBI-002, REQ-STA-006
 * @MX:ANCHOR: 물리 시뮬레이션의 핵심 상수 (다수 컴포넌트에서 사용)
 * @MX:REASON: engine.ts, softBody.ts, forces.ts 등 5개 이상의 모듈에서 참조
 * @MX:SPEC: REQ-UBI-002, REQ-STA-006
 */

// @MX:ANCHOR: 물리 엔진 기본 파라미터
export const PHYSICS_CONSTANTS = {
  // 기본 물리 속성 (REQ-UBI-002)
  elasticity: 0.7, // 탄성계수: Soft-body 복원력
  damping: 0.3, // 감쇠계수: 진동 감소
  friction: 0.1, // 마찰계수: 표면 마찰
  gravityScale: 0.5, // 중력 배율: 0.5g (가벼운 부유감)
  magneticFieldRadius: 50, // 자기장 반경: 50px (REQ-EVT-002, REQ-STA-005)

  // Soft-body 파라미터 (REQ-UBI-002)
  defaultVertices: 25, // 기본 정점 수: 20-30 범위의 중간값
  minVertices: 20, // 최소 정점 수: 성능 최적화 하한
  maxVertices: 30, // 최대 정점 수: 품질 보장 상한
  jellyRadius: 40, // 젤리 반지름: 픽셀 단위

  // 성능 파라미터 (REQ-UNW-001, REQ-UNW-005)
  targetFPS: 60, // 목표 프레임레이트
  minFPS: 30, // 최소 프레임레이트 (REQ-UNW-001)
  timestep: 16.67, // 물리 타임스텝: 1000ms / 60fps
  maxBeads: 15, // 최대 구슬 수 (REQ-EVT-005)

  // 구슬 파라미터 (REQ-EVT-005)
  beadSizes: [12, 18, 24] as const, // 구슬 크기 옵션: 소/중/대
  wallRestitution: 0.3, // 벽면 반탄성계수: 약간 튕김 (REQ-UNW-003)
  wallThickness: 10, // 벽면 두께: 픽셀 단위 (REQ-UNW-003)
} as const;
