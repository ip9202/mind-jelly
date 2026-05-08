// T-009: Soft-body 구조 생성 (REQ-UBI-002)
import * as Matter from 'matter-js';

// 스프링 상수
const SPRING_STIFFNESS = 0.08; // 스프링 강성
const SPRING_DAMPING = 0.03; // 스프링 감쇠

/**
 * Soft-body 젤리 구조 생성
 * @param x 중심 X 좌표
 * @param y 중심 Y 좌표
 * @param radius 반지름
 * @param vertexCount 정점 개수 (20-30 사이)
 * @returns vertices, constraints, composite
 */
// @MX:ANCHOR: Soft-body 젤리 구조 생성 함수
// @MX:REASON: PhysicsCanvas, JellyRenderer 등 여러 컴포넌트에서 호출
// @MX:SPEC: REQ-UBI-002
export function createSoftBody(
  x: number,
  y: number,
  radius: number,
  vertexCount: number
): {
  vertices: Matter.Body[];
  constraints: Matter.Constraint[];
  composite: Matter.Composite;
} {
  // 제약조건: 20-30 사이의 정점 개수
  const clampedVertexCount = Math.max(20, Math.min(30, vertexCount));

  // Composite 생성
  const composite = Matter.Composite.create();

  // 정점 생성
  const vertices: Matter.Body[] = [];
  for (let i = 0; i < clampedVertexCount; i++) {
    const angle = (2 * Math.PI * i) / clampedVertexCount;
    const vertexX = x + radius * Math.cos(angle);
    const vertexY = y + radius * Math.sin(angle);

    const vertex = Matter.Bodies.circle(vertexX, vertexY, 5, {
      isStatic: false,
      friction: 0.1,
      restitution: 0.7,
    });

    vertices.push(vertex);
    Matter.Composite.add(composite, vertex);
  }

  // 제약조건 생성
  const constraints: Matter.Constraint[] = [];

  // 인접한 정점 간 연결 (외곽선)
  for (let i = 0; i < clampedVertexCount; i++) {
    const nextIndex = (i + 1) % clampedVertexCount;
    const constraint = Matter.Constraint.create({
      bodyA: vertices[i],
      bodyB: vertices[nextIndex],
      stiffness: SPRING_STIFFNESS,
      damping: SPRING_DAMPING,
    });

    constraints.push(constraint);
    Matter.Composite.add(composite, constraint);
  }

  // 내부 스프링 연결 (구조적 안정성)
  for (let i = 0; i < clampedVertexCount; i++) {
    const oppositeIndex = (i + Math.floor(clampedVertexCount / 2)) % clampedVertexCount;
    const constraint = Matter.Constraint.create({
      bodyA: vertices[i],
      bodyB: vertices[oppositeIndex],
      stiffness: SPRING_STIFFNESS * 0.5, // 내부 스프링은 더 약하게
      damping: SPRING_DAMPING,
    });

    constraints.push(constraint);
    Matter.Composite.add(composite, constraint);
  }

  return {
    vertices,
    constraints,
    composite,
  };
}
