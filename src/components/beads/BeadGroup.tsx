'use client';

// T-015: BeadGroup 컴포넌트 (REQ-EVT-005)
import { useEffect, useRef, useState } from 'react';
import * as Matter from 'matter-js';
import { EMOTION_COLORS, BEAD_SIZES } from '@/lib/constants/emotion';

interface BeadGroupProps {
  count: number;
  engine: Matter.Engine | null;
  emotion: string;
}

interface BeadInfo {
  id: number;
  radius: number;
  color: string;
}

type BeadBody = Matter.Body & {
  plugin?: Record<string, unknown>;
  gravityScale?: number;
};

/**
 * 구슬 그룹 관리 컴포넌트
 * count가 증가할 때만 새 구슬을 생성하고, 물리엔진에서 제거된 구슬은 자동 필터링
 */
// @MX:ANCHOR: BeadGroup 컴포넌트
// @MX:REASON: PhysicsCanvas 내에서 구슬 생성 및 관리
// @MX:SPEC: REQ-EVT-005
export function BeadGroup({ count, engine, emotion }: BeadGroupProps) {
  const lastCreatedCountRef = useRef(0);
  const [beadInfos, setBeadInfos] = useState<Map<number, BeadInfo>>(new Map());

  // count 증가 시 새 구슬만 생성
  useEffect(() => {
    if (!engine || !engine.world || count <= lastCreatedCountRef.current) return;

    const color = EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#FFD93D';
    const newCount = count - lastCreatedCountRef.current;
    const newInfos = new Map<number, BeadInfo>();

    for (let i = 0; i < newCount; i++) {
      const size = BEAD_SIZES[i % BEAD_SIZES.length];
      // 상단에서 생성 (REQ-EVT-005), 측면 벽(x=220~580) 내부에 생성
      const x = 240 + Math.random() * 320;
      const y = 20 + Math.random() * 40;

      const bead = Matter.Bodies.circle(x, y, size, {
        label: 'bead',
        friction: 0.1,
        restitution: 0.7,
        density: 0.001,
      }) as BeadBody;

      // 중력 배율 0.5 (가벼운 부유감, REQ-UBI-002)
      bead.plugin = { ...bead.plugin, gravityScale: 0.5 };
      if ('gravityScale' in bead) {
        bead.gravityScale = 0.5;
      }

      Matter.Composite.add(engine.world, bead);
      newInfos.set(bead.id, { id: bead.id, radius: size / 2, color });
    }

    lastCreatedCountRef.current = count;
    setBeadInfos((prev) => {
      const next = new Map(prev);
      newInfos.forEach((info, id) => next.set(id, info));
      return next;
    });
  }, [count, engine, emotion]);

  // 언마운트 시 모든 구슬 정리
  useEffect(() => {
    return () => {
      if (engine?.world) {
        const allBodies = Matter.Composite.allBodies(engine.world);
        allBodies.forEach((b) => {
          if (b.label === 'bead') {
            try { Matter.Composite.remove(engine.world, b); } catch { /* 이미 제거됨 */ }
          }
        });
        setBeadInfos(new Map());
        lastCreatedCountRef.current = 0;
      }
    };
  }, [engine]);

  if (!engine) return null;

  // 물리엔진에서 현재 존재하는 구슬 바디만 렌더링
  const allBodies = Matter.Composite.allBodies(engine.world);
  const beadBodies = allBodies.filter((b) => b.label === 'bead');

  if (beadBodies.length === 0) return null;

  return (
    <svg
      data-testid="bead-group"
      viewBox="0 0 800 600"
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {beadBodies.map((bead) => {
          const info = beadInfos.get(bead.id);
          return (
            <circle
              key={bead.id}
              cx={bead.position.x}
              cy={bead.position.y}
              r={info?.radius || 9}
              fill={info?.color || '#FFD93D'}
              opacity={0.9}
            />
          );
        })}
      </g>
    </svg>
  );
}
