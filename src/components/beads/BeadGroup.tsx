'use client';

// T-015: BeadGroup 컴포넌트 (REQ-EVT-005)
import { useEffect, useState } from 'react';
import * as Matter from 'matter-js';
import { createBeadBody } from '@/lib/physics/beadBody';
import { BEAD_SIZES, BEAD_COLORS } from '@/lib/constants/emotion';

interface BeadGroupProps {
  count: number;
  engine: Matter.Engine | null;
}

interface BeadVisual {
  body: Matter.Body;
  radius: number;
  color: string;
}

/**
 * 구슬 그룹 관리 컴포넌트
 */
// @MX:ANCHOR: BeadGroup 컴포넌트
// @MX:REASON: PhysicsCanvas 내에서 구슬 생성 및 관리
// @MX:SPEC: REQ-EVT-005
export function BeadGroup({ count, engine }: BeadGroupProps) {
  const [beads, setBeads] = useState<BeadVisual[]>([]);

  useEffect(() => {
    if (!engine || !engine.world || count === 0) {
      setBeads([]); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    try {
      const newBeads: BeadVisual[] = [];

      for (let i = 0; i < count; i++) {
        const size = BEAD_SIZES[i % BEAD_SIZES.length];
        const x = 100 + Math.random() * 600;
        const y = 100 + Math.random() * 400;
        const color = BEAD_COLORS[i % BEAD_COLORS.length];

        const bead = createBeadBody(x, y, size);
        bead.label = 'bead';

        newBeads.push({ body: bead, radius: size / 2, color });
        Matter.Composite.add(engine.world, bead);
      }

      setBeads(newBeads);

      return () => {
        try {
          newBeads.forEach(({ body }) => {
            Matter.Composite.remove(engine.world, body);
          });
        } catch {
          // 이미 제거된 경우 무시
        }
      };
    } catch (e) {
      console.error('Bead creation error:', e);
      setBeads([]);
    }
  }, [count, engine]);

  return (
    <g>
      {beads.map((bead, index) => (
        <circle
          key={index}
          cx={bead.body.position.x}
          cy={bead.body.position.y}
          r={bead.radius}
          fill={bead.color || '#FFD700'}
        />
      ))}
    </g>
  );
}
