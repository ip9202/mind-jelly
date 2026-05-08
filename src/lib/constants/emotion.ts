/**
 * 감정/구슬 상수 정의
 * REQ-EVT-005
 * @MX:NOTE: 감정별 색상 매핑 (P0 단계는 하드코딩)
 * @MX:SPEC: REQ-EVT-005
 */

// @MX:NOTE: 기본 감정 색상 매핑
// @MX:SPEC: REQ-EVT-005
export const EMOTION_COLORS = {
  joy: '#FFD93D', // 기쁨: 밝은 노란색
  sadness: '#6BCB77', // 슬픔: 차분한 초록색
  anger: '#FF6B6B', // 분노: 강렬한 빨간색
  fear: '#4D96FF', // 공포: 시원한 파란색
  disgust: '#A8E6CF', // 혐오: 연한 민트색
} as const;

// @MX:NOTE: 구슬 색상 팔레트 (랜덤 선택용)
// @MX:SPEC: REQ-EVT-005
export const BEAD_COLORS = [
  '#FFD93D', // 노란색
  '#FF6B6B', // 빨간색
  '#4D96FF', // 파란색
  '#6BCB77', // 초록색
  '#A8E6CF', // 민트색
  '#FF9FF3', // 분홍색
  '#FECA57', // 주황색
  '#54A0FF', // 하늘색
] as const;

// @MX:ANCHOR: 젤리 기본 색상 (다수 컴포넌트에서 사용)
// @MX:REASON: JellyRenderer, BeadGroup 등 3개 이상의 모듈에서 참조
// @MX:SPEC: REQ-UBI-002
export const JELLY_COLOR = '#FFD1DC'; // 젤리 기본 색상: 연한 분홍색

// @MX:NOTE: 구슬 크기 옵션 (소/중/대)
// @MX:SPEC: REQ-EVT-005
export const BEAD_SIZES = [12, 18, 24] as const;
