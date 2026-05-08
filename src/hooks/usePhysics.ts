// T-011: usePhysics 훅 (REQ-UBI-001, REQ-UNW-002)
import { useEffect, useRef, useCallback } from 'react';
import * as Matter from 'matter-js';

/**
 * 물리 엔진 라이프사이클 관리 커스텀 훅
 * @returns { engineRef, update } - 엔진 ref와 업데이트 함수
 */
// @MX:ANCHOR: usePhysics 훅
// @MX:REASON: PhysicsCanvas와 JellyRenderer에서 공통으로 사용
// @MX:SPEC: REQ-UBI-001, REQ-UNW-002
export function usePhysics() {
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  // 엔진 초기화
  useEffect(() => {
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 },
    });

    engineRef.current = engine;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    return () => {
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, []);

  // 업데이트 함수
  const update = useCallback((deltaTime: number) => {
    if (engineRef.current) {
      Matter.Engine.update(engineRef.current, deltaTime);
    }
  }, []);

  return {
    engineRef,
    update,
  };
}
