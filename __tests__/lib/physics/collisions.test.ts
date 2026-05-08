// Collisions 테스트
import { setupCollisionDetection } from '@/lib/physics/collisions';
import * as Matter from 'matter-js';

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

    Matter.Events.on = jest.fn((engine: any, event: string, handler: any) => {
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

    Matter.Events.on = jest.fn((engine: any, event: string, handler: any) => {
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
});
