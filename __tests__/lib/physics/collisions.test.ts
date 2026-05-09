// Collisions 테스트
import { setupCollisionDetection } from '@/lib/physics/collisions';
import Matter from 'matter-js';

describe('setupCollisionDetection', () => {
  let mockEngine: Matter.Engine;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockEngine = {
      world: {},
      gravity: { x: 0, y: 1 },
    } as any;
    mockCallback = jest.fn();
  });

  it('충돌 핸들러를 등록해야 함', () => {
    const Matter = require('matter-js');
    Matter.Events.on = jest.fn();

    setupCollisionDetection(mockEngine, mockCallback);

    expect(Matter.Events.on).toHaveBeenCalledWith(
      mockEngine,
      'collisionStart',
      expect.any(Function)
    );
  });

  it('구슬-젤리 충돌을 감지해야 함', () => {
    const Matter = require('matter-js');
    let collisionHandler: any;

    Matter.Events.on = jest.fn((_engine: any, _event: string, handler: any) => {
      collisionHandler = handler;
    });

    setupCollisionDetection(mockEngine, mockCallback);

    // 구슬과 젤리 바디 생성
    const beadBody = { label: 'bead' } as any;
    const jellyBody = { label: 'jelly' } as any;

    // 충돌 이벤트 시뮬레이션
    const event = {
      pairs: [
        { bodyA: beadBody, bodyB: jellyBody },
      ],
    };

    if (collisionHandler) {
      collisionHandler(event);
    }

    expect(mockCallback).toHaveBeenCalledWith(beadBody, jellyBody);
  });

  it('콜백을 호출해야 함', () => {
    const Matter = require('matter-js');
    let collisionHandler: any;

    Matter.Events.on = jest.fn((_engine: any, _event: string, handler: any) => {
      collisionHandler = handler;
    });

    setupCollisionDetection(mockEngine, mockCallback);

    const beadBody = { label: 'bead' } as any;
    const jellyBody = { label: 'jelly' } as any;

    const event = {
      pairs: [
        { bodyA: beadBody, bodyB: jellyBody },
      ],
    };

    if (collisionHandler) {
      collisionHandler(event);
    }

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('bodyA=jelly, bodyB=bead 순서의 충돌도 감지해야 함', () => {
    const Matter = require('matter-js');
    let collisionHandler: any;

    Matter.Events.on = jest.fn((_engine: any, _event: string, handler: any) => {
      collisionHandler = handler;
    });

    setupCollisionDetection(mockEngine, mockCallback);

    const beadBody = { label: 'bead' } as any;
    const jellyBody = { label: 'jelly' } as any;

    const event = {
      pairs: [
        { bodyA: jellyBody, bodyB: beadBody },
      ],
    };

    if (collisionHandler) {
      collisionHandler(event);
    }

    expect(mockCallback).toHaveBeenCalledWith(beadBody, jellyBody);
  });

  it('구슬-젤리가 아닌 충돌은 무시해야 함', () => {
    const Matter = require('matter-js');
    let collisionHandler: any;

    Matter.Events.on = jest.fn((_engine: any, _event: string, handler: any) => {
      collisionHandler = handler;
    });

    setupCollisionDetection(mockEngine, mockCallback);

    const event = {
      pairs: [
        { bodyA: { label: 'wall' }, bodyB: { label: 'wall' } },
      ],
    };

    if (collisionHandler) {
      collisionHandler(event);
    }

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('충돌 시 구슬이 월드에서 제거된다', () => {
    const Matter = require('matter-js');
    let collisionHandler: any;

    Matter.Events.on = jest.fn((_engine: any, _event: string, handler: any) => {
      collisionHandler = handler;
    });
    Matter.Composite.remove = jest.fn();

    setupCollisionDetection(mockEngine, mockCallback);

    const beadBody = { label: 'bead' } as any;
    const jellyBody = { label: 'jelly' } as any;

    const event = {
      pairs: [
        { bodyA: beadBody, bodyB: jellyBody },
      ],
    };

    if (collisionHandler) {
      collisionHandler(event);
    }

    expect(Matter.Composite.remove).toHaveBeenCalledWith(mockEngine.world, beadBody);
  });
});
