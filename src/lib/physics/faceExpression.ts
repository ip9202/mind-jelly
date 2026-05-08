import type { JellyState, JellyFace } from '@/types/physics';

// 상태별 표정 매핑 (REQ-STA-001~004)
const STATE_FACE_MAP: Record<JellyState, JellyFace> = {
  idle: { eyes: '• •', mouth: 'o' },
  anticipation: { eyes: '• •', mouth: 'o' },
  eating: { eyes: 'u u', mouth: 'o' },
  satisfied: { eyes: '^ ^', mouth: '-' },
};

/**
 * 상태에 해당하는 표정을 반환한다
 *
 * @param state - 젤리 상태
 * @returns 표정 (eyes, mouth)
 */
// @MX:NOTE: 상태별 표정 매핑은 SPEC REQ-STA-001~004에 정의됨
// @MX:SPEC: SPEC-JELLY-001 REQ-STA-001, REQ-STA-002, REQ-STA-003, REQ-STA-004
export function getFaceForState(state: JellyState): JellyFace {
  return STATE_FACE_MAP[state] || STATE_FACE_MAP.idle;
}
