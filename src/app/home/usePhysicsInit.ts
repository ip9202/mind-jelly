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
  /** 젤리 위치 업데이트 콜백 (useRef로 변경하여 리렌링 방지) */
  jellyPosRef: React.MutableRefObject<{ x: number; y: number }>;
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
  const { matterReady, matterRef, jellyPosRef } = options;

  const engineRef = useRef<Engine | null>(null);
  const collisionSetupRef = useRef(false);
  const animRef = useRef<number>(0);
  const satisfiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (satisfiedTimerRef.current) clearTimeout(satisfiedTimerRef.current);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
      engineRef.current = null;
    };
  }, []);

  const initPhysics = useCallback(
    (engine: Engine | null) => {
      if (!engine || !matterReady || engineRef.current) return;

      engineRef.current = engine;
      const Matter = matterRef.current!;

      // 시뮬레이션 속도 기본값
      engine.timing.timeScale = 1.0;

      // 중력 설정 (떠다님 + 구슬 낙하용, 표준)
      engine.gravity.y = 1;

      // 캔버스 논리 크기 (모바일에서 축소 렌더링)
      const W = 800;
      const H = 600;
      const cx = W / 2;
      const cy = H * 0.5; // 캔버스 중앙

      // 젤리 바디 생성
      const jellyBody = Matter.Bodies.circle(cx, cy, 40, {
        label: 'jelly',
        restitution: 0.6,
        friction: 0.05,
        frictionAir: 0.015, // 풍선 같은 가벼운 공기 저항
        density: 0.001,
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
      setupCollisionDetection(engine, () => {
        const state = jellyStore.getState();

        // idle -> anticipation -> eating 전이
        if (state.currentState === 'idle') {
          state.transitionState('anticipation');
          setTimeout(() => {
            jellyStore.getState().transitionState('eating');
          }, 400);
        } else if (state.currentState === 'anticipation') {
          jellyStore.getState().transitionState('eating');
        } else if (state.currentState === 'eating') {
          // 이미 eating 상태 — 유지 (추가 전이 불필요)
        }

        // 남은 구슬 확인 (Matter.js 바디 기준)
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

          // @MX:NOTE: [AUTO] 모든 구슬 먹힘 → satisfied 전이 (idle 전이는 page.tsx에서 관리)
          satisfiedTimerRef.current = setTimeout(() => {
            const st = jellyStore.getState();
            if (st.currentState !== 'satisfied') {
              st.transitionState('satisfied');
            }
            // idle 자동 전이 제거 — page.tsx의 beads→report→idle 플로우가 대신 처리
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
            jellyPosRef.current = { x: jelly.position.x, y: jelly.position.y };

            // 중력 상쇄: 스프링만으로 정확한 타겟 위치 유지
            const gScale = eng.gravity.scale ?? 0.001;
            Matter.Body.applyForce(jelly, jelly.position, {
              x: 0,
              y: -(jelly.mass * eng.gravity.y * gScale),
            });

            // 속도 제한 (부드러운 떠다님)
            const maxSpeed = 15;
            const speed = Math.sqrt(jelly.velocity.x ** 2 + jelly.velocity.y ** 2);
            if (speed > maxSpeed) {
              const scale = maxSpeed / speed;
              Matter.Body.setVelocity(jelly, {
                x: jelly.velocity.x * scale,
                y: jelly.velocity.y * scale,
              });
            }

            // 젤리 중앙 복귀 스프링 힘
            const springKX = 0.00006;
            const springKY = 0.00015;
            Matter.Body.applyForce(jelly, jelly.position, {
              x: (cx - jelly.position.x) * springKX,
              y: (cy - jelly.position.y) * springKY,
            });

            // 수평 둥둥 떠다니는 힘 - sin파로 좌우 드리프트
            const driftForce = Math.sin(Date.now() * 0.001) * 0.00004;
            Matter.Body.applyForce(jelly, jelly.position, {
              x: driftForce,
              y: 0,
            });

            // 자기장 힘 적용 (REQ-EVT-002, REQ-STA-005)
            const beadBodies = allBodies.filter((b) => b.label === 'bead');
            if (beadBodies.length > 0) {
              applyMagneticField(beadBodies, jelly.position);

              // 구슬 부유력: 중력의 70%를 상쇄하여 천천히 떨어짐
              // @MX:NOTE: 0.8은 자기장과의 평형으로 정지 발생 → 0.7로 완화 (이전 -0.6 대비 약 25% 느림)
              const gScale = eng.gravity.scale ?? 0.001;
              beadBodies.forEach((bead) => {
                Matter.Body.applyForce(bead, bead.position, {
                  x: 0,
                  y: -0.7 * bead.mass * eng.gravity.y * gScale,
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

              // stuck 감지: 구슬이 1개 남고 eating/anticipation 상태인데 3초 이상 지속되면 강제 진행
              const currentSt = jellyStore.getState();
              if (
                beadBodies.length === 1 &&
                (currentSt.currentState === 'eating' || currentSt.currentState === 'anticipation')
              ) {
                if (!stuckTimerRef.current) {
                  stuckTimerRef.current = setTimeout(() => {
                    const s = jellyStore.getState();
                    if (s.currentState !== 'satisfied') {
                      // 마지막 구슬 강제 제거 후 satisfied 전이
                      const lastBead = Matter.Composite.allBodies(eng.world)
                        .find((b) => b.label === 'bead');
                      if (lastBead) Matter.Composite.remove(eng.world, lastBead);
                      s.transitionState('satisfied');
                    }
                    stuckTimerRef.current = null;
                  }, 3000);
                }
              } else {
                // 구슬이 2개 이상이거나 다른 상태면 stuck 타이머 리셋
                if (stuckTimerRef.current) {
                  clearTimeout(stuckTimerRef.current);
                  stuckTimerRef.current = null;
                }
              }
            }
          }
        }
        animRef.current = requestAnimationFrame(track);
      };
      animRef.current = requestAnimationFrame(track);
    },
    [matterReady, matterRef, jellyPosRef],
  );

  return { engineRef, initPhysics };
}
