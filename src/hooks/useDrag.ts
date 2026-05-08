// T-018: useDrag 훅 (REQ-EVT-001, REQ-EVT-006)
import { useState, useCallback, useRef } from 'react';
import * as Matter from 'matter-js';

interface DragState {
  isDragging: boolean;
  startDrag: (e: React.PointerEvent) => void;
  onDrag: (e: React.PointerEvent) => void;
  endDrag: () => void;
}

/**
 * 드래그 인터랙션 관리 커스텀 훅
 * @param body 드래그할 Matter.js 바디
 * @returns 드래그 상태 및 핸들러
 */
// @MX:ANCHOR: useDrag 훅
// @MX:REASON: JellyRenderer에서 드래그 인터랙션 처리
// @MX:SPEC: REQ-EVT-001, REQ-EVT-006
export function useDrag(body: Matter.Body | null): DragState {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previousStateRef = useRef<{ isStatic: boolean }>({ isStatic: false });

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!body) return;

      // 이전 상태 저장
      previousStateRef.current = { isStatic: body.isStatic };

      // Kinematic으로 변환 (드래그 중)
      Matter.Body.setStatic(body, true);

      // 오프셋 계산
      dragOffsetRef.current = {
        x: e.clientX - body.position.x,
        y: e.clientY - body.position.y,
      };

      setIsDragging(true);
    },
    [body]
  );

  const onDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!body || !isDragging) return;

      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      Matter.Body.setPosition(body, { x: newX, y: newY });
    },
    [body, isDragging]
  );

  const endDrag = useCallback(() => {
    if (!body) return;

    // Dynamic으로 복원
    Matter.Body.setStatic(body, previousStateRef.current.isStatic);

    // 속도 유지 (자연스러운 운동감)
    Matter.Body.setVelocity(body, { x: 0, y: 0 });

    setIsDragging(false);
  }, [body]);

  return {
    isDragging,
    startDrag,
    onDrag,
    endDrag,
  };
}
