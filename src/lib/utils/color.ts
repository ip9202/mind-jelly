/**
 * 색상 변환 유틸리티
 * M2-T4: hex→rgba 변환 (글로우 효과용)
 * @MX:SPEC: SPEC-JELLY-002 M2
 */

/**
 * hex 색상 문자열을 rgba 문자열로 변환한다
 * @param hex - 6자리 hex 색상 (예: '#FFD93D')
 * @param alpha - 투명도 (0~1, 기본값 1)
 * @returns rgba 문자열 (예: 'rgba(255, 217, 61, 0.4)')
 */
// @MX:ANCHOR: [AUTO] 글로우 효과 색상 변환 (JellyRenderer, 향후 BeadGroup 등에서 사용)
// @MX:REASON: 감정 색상 → rgba 변환은 다수 컴포넌트에서 필요
// @MX:SPEC: SPEC-JELLY-002 M2-T4
export function hexToRgba(hex: string, alpha: number = 1): string {
  // @MX:NOTE: 대소문자 구분 없이 처리
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * hex 색상을 amount만큼 밝게 변환 (그라디언트 하이라이트용)
 * @param hex - 6자리 hex 색상 (예: '#FFD93D')
 * @param amount - 각 채널에 더할 값 (0~255)
 * @returns rgb 문자열 (예: 'rgb(255,255,150)')
 */
export function lightenHex(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + amount);
  return `rgb(${r},${g},${b})`;
}

/**
 * hex 색상을 amount만큼 어둡게 변환 (그라디언트 그림자용)
 * @param hex - 6자리 hex 색상 (예: '#FFD93D')
 * @param amount - 각 채널에서 뺄 값 (0~255)
 * @returns rgb 문자열 (예: 'rgb(200,170,30)')
 */
export function darkenHex(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, parseInt(h.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(h.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(h.substring(4, 6), 16) - amount);
  return `rgb(${r},${g},${b})`;
}
