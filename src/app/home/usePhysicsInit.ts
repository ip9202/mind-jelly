'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Engine } from 'matter-js';
import { jellyStore } from '@/stores/jellyStore';
import { setupCollisionDetection } from '@/lib/physics/collisions';
import { applyMagneticField } from '@/lib/physics/forces';

/**
 * usePhysicsInit 훅 옵션
 */
interface UsePhysicsInitOptions {
  /** Matter.js 모듈 로드 완료 여부 */
  matterReady: boolean;
  /** 동적으로 로드된 Matter.js 모듈 참조 */
  matterRef: React.RefObject<typeof import('matter-js') | null>;
  /** 젤리 위치 업데이트 콜백 */
  setJellyPos: (pos: { x: number; y: number }) => void;
}

/**
 * usePhysicsInit 반환값
 */
interface UsePhysicsInitReturn {
  /** 물리 엔진 참조 (JSX에서 BeadGroup 등에 필요) */
  engineRef: React.RefObject<Engine | null>;
  /** PhysicsCanvas render prop 내에서 호출할 초기화 함수 */
  initPhysics: (engine: Engine | null) => void;
}

/**
 * 물리 엔진 초기화 훅
 *
 * PhysicsCanvas의 render prop 콜백 내에서 호출하는 initPhysics 함수를 제공한다.
 * 엔진 생성, 벽 생성, 충돌 감지 설정, 애니메이션 루프를 캡슐화한다.
 * 언마운트 시 모든 리소스를 자동으로 정리한다.
 */
export function usePhysicsInit(options: UsePhysicsInitOptions): UsePhysicsInitReturn {
  const { matterReady, matterRef, setJellyPos } = options;

  const engineRef = useRef<Engine | null>(null);
  const collisionSetupRef = useRef(false);
  const animRef = useRef<number>(0);
  const satisfiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (satisfiedTimerRef.current) clearTimeout(satisfiedTimerRef.current);
      engineRef.current = null;
    };
  }, []);

  const initPhysics = useCallback(
    (engine: Engine | null) => {
      if (!engine || !matterReady || engineRef.current) return;

      engineRef.current = engine;
      const Matter = matterRef.current!;

      // 전체 시뮬레이션 속도 절반 (젤리/구슬 동작이 시각적으로 보이도록)
      engine.timing.timeScale = 0.5;

      // 캔버스 논리 크기 (모바일에서 축소 렌더링)
      const W = 800;
      const H = 600;
      const cx = W / 2;
      const cy = H * 0.4;

      // 젤리 바디 생성
      const jellyBody = Matter.Bodies.circle(cx, cy, 40, {
        label: 'jelly',
        restitution: 0.5,
        friction: 0.1,
        density: 0.002,
      });
      Matter.Composite.add(engine.world, jellyBody);

      // 벽 생성 (바닥, 천장, 좌측, 우측)
      const walls = [
        Matter.Bodies.rectangle(cx, H - 5, W, 10, { isStatic: true, restitution: 0.3 }),
        Matter.Bodies.rectangle(cx, 5, W, 10, { isStatic: true, restitution: 0.3 }),
        Matter.Bodies.rectangle(W * 0.275, H / 2, 10, H, { isStatic: true, restitution: 0.3 }),
        Matter.Bodies.rectangle(W * 0.725, H / 2, 10, H, { isStatic: true, restitution: 0.3 }),
      ];
      Matter.Composite.add(engine.world, walls);

      // 충돌 감지 설정 (REQ-EVT-003)
      setupCollisionDetection(engine, (_beadBody, _jellyBody) => {
        const state = jellyStore.getState();

        // idle -> anticipation -> eating 전이
        if (state.currentState === 'idle') {
          state.transitionState('anticipation');
          setTimeout(() => {
            jellyStore.getState().transitionState('eating');
          }, 400);
        } else if (state.currentState === 'anticipation') {
          jellyStore.getState().transitionState('eating');
        }

        // 구슬 개수 감소
        state.decrementBeadCount();

        // 남은 구슬 확인
        const remainingBeads = Matter.Composite.allBodies(engine.world)
          .filter((b) => b.label === 'bead').length;

        // 모든 구슬이 먹히면 satisfied -> (3s) -> idle + 젤리 중앙 복귀
        if (remainingBeads <= 1) {
          if (satisfiedTimerRef.current) clearTimeout(satisfiedTimerRef.current);

          // 젤리를 중앙으로 즉시 리셋
          const jellyBody = Matter.Composite.allBodies(engine.world)
            .find((b) => b.label === 'jelly');
          if (jellyBody) {
            Matter.Body.setPosition(jellyBody, { x: cx, y: cy });
            Matter.Body.setVelocity(jellyBody, { x: 0, y: 0 });
          }

          satisfiedTimerRef.current = setTimeout(() => {
            const st = jellyStore.getState();
            if (st.currentState !== 'satisfied') {
              st.transitionState('satisfied');
            }
            satisfiedTimerRef.current = setTimeout(() => {
              jellyStore.getState().transitionState('idle');
            }, 3000);
          }, 500);
        }
      });

      collisionSetupRef.current = true;

      // 애니메이션 루프: 젤리 위치 추적 + 자기장 적용
      const track = () => {
        const eng = engineRef.current;
        if (eng?.world) {
          const allBodies = Matter.Composite.allBodies(eng.world);
          const jelly = allBodies.find((b) => b.label === 'jelly');
          if (jelly) {
            setJellyPos({ x: jelly.position.x, y: jelly.position.y });

            // 젤리 중앙 복귀 스프링 힘 (항상 중앙으로 약하게 당김)
            const springK = 0.00015;
            Matter.Body.applyForce(jelly, jelly.position, {
              x: (cx - jelly.position.x) * springK,
              y: (cy - jelly.position.y) * springK,
            });

            // 자기장 힘 적용 (REQ-EVT-002, REQ-STA-005)
            const beadBodies = allBodies.filter((b) => b.label === 'bead');
            if (beadBodies.length > 0) {
              applyMagneticField(beadBodies, jelly.position);

              // 구슬 부유력: 중력의 40%를 상쇄하여 가벼운 부유감
              const gScale = eng.gravity.scale ?? 0.001;
              beadBodies.forEach((bead) => {
                Matter.Body.applyForce(bead, bead.position, {
                  x: 0,
                  y: -0.6 * bead.mass * eng.gravity.y * gScale,
                });
              });

              // 구슬이 자기장 반경 진입 시 anticipation 트리거
              const st = jellyStore.getState();
              if (st.currentState === 'idle') {
                const nearJelly = beadBodies.some((b) => {
                  const dx = b.position.x - jelly.position.x;
                  const dy = b.position.y - jelly.position.y;
                  return Math.sqrt(dx * dx + dy * dy) < 250;
                });
                if (nearJelly) {
                  st.transitionState('anticipation');
                }
              }
            }
          }
        }
        animRef.current = requestAnimationFrame(track);
      };
      animRef.current = requestAnimationFrame(track);
    },
    [matterReady, matterRef, setJellyPos],
  );

  return { engineRef, initPhysics };
}
