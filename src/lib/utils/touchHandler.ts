/**
 * SPEC-TOUCH-001: 터치 핸들링 유틸리티
 *
 * 젤리 터치 hit-test 및 터치 처리 가능 여부 판단 로직
 * REQ-TOUCH-001, REQ-TOUCH-005
 */

interface TouchPosition {
  x: number;
  y: number;
}

interface ShouldHandleTouchParams {
  currentState: string;
  canTouch: boolean;
  isOnJelly: boolean;
}

/**
 * 터치 좌표가 젤리 바디 영역 내인지 확인
 * REQ-TOUCH-001: 반경 circleRadius * 1.5 이내 hit test
 */
export function isTouchOnJelly(
  pointerX: number,
  pointerY: number,
  jellyPos: TouchPosition,
  jellyRadius: number,
): boolean {
  const dx = pointerX - jellyPos.x;
  const dy = pointerY - jellyPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const hitRadius = jellyRadius * 1.5;
  return distance <= hitRadius;
}

/**
 * 터치 이벤트를 처리해야 하는지 판단
 * REQ-TOUCH-005: eating/satisfied 상태에서 무시, 1초 쿨다운 적용
 */
export function shouldHandleTouch(params: ShouldHandleTouchParams): boolean {
  const { currentState, canTouch, isOnJelly } = params;

  // idle 상태에서만 터치 반응
  if (currentState !== 'idle') return false;

  // 쿨다운 체크
  if (!canTouch) return false;

  // 젤리 바디 hit test
  if (!isOnJelly) return false;

  return true;
}
