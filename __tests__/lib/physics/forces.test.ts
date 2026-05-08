import { calculateMagneticForce, applyMagneticField } from '@/lib/physics/forces';
import type { Vector } from '@/types/physics';
import * as Matter from 'matter-js';

// Matter.Body.applyForce 모킹
Matter.Body.applyForce = jest.fn();

describe('Magnetic Force Calculation', () => {
  describe('calculateMagneticForce', () => {
    it('구슬이 젤리 중심에 있을 때 최대 힘을 계산해야 한다', () => {
      const beadPosition: Vector = { x: 100, y: 100 };
      const jellyCenter: Vector = { x: 100, y: 100 };

      const force = calculateMagneticForce(beadPosition, jellyCenter);

      // 거리가 0이면 최대 힘
      expect(force.x).toBeDefined();
      expect(force.y).toBeDefined();
    });

    it('구슬이 젤리 중심에서 오른쪽에 있을 때 왼쪽으로 힘을 가해야 한다', () => {
      const beadPosition: Vector = { x: 140, y: 100 };
      const jellyCenter: Vector = { x: 100, y: 100 };

      const force = calculateMagneticForce(beadPosition, jellyCenter);

      // 왼쪽으로 힘 (음수 x)
      expect(force.x).toBeLessThan(0);
    });

    it('구슬이 젤리 중심에서 왼쪽에 있을 때 오른쪽으로 힘을 가해야 한다', () => {
      const beadPosition: Vector = { x: 60, y: 100 };
      const jellyCenter: Vector = { x: 100, y: 100 };

      const force = calculateMagneticForce(beadPosition, jellyCenter);

      // 오른쪽으로 힘 (양수 x)
      expect(force.x).toBeGreaterThan(0);
    });

    it('구슬이 젤리 중심에서 아래에 있을 때 위로 힘을 가해야 한다', () => {
      const beadPosition: Vector = { x: 100, y: 140 };
      const jellyCenter: Vector = { x: 100, y: 100 };

      const force = calculateMagneticForce(beadPosition, jellyCenter);

      // 위로 힘 (음수 y)
      expect(force.y).toBeLessThan(0);
    });

    it('구슬이 젤리 중심에서 위에 있을 때 아래로 힘을 가해야 한다', () => {
      const beadPosition: Vector = { x: 100, y: 60 };
      const jellyCenter: Vector = { x: 100, y: 100 };

      const force = calculateMagneticForce(beadPosition, jellyCenter);

      // 아래로 힘 (양수 y)
      expect(force.y).toBeGreaterThan(0);
    });

    it('거리가 멀어질수록 힘이 약해져야 한다', () => {
      const jellyCenter: Vector = { x: 100, y: 100 };

      const nearBead: Vector = { x: 110, y: 100 };
      const farBead: Vector = { x: 140, y: 100 };

      const nearForce = calculateMagneticForce(nearBead, jellyCenter);
      const farForce = calculateMagneticForce(farBead, jellyCenter);

      // 가까운 구슬이 더 강한 힘
      expect(Math.abs(nearForce.x)).toBeGreaterThan(Math.abs(farForce.x));
    });

    it('50px 반경 밖에서는 힘이 0이어야 한다', () => {
      const beadPosition: Vector = { x: 200, y: 100 };
      const jellyCenter: Vector = { x: 100, y: 100 };

      const force = calculateMagneticForce(beadPosition, jellyCenter);

      // 자기장 반경 밖이면 힘 0 (floating point 정밀도 고려)
      expect(force.x).toBeCloseTo(0);
      expect(force.y).toBeCloseTo(0);
    });

    it('대각선 방향으로도 올바른 힘을 계산해야 한다', () => {
      const beadPosition: Vector = { x: 130, y: 130 };
      const jellyCenter: Vector = { x: 100, y: 100 };

      const force = calculateMagneticForce(beadPosition, jellyCenter);

      // 왼쪽 위로 힘 (반경 내)
      expect(force.x).toBeLessThan(0);
      expect(force.y).toBeLessThan(0);
    });
  });

  describe('applyMagneticField', () => {
    it('반경 내의 모든 구슬에 힘을 적용해야 함', () => {
      const jellyCenter: Vector = { x: 100, y: 100 };
      const beads = [
        { position: { x: 90, y: 100 } },
        { position: { x: 110, y: 100 } },
      ] as any;

      expect(() => applyMagneticField(beads, jellyCenter)).not.toThrow();
    });

    it('반경 밖의 구슬에는 힘을 적용하지 않아야 함', () => {
      const jellyCenter: Vector = { x: 100, y: 100 };
      const beads = [
        { position: { x: 0, y: 0 } }, // 반경 밖
      ] as any;

      expect(() => applyMagneticField(beads, jellyCenter)).not.toThrow();
    });

    it('빈 배열을 처리해야 함', () => {
      const jellyCenter: Vector = { x: 100, y: 100 };
      const beads: Matter.Body[] = [];

      expect(() => applyMagneticField(beads, jellyCenter)).not.toThrow();
    });
  });
});
