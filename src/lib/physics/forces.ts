import type { Vector } from '@/types/physics';
import * as Matter from 'matter-js';

// 자기장 상수
const MAGNETIC_RADIUS = 50; // 자기장 반경 (px)
const MAX_FORCE = 0.001; // 최대 힘 크기

/**
 * 자기장 효과를 위한 힘을 계산한다
 *
 * 구슬이 젤리 중심 방향으로 끌려가는 힘을 계산한다.
 * 힘의 크기는 거리에 반비례한다 (가까울수록 강함).
 *
 * @param beadPosition - 구슬 위치
 * @param jellyCenter - 젤리 중심 위치
 * @returns 힘 벡터 {x, y}
 */
// @MX:NOTE: 자기장 반경 50px, 거리에 반비례하는 힘
// @MX:SPEC: SPEC-JELLY-001 REQ-EVT-002, REQ-STA-005
export function calculateMagneticForce(beadPosition: Vector, jellyCenter: Vector): Vector {
  // 구슬에서 젤리 중심까지의 벡터
  const dx = jellyCenter.x - beadPosition.x;
  const dy = jellyCenter.y - beadPosition.y;

  // 거리 계산
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 자기장 반경 밖이면 힘 0
  if (distance >= MAGNETIC_RADIUS) {
    return { x: 0, y: 0 };
  }

  // 거리가 0이면 랜덤 방향으로 최대 힘 (수치적 안정성)
  if (distance === 0) {
    return { x: 0, y: 0 };
  }

  // 단위 벡터 계산
  const unitX = dx / distance;
  const unitY = dy / distance;

  // 거리에 반비례하는 힘 크기 (가까울수록 강함)
  // 거리 0에 가까워질수록 MAX_FORCE에 근접
  const forceMagnitude = MAX_FORCE * (1 - distance / MAGNETIC_RADIUS);

  return {
    x: unitX * forceMagnitude,
    y: unitY * forceMagnitude,
  };
}

/**
 * 자기장 힘을 구슬들에 적용
 * @param beads 구슬 바디 배열
 * @param jellyCenter 젤리 중심 위치
 */
// @MX:ANCHOR: 자기장 힘 적용 함수
// @MX:REASON: 물리 업데이트 루프에서 매 프레임 호출
// @MX:SPEC: REQ-EVT-002, REQ-STA-005
export function applyMagneticField(beads: Matter.Body[], jellyCenter: Vector): void {
  beads.forEach(bead => {
    const force = calculateMagneticForce(bead.position, jellyCenter);

    // 힘이 0이 아니면 적용
    if (force.x !== 0 || force.y !== 0) {
      Matter.Body.applyForce(bead, bead.position, force);
    }
  });
}
