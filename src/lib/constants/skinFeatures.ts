/**
 * skinFeatures.ts
 *
 * 스킨별 동물 특징 SVG 요소 정의
 * viewBox="0 0 1 1" 좌표계에서 젤리 바디 주변에 배치되는
 * 귀, 뿔, 꼬리 등 동물 특유의 장식 요소
 *
 * 젤리 바디는 대략 x: 0.15~0.85, y: 0.15~0.85 영역을 차지하며,
 * 스킨 피처는 바디 외곽(위쪽 y<0.15, 옆쪽 x>0.85, 아래쪽 y>0.85)에 배치됨.
 */

// @MX:ANCHOR: [AUTO] 스킨 피처 SVG 정의 (JellyRenderer + docs/jelly-skins.html 2곳 이상에서 사용)
// @MX:REASON: 10종 스킨의 동물 특징 SVG 요소를 단일 소스로 관리

export interface SkinFeature {
  /** SVG 요소 타입 */
  type: 'path' | 'circle' | 'ellipse';
  /** SVG 속성 (path의 d, circle의 cx/cy/r 등) */
  attrs: Record<string, string | number>;
  /** 색상 키: primary/accent/dark/white → SKIN_THEMES에서 매핑 */
  colorKey: 'primary' | 'accent' | 'dark' | 'white';
  /** 투명도 */
  opacity?: number;
  /** 외곽선 (선택) */
  stroke?: { color: string; width: number };
}

// Rare 스킨 피처 (파란색 테마)

const BEAR_FEATURES: SkinFeature[] = [
  // 왼쪽 둥근 귀
  { type: 'circle', attrs: { cx: 0.28, cy: 0.12, r: 0.065 }, colorKey: 'primary', opacity: 0.9 },
  // 오른쪽 둥근 귀
  { type: 'circle', attrs: { cx: 0.72, cy: 0.12, r: 0.065 }, colorKey: 'primary', opacity: 0.9 },
  // 왼쪽 귀 안쪽
  { type: 'circle', attrs: { cx: 0.28, cy: 0.12, r: 0.035 }, colorKey: 'accent', opacity: 0.7 },
  // 오른쪽 귀 안쪽
  { type: 'circle', attrs: { cx: 0.72, cy: 0.12, r: 0.035 }, colorKey: 'accent', opacity: 0.7 },
];

const CAT_FEATURES: SkinFeature[] = [
  // 왼쪽 뾰족 귀 (삼각형 path)
  { type: 'path', attrs: { d: 'M 0.25 0.18 L 0.20 0.02 L 0.38 0.13 Z' }, colorKey: 'primary', opacity: 0.9 },
  // 오른쪽 뾰족 귀
  { type: 'path', attrs: { d: 'M 0.75 0.18 L 0.80 0.02 L 0.62 0.13 Z' }, colorKey: 'primary', opacity: 0.9 },
  // 왼쪽 귀 안쪽
  { type: 'path', attrs: { d: 'M 0.27 0.16 L 0.24 0.06 L 0.35 0.14 Z' }, colorKey: 'accent', opacity: 0.6 },
  // 오른쪽 귀 안쪽
  { type: 'path', attrs: { d: 'M 0.73 0.16 L 0.76 0.06 L 0.65 0.14 Z' }, colorKey: 'accent', opacity: 0.6 },
  // 왼쪽 수염
  { type: 'path', attrs: { d: 'M 0.18 0.48 L 0.08 0.44 M 0.18 0.52 L 0.06 0.52 M 0.18 0.56 L 0.08 0.60' }, colorKey: 'dark', opacity: 0.5 },
  // 오른쪽 수염
  { type: 'path', attrs: { d: 'M 0.82 0.48 L 0.92 0.44 M 0.82 0.52 L 0.94 0.52 M 0.82 0.56 L 0.92 0.60' }, colorKey: 'dark', opacity: 0.5 },
];

const PANDA_FEATURES: SkinFeature[] = [
  // 왼쪽 둥근 귀
  { type: 'circle', attrs: { cx: 0.26, cy: 0.12, r: 0.065 }, colorKey: 'dark', opacity: 0.9 },
  // 오른쪽 둥근 귀
  { type: 'circle', attrs: { cx: 0.74, cy: 0.12, r: 0.065 }, colorKey: 'dark', opacity: 0.9 },
  // 왼쪽 눈가리개 (판다 아이패치)
  { type: 'ellipse', attrs: { cx: 0.38, cy: 0.40, rx: 0.07, ry: 0.055 }, colorKey: 'dark', opacity: 0.35 },
  // 오른쪽 눈가리개
  { type: 'ellipse', attrs: { cx: 0.62, cy: 0.40, rx: 0.07, ry: 0.055 }, colorKey: 'dark', opacity: 0.35 },
];

const RABBIT_FEATURES: SkinFeature[] = [
  // 왼쪽 긴 귀
  { type: 'path', attrs: { d: 'M 0.34 0.15 C 0.30 0.08 0.28 -0.02 0.32 -0.08 C 0.36 -0.12 0.40 -0.06 0.40 0.02 C 0.40 0.08 0.38 0.14 0.38 0.15 Z' }, colorKey: 'primary', opacity: 0.9 },
  // 오른쪽 긴 귀
  { type: 'path', attrs: { d: 'M 0.66 0.15 C 0.70 0.08 0.72 -0.02 0.68 -0.08 C 0.64 -0.12 0.60 -0.06 0.60 0.02 C 0.60 0.08 0.62 0.14 0.62 0.15 Z' }, colorKey: 'primary', opacity: 0.9 },
  // 왼쪽 귀 안쪽
  { type: 'path', attrs: { d: 'M 0.35 0.14 C 0.32 0.08 0.31 0.00 0.33 -0.05 C 0.35 -0.08 0.37 -0.04 0.38 0.02 C 0.38 0.08 0.37 0.12 0.37 0.14 Z' }, colorKey: 'accent', opacity: 0.6 },
  // 오른쪽 귀 안쪽
  { type: 'path', attrs: { d: 'M 0.65 0.14 C 0.68 0.08 0.69 0.00 0.67 -0.05 C 0.65 -0.08 0.63 -0.04 0.62 0.02 C 0.62 0.08 0.63 0.12 0.63 0.14 Z' }, colorKey: 'accent', opacity: 0.6 },
];

const FOX_FEATURES: SkinFeature[] = [
  // 왼쪽 넓은 뾰족 귀
  { type: 'path', attrs: { d: 'M 0.22 0.18 L 0.14 0.00 L 0.38 0.12 Z' }, colorKey: 'primary', opacity: 0.9 },
  // 오른쪽 넓은 뾰족 귀
  { type: 'path', attrs: { d: 'M 0.78 0.18 L 0.86 0.00 L 0.62 0.12 Z' }, colorKey: 'primary', opacity: 0.9 },
  // 왼쪽 귀 안쪽
  { type: 'path', attrs: { d: 'M 0.24 0.16 L 0.19 0.04 L 0.34 0.13 Z' }, colorKey: 'accent', opacity: 0.6 },
  // 오른쪽 귀 안쪽
  { type: 'path', attrs: { d: 'M 0.76 0.16 L 0.81 0.04 L 0.66 0.13 Z' }, colorKey: 'accent', opacity: 0.6 },
  // 코/주둥이 흰색 패치
  { type: 'ellipse', attrs: { cx: 0.50, cy: 0.72, rx: 0.12, ry: 0.08 }, colorKey: 'white', opacity: 0.25 },
];

// Epic 스킨 피처 (보라색 테마)

const UNICORN_FEATURES: SkinFeature[] = [
  // 나선형 뿔
  { type: 'path', attrs: { d: 'M 0.50 0.15 L 0.48 0.00 L 0.52 0.04 L 0.48 0.08 L 0.52 0.12 L 0.50 0.15 Z' }, colorKey: 'accent', opacity: 0.95 },
  // 왼쪽 작은 귀
  { type: 'path', attrs: { d: 'M 0.34 0.16 L 0.30 0.06 L 0.42 0.13 Z' }, colorKey: 'primary', opacity: 0.85 },
  // 오른쪽 작은 귀
  { type: 'path', attrs: { d: 'M 0.66 0.16 L 0.70 0.06 L 0.58 0.13 Z' }, colorKey: 'primary', opacity: 0.85 },
  // 별 장식 (뿔 옆)
  { type: 'circle', attrs: { cx: 0.56, cy: 0.06, r: 0.012 }, colorKey: 'accent', opacity: 0.7 },
  { type: 'circle', attrs: { cx: 0.44, cy: 0.08, r: 0.008 }, colorKey: 'accent', opacity: 0.5 },
];

const DOLPHIN_FEATURES: SkinFeature[] = [
  // 등지느러미 (위쪽 돌기)
  { type: 'path', attrs: { d: 'M 0.48 0.15 C 0.46 0.08 0.44 0.02 0.50 0.00 C 0.56 0.02 0.54 0.08 0.52 0.15 Z' }, colorKey: 'primary', opacity: 0.9 },
  // 부리/주둥이 힌트
  { type: 'path', attrs: { d: 'M 0.40 0.68 C 0.36 0.72 0.30 0.74 0.28 0.72' }, colorKey: 'primary', opacity: 0.6, stroke: { color: 'primary', width: 0.006 } },
  // 배 부분 밝은 색
  { type: 'ellipse', attrs: { cx: 0.50, cy: 0.72, rx: 0.15, ry: 0.06 }, colorKey: 'accent', opacity: 0.2 },
  // 작은 물방울 장식
  { type: 'circle', attrs: { cx: 0.82, cy: 0.70, r: 0.012 }, colorKey: 'accent', opacity: 0.5 },
  { type: 'circle', attrs: { cx: 0.88, cy: 0.76, r: 0.008 }, colorKey: 'accent', opacity: 0.3 },
];

const BUTTERFLY_FEATURES: SkinFeature[] = [
  // 왼쪽 더듬이 (줄기 + 끝점)
  { type: 'path', attrs: { d: 'M 0.40 0.15 C 0.36 0.06 0.30 0.02 0.28 0.00' }, colorKey: 'dark', opacity: 0.7, stroke: { color: 'dark', width: 0.005 } },
  // 오른쪽 더듬이
  { type: 'path', attrs: { d: 'M 0.60 0.15 C 0.64 0.06 0.70 0.02 0.72 0.00' }, colorKey: 'dark', opacity: 0.7, stroke: { color: 'dark', width: 0.005 } },
  // 왼쪽 더듬이 끝 둥근 점
  { type: 'circle', attrs: { cx: 0.28, cy: 0.00, r: 0.018 }, colorKey: 'primary', opacity: 0.8 },
  // 오른쪽 더듬이 끝 둥근 점
  { type: 'circle', attrs: { cx: 0.72, cy: 0.00, r: 0.018 }, colorKey: 'primary', opacity: 0.8 },
  // 날개 힌트 (좌측)
  { type: 'path', attrs: { d: 'M 0.15 0.42 C 0.06 0.36 0.02 0.28 0.08 0.24 C 0.12 0.22 0.16 0.30 0.15 0.42 Z' }, colorKey: 'primary', opacity: 0.25 },
  // 날개 힌트 (우측)
  { type: 'path', attrs: { d: 'M 0.85 0.42 C 0.94 0.36 0.98 0.28 0.92 0.24 C 0.88 0.22 0.84 0.30 0.85 0.42 Z' }, colorKey: 'primary', opacity: 0.25 },
];

// Legendary 스킨 피처 (금색 테마)

const DRAGON_FEATURES: SkinFeature[] = [
  // 왼쪽 뿔
  { type: 'path', attrs: { d: 'M 0.32 0.15 L 0.26 0.00 L 0.38 0.10 Z' }, colorKey: 'primary', opacity: 0.95 },
  // 오른쪽 뿔
  { type: 'path', attrs: { d: 'M 0.68 0.15 L 0.74 0.00 L 0.62 0.10 Z' }, colorKey: 'primary', opacity: 0.95 },
  // 왼쪽 작은 날개
  { type: 'path', attrs: { d: 'M 0.15 0.40 C 0.06 0.34 0.00 0.40 0.02 0.50 C 0.04 0.56 0.10 0.58 0.15 0.55 Z' }, colorKey: 'primary', opacity: 0.5 },
  // 오른쪽 작은 날개
  { type: 'path', attrs: { d: 'M 0.85 0.40 C 0.94 0.34 1.00 0.40 0.98 0.50 C 0.96 0.56 0.90 0.58 0.85 0.55 Z' }, colorKey: 'primary', opacity: 0.5 },
  // 꼬리 끝 (아래쪽)
  { type: 'path', attrs: { d: 'M 0.82 0.82 C 0.88 0.86 0.94 0.88 0.96 0.84 C 0.94 0.82 0.90 0.84 0.86 0.82 Z' }, colorKey: 'accent', opacity: 0.7 },
  // 비늘 패턴 힌트
  { type: 'ellipse', attrs: { cx: 0.50, cy: 0.70, rx: 0.10, ry: 0.04 }, colorKey: 'accent', opacity: 0.15 },
];

const PHOENIX_FEATURES: SkinFeature[] = [
  // 불꽃 볏 (중앙)
  { type: 'path', attrs: { d: 'M 0.50 0.15 C 0.46 0.06 0.42 -0.04 0.48 -0.08 C 0.50 -0.02 0.50 0.04 0.52 -0.08 C 0.58 -0.04 0.54 0.06 0.50 0.15 Z' }, colorKey: 'primary', opacity: 0.95 },
  // 불꽃 볏 (왼쪽)
  { type: 'path', attrs: { d: 'M 0.42 0.16 C 0.38 0.08 0.34 0.00 0.38 -0.04 C 0.40 0.02 0.42 0.08 0.44 0.14 Z' }, colorKey: 'accent', opacity: 0.8 },
  // 불꽃 볏 (오른쪽)
  { type: 'path', attrs: { d: 'M 0.58 0.16 C 0.62 0.08 0.66 0.00 0.62 -0.04 C 0.60 0.02 0.58 0.08 0.56 0.14 Z' }, colorKey: 'accent', opacity: 0.8 },
  // 꼬리 깃털 (중앙)
  { type: 'path', attrs: { d: 'M 0.50 0.85 C 0.48 0.92 0.46 1.00 0.50 1.04 C 0.54 1.00 0.52 0.92 0.50 0.85 Z' }, colorKey: 'primary', opacity: 0.7 },
  // 꼬리 깃털 (왼쪽)
  { type: 'path', attrs: { d: 'M 0.42 0.82 C 0.38 0.90 0.34 0.98 0.36 1.02 C 0.40 0.98 0.42 0.90 0.44 0.84 Z' }, colorKey: 'accent', opacity: 0.6 },
  // 꼬리 깃털 (오른쪽)
  { type: 'path', attrs: { d: 'M 0.58 0.82 C 0.62 0.90 0.66 0.98 0.64 1.02 C 0.60 0.98 0.58 0.90 0.56 0.84 Z' }, colorKey: 'accent', opacity: 0.6 },
  // 날개 힌트 (좌측)
  { type: 'path', attrs: { d: 'M 0.15 0.44 C 0.06 0.38 0.00 0.44 0.04 0.54 C 0.06 0.58 0.12 0.56 0.15 0.50 Z' }, colorKey: 'primary', opacity: 0.3 },
  // 날개 힌트 (우측)
  { type: 'path', attrs: { d: 'M 0.85 0.44 C 0.94 0.38 1.00 0.44 0.96 0.54 C 0.94 0.58 0.88 0.56 0.85 0.50 Z' }, colorKey: 'primary', opacity: 0.3 },
];

/**
 * SKIN_FEATURES - 스킨별 동물 특징 SVG 요소 맵
 * 키는 스킨 id (bear, cat, panda, rabbit, fox, unicorn, dolphin, butterfly, dragon, phoenix)
 */
export const SKIN_FEATURES: Record<string, SkinFeature[]> = {
  // Rare
  bear: BEAR_FEATURES,
  cat: CAT_FEATURES,
  panda: PANDA_FEATURES,
  rabbit: RABBIT_FEATURES,
  fox: FOX_FEATURES,
  // Epic
  unicorn: UNICORN_FEATURES,
  dolphin: DOLPHIN_FEATURES,
  butterfly: BUTTERFLY_FEATURES,
  // Legendary
  dragon: DRAGON_FEATURES,
  phoenix: PHOENIX_FEATURES,
};
