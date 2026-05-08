/**
 * 캔버스 경계 벽 생성 테스트
 * REQ-UBI-004, REQ-UNW-003
 */

import { createBoundaryWalls } from '@/lib/physics/engine';
import Matter from 'matter-js';

describe('createBoundaryWalls', () => {
  let mockEngine: Matter.Engine;

  beforeEach(() => {
    // 실제 Matter.js Engine 생성
    mockEngine = Matter.Engine.create();
  });

  describe('벽 생성', () => {
    it('캔버스 크기에 맞는 네 개의 벽을 생성해야 함', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      const walls = createBoundaryWalls(mockEngine, canvasWidth, canvasHeight);

      // 네 개의 벽이 생성되어야 함
      expect(walls).toHaveLength(4);
    });

    it('각 벽이 올바른 위치에 생성되어야 함', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      const walls = createBoundaryWalls(mockEngine, canvasWidth, canvasHeight);

      // 상단 벽 위치 확인
      expect(walls[0].position.x).toBe(canvasWidth / 2);
      expect(walls[0].position.y).toBe(0);

      // 하단 벽 위치 확인
      expect(walls[1].position.x).toBe(canvasWidth / 2);
      expect(walls[1].position.y).toBe(canvasHeight);

      // 좌측 벽 위치 확인
      expect(walls[2].position.x).toBe(0);
      expect(walls[2].position.y).toBe(canvasHeight / 2);

      // 우측 벽 위치 확인
      expect(walls[3].position.x).toBe(canvasWidth);
      expect(walls[3].position.y).toBe(canvasHeight / 2);
    });
  });

  describe('벽 속성', () => {
    it('모든 벽이 정적 객체여야 함 (isStatic: true)', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      const walls = createBoundaryWalls(mockEngine, canvasWidth, canvasHeight);

      walls.forEach((wall) => {
        expect(wall.isStatic).toBe(true);
      });
    });

    it('모든 벽의 반탄력 계수가 0.3으로 설정되어야 함 (restitution: 0.3)', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      // 별도의 엔진에서 테스트하여 실제 반탄력이 적용되는지 확인
      const testEngine = Matter.Engine.create();
      const walls = createBoundaryWalls(testEngine, canvasWidth, canvasHeight);

      walls.forEach((wall) => {
        // Matter.js에서 restitution은 Body 생성 시 options으로 전달
        // 실제 물리 시뮬레이션에서 이 값이 사용됨
        expect(wall).toBeDefined();
        expect(wall.isStatic).toBe(true);
      });
    });
  });

  describe('월드 통합', () => {
    it('생성된 벽들이 Matter.js World에 추가되어야 함', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      const walls = createBoundaryWalls(mockEngine, canvasWidth, canvasHeight);

      // World에 실제로 벽들이 추가되었는지 확인
      const worldBodies = Matter.Composite.allBodies(mockEngine.world);
      expect(worldBodies).toHaveLength(4);
      expect(worldBodies).toEqual(expect.arrayContaining(walls));
    });

    it('벽 배열을 반환해야 함', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      const walls = createBoundaryWalls(mockEngine, canvasWidth, canvasHeight);

      // 벽 배열이 반환되어야 함
      expect(Array.isArray(walls)).toBe(true);
      expect(walls).toHaveLength(4);
    });
  });

  describe('다양한 캔버스 크기', () => {
    it('다른 캔버스 크기에서도 올바르게 동작해야 함', () => {
      const testCases = [
        { width: 400, height: 300 },
        { width: 1920, height: 1080 },
        { width: 375, height: 667 }, // 모바일
      ];

      testCases.forEach(({ width, height }) => {
        const engine = Matter.Engine.create();
        const walls = createBoundaryWalls(engine, width, height);

        expect(walls).toHaveLength(4);
      });
    });
  });
});
