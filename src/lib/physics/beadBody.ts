// T-012: 구슬 물리 바디 (REQ-EVT-005)
import * as Matter from 'matter-js';

/**
 * 구슬 물리 바디 생성
 * @param x X 좌표
 * @param y Y 좌표
 * @param size 구슬 크기 (반지름)
 * @returns Matter.Body
 */
// @MX:ANCHOR: 구슬 바디 생성 함수
// @MX:REASON: BeadGroup, Collisions 등에서 호출
// @MX:SPEC: REQ-EVT-005
export function createBeadBody(x: number, y: number, size: number): Matter.Body {
  const body = Matter.Bodies.circle(x, y, size, {
    isStatic: false,
    friction: 0.1,
    restitution: 0.7, // 반탄성계수
    density: 0.001, // 가벼운 밀도로 부유감
  });

  return body;
}
