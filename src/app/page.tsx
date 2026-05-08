'use client';

import { useEffect, useState } from 'react';
import { PhysicsCanvas } from '@/components/jelly/PhysicsCanvas';
import { JellyRenderer } from '@/components/jelly/JellyRenderer';
import { BeadGroup } from '@/components/beads/BeadGroup';
import { TestInput } from '@/components/input/TestInput';
import { jellyStore } from '@/stores/jellyStore';
import type { JellyState } from '@/types/physics';

// 기본 젤리 정점 (초기 렌더링용)
const DEFAULT_BODIES = Array.from({ length: 25 }, (_, i) => ({
  position: {
    x: 400 + 60 * Math.cos((2 * Math.PI * i) / 25),
    y: 300 + 60 * Math.sin((2 * Math.PI * i) / 25),
  },
  circleRadius: 5,
}));

export default function Home() {
  const [state, setState] = useState<{
    currentState: JellyState;
    faceExpression: { eyes: string; mouth: string };
    animationParams: { scale: number; translateY: number; wobble: number };
    beadCount: number;
  }>({
    currentState: 'idle',
    faceExpression: { eyes: '• •', mouth: 'o' },
    animationParams: { scale: 1, translateY: 0, wobble: 0 },
    beadCount: 0,
  });

  useEffect(() => {
    const unsub = jellyStore.subscribe((s) => {
      setState({
        currentState: s.currentState,
        faceExpression: s.faceExpression,
        animationParams: s.animationParams,
        beadCount: s.beadCount,
      });
    });
    return unsub;
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <PhysicsCanvas width={800} height={600}>
        <JellyRenderer
          bodies={DEFAULT_BODIES}
          face={state.currentState}
          animation={state.animationParams.scale}
        />
        <BeadGroup count={state.beadCount} engine={null} />
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <TestInput />
        </div>
      </PhysicsCanvas>
    </div>
  );
}
