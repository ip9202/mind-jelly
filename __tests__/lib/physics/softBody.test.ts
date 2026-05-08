// Soft-body 테스트
import { createSoftBody } from '@/lib/physics/softBody';
import * as Matter from 'matter-js';

describe('createSoftBody', () => {
  let mockVertices: Matter.Body[];
  let mockConstraints: Matter.Constraint[];
  let mockComposite: Matter.Composite;

  beforeEach(() => {
    // Matter.js mock 초기화
    mockVertices = [];
    mockConstraints = [];
    mockComposite = Matter.Composite.create();
  });

  it('올바른 개수의 정점을 생성해야 함 (20-30 사이)', () => {
    const result = createSoftBody(100, 100, 60, 25);

    expect(result.vertices).toBeDefined();
    expect(result.vertices.length).toBe(25);
  });

  it('정점을 원형으로 배치해야 함', () => {
    const centerX = 100;
    const centerY = 100;
    const radius = 60;
    const vertexCount = 25;

    const result = createSoftBody(centerX, centerY, radius, vertexCount);

    // 모든 정점이 지정된 반경 내에 있는지 확인
    result.vertices.forEach((vertex, index) => {
      const angle = (2 * Math.PI * index) / vertexCount;
      const expectedX = centerX + radius * Math.cos(angle);
      const expectedY = centerY + radius * Math.sin(angle);

      expect(vertex.position.x).toBeCloseTo(expectedX, 0);
      expect(vertex.position.y).toBeCloseTo(expectedY, 0);
    });
  });

  it('정점 간 내부 제약조건을 생성해야 함', () => {
    const vertexCount = 25;
    const result = createSoftBody(100, 100, 60, vertexCount);

    expect(result.constraints).toBeDefined();
    expect(result.constraints.length).toBeGreaterThan(0);

    // 인접한 정점 간 연결이 있는지 확인
    const adjacentConstraints = result.constraints.filter(c => {
      const bodyA = c.bodyA;
      const bodyB = c.bodyB;
      return bodyA && bodyB;
    });

    expect(adjacentConstraints.length).toBeGreaterThan(vertexCount);
  });

  it('올바른 스프링 강성과 감쇠를 사용해야 함', () => {
    const result = createSoftBody(100, 100, 60, 25);

    result.constraints.forEach(constraint => {
      // 모든 제약조건은 동일한 감쇠를 가져야 함
      expect(constraint.damping).toBe(0.03); // SPRING_DAMPING

      // 강성은 외곽 스프링(0.08) 또는 내부 스프링(0.04) 중 하나여야 함
      expect([0.08, 0.04]).toContain(constraint.stiffness);
    });

    // 최소한 하나의 외곽 스프링이 있어야 함
    const outerSprings = result.constraints.filter(c => c.stiffness === 0.08);
    expect(outerSprings.length).toBeGreaterThan(0);
  });

  it('월드에 추가할 수 있는 composite를 반환해야 함', () => {
    const result = createSoftBody(100, 100, 60, 25);

    expect(result.composite).toBeDefined();
    expect(Matter.Composite.allBodies(result.composite).length).toBe(25);
    expect(Matter.Composite.allConstraints(result.composite).length).toBeGreaterThan(0);
  });

  it('반경이 다른 경우에도 올바르게 동작해야 함', () => {
    const result = createSoftBody(200, 200, 80, 25);

    expect(result.vertices.length).toBe(25);

    // 첫 번째 정점이 예상된 위치에 있는지 확인
    const firstVertex = result.vertices[0];
    const expectedX = 200 + 80; // 0도 방향
    expect(firstVertex.position.x).toBeCloseTo(expectedX, 0);
  });

  it('정점 개수가 다른 경우에도 올바르게 동작해야 함', () => {
    const vertexCount = 20;
    const result = createSoftBody(100, 100, 60, vertexCount);

    expect(result.vertices.length).toBe(vertexCount);
  });
});
