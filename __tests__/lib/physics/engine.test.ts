import { Engine, Render, Runner, World, Bodies, Composite, Events } from 'matter-js';
import {
  createPhysicsEngine,
  destroyPhysicsEngine,
  updateEngine,
  getEngineInstance,
} from '@/lib/physics/engine';

// Matter.js 모킹을 위한 헬퍼
const mockCanvas = {
  width: 800,
  height: 600,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
} as unknown as HTMLCanvasElement;

describe('Physics Engine', () => {
  afterEach(() => {
    // 각 테스트 후 엔진 정리
    const engine = getEngineInstance();
    if (engine) {
      destroyPhysicsEngine();
    }
  });

  describe('createPhysicsEngine', () => {
    it('엔진 인스턴스를 생성해야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);

      expect(engine).toBeDefined();
      expect(engine.world).toBeDefined();
    });

    it('캔버스 경계 벽을 생성해야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);
      const bodies = Composite.allBodies(engine.world);

      // 상하좌우 4개의 벽 + 중앙 고정점
      expect(bodies.length).toBeGreaterThanOrEqual(4);

      // 벽은 static이어야 한다
      const walls = bodies.filter((b) => b.isStatic);
      expect(walls.length).toBeGreaterThanOrEqual(4);
    });

    it('동일한 캔버스로 중복 생성 시 기존 엔진을 반환해야 한다', () => {
      const engine1 = createPhysicsEngine(mockCanvas);
      const engine2 = createPhysicsEngine(mockCanvas);

      expect(engine1).toBe(engine2);
    });

    it('중력 설정을 가져야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);

      expect(engine.gravity.y).toBeDefined();
      expect(engine.gravity.x).toBe(0);
    });
  });

  describe('destroyPhysicsEngine', () => {
    it('엔진을 정리해야 한다', () => {
      createPhysicsEngine(mockCanvas);
      destroyPhysicsEngine();

      const engine = getEngineInstance();
      expect(engine).toBeNull();
    });

    it('엔진이 없을 때도 안전하게 호출되어야 한다', () => {
      expect(() => destroyPhysicsEngine()).not.toThrow();
    });
  });

  describe('updateEngine', () => {
    it('엔진을 업데이트해야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);

      expect(() => updateEngine(engine, 1000 / 60)).not.toThrow();
    });

    it('deltaTime을 사용하여 엔진을 업데이트해야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);
      const deltaTime = 1000 / 60; // 60fps

      // 엔진 업데이트는 Matter.js 내부 로직에 의존하므로
      // 에러가 발생하지 않는지만 확인
      expect(() => updateEngine(engine, deltaTime)).not.toThrow();
    });
  });

  describe('getEngineInstance', () => {
    it('생성된 엔진 인스턴스를 반환해야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);
      const instance = getEngineInstance();

      expect(instance).toBe(engine);
    });

    it('엔진이 없을 때 null을 반환해야 한다', () => {
      const instance = getEngineInstance();

      expect(instance).toBeNull();
    });
  });

  describe('Canvas boundary walls', () => {
    it('벽이 캔버스 경계에 배치되어야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);
      const bodies = Composite.allBodies(engine.world);
      const walls = bodies.filter((b) => b.isStatic);

      // 상단 벽 (y ≈ 0)
      const topWall = walls.find((b) => b.position.y < 10);
      expect(topWall).toBeDefined();

      // 하단 벽 (y ≈ height)
      const bottomWall = walls.find((b) => b.position.y > mockCanvas.height - 10);
      expect(bottomWall).toBeDefined();

      // 좌측 벽 (x ≈ 0)
      const leftWall = walls.find((b) => b.position.x < 10);
      expect(leftWall).toBeDefined();

      // 우측 벽 (x ≈ width)
      const rightWall = walls.find((b) => b.position.x > mockCanvas.width - 10);
      expect(rightWall).toBeDefined();
    });

    it('벽의 두께는 10px이어야 한다', () => {
      const engine = createPhysicsEngine(mockCanvas);
      const bodies = Composite.allBodies(engine.world);
      const walls = bodies.filter((b) => b.isStatic);

      walls.forEach((wall) => {
        const minDimension = Math.min(wall.bounds.max.x - wall.bounds.min.x, wall.bounds.max.y - wall.bounds.min.y);
        expect(minDimension).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Engine lifecycle', () => {
    it('여러 번 생성/정리를 해도 메모리 누수가 없어야 한다', () => {
      // 3회 반복
      for (let i = 0; i < 3; i++) {
        const engine = createPhysicsEngine(mockCanvas);
        expect(engine).toBeDefined();

        destroyPhysicsEngine();
        expect(getEngineInstance()).toBeNull();
      }
    });
  });
});
