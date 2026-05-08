/**
 * 물리 상수 테스트
 * REQ-UBI-002, REQ-STA-006
 */

import { PHYSICS_CONSTANTS } from '@/lib/constants/physics';

describe('PHYSICS_CONSTANTS', () => {
  describe('기본 상수값', () => {
    it('탄성계수는 0.7이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.elasticity).toBe(0.7);
    });

    it('감쇠계수는 0.3이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.damping).toBe(0.3);
    });

    it('마찰계수는 0.1이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.friction).toBe(0.1);
    });

    it('중력 배율은 0.5이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.gravityScale).toBe(0.5);
    });

    it('자기장 반경은 50px이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.magneticFieldRadius).toBe(50);
    });
  });

  describe('Soft-body 파라미터', () => {
    it('기본 정점 수는 25개이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.defaultVertices).toBe(25);
    });

    it('최소 정점 수는 20개이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.minVertices).toBe(20);
    });

    it('최대 정점 수는 30개이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.maxVertices).toBe(30);
    });

    it('젤리 반지름은 40px이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.jellyRadius).toBe(40);
    });
  });

  describe('성능 파라미터', () => {
    it('목표 FPS는 60이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.targetFPS).toBe(60);
    });

    it('최소 FPS는 30이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.minFPS).toBe(30);
    });

    it('타임스텝은 16.67ms이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.timestep).toBeCloseTo(16.67, 2);
    });

    it('최대 구슬 수는 15개이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.maxBeads).toBe(15);
    });
  });

  describe('구슬 파라미터', () => {
    it('구슬 크기 옵션은 12, 18, 24px이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.beadSizes).toEqual([12, 18, 24]);
    });

    it('벽면 Restitution은 0.8이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.wallRestitution).toBe(0.8);
    });

    it('벽면 두께는 10px이어야 한다', () => {
      expect(PHYSICS_CONSTANTS.wallThickness).toBe(10);
    });
  });
});
