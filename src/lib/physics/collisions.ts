// T-013: 충돌 감지 (REQ-EVT-003)
import * as Matter from 'matter-js';

type CollisionCallback = (beadBody: Matter.Body, jellyBody: Matter.Body) => void;

/**
 * 충돌 감지 설정
 * @param engine Matter.js 엔진
 * @param onBeadCollision 충돌 시 호출할 콜백
 */
// @MX:ANCHOR: 충돌 감지 설정 함수
// @MX:REASON: PhysicsCanvas에서 시스템 이벤트 핸들러로 등록
// @MX:SPEC: REQ-EVT-003
export function setupCollisionDetection(
  engine: Matter.Engine,
  onBeadCollision: CollisionCallback
): void {
  Matter.Events.on(engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;

      // 구슬과 젤리 간 충돌 확인
      const isBeadCollision =
        (bodyA.label === 'bead' && bodyB.label === 'jelly') ||
        (bodyA.label === 'jelly' && bodyB.label === 'bead');

      if (isBeadCollision) {
        const beadBody = bodyA.label === 'bead' ? bodyA : bodyB;
        const jellyBody = bodyA.label === 'jelly' ? bodyA : bodyB;

        onBeadCollision(beadBody, jellyBody);

        // 구슬 제거
        Matter.Composite.remove(engine.world, beadBody);
      }
    });
  });
}
