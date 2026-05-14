'use client';

import { hexToRgba, lightenHex, darkenHex } from '@/lib/utils/color';
import { JELLY_COLOR, EMOTION_THEME, JELLY_DEFAULT_SHAPE } from '@/lib/constants/emotion';
import { JELLY_SHAPE_CONFIGS } from '@/lib/constants/jellyShapes';
import { SKIN_FEATURES } from '@/lib/constants/skinFeatures';
import { SKIN_THEMES } from '@/lib/rewards/jellySkins';
import type { EmotionType } from '@/types/emotion';
import type { JellyShape } from '@/types/physics';
import type { CSSProperties } from 'react';

interface JellyRendererProps {
  bodies: Array<{ position: { x: number; y: number }; circleRadius?: number }>;
  face: 'idle' | 'anticipation' | 'eating' | 'satisfied' | 'happy';
  animation: number;
  // M2: 감정 기반 색상 (기본값: JELLY_COLOR)
  emotionColor?: string;
  // 감정 표정 (활성화 시 face prop 대신 감정 표정 렌더링)
  emotion?: EmotionType | null;
  // 사용자가 선택한 젤리 외형 모양 (기본값: 'circle')
  jellyShape?: JellyShape;
  // SPEC-TOUCH-001: CSS keyframe 바운스 트리거
  bounceKey?: number;
  // 활성 스킨 ID (동물 특징 SVG 렌더링용)
  skinId?: string;
}

// @MX:ANCHOR: 3D 글로시 풍선 젤리 렌더러 (홈/감정플로우/다이어리 3곳 이상에서 사용)
// @MX:REASON: SVG 네이티브 렌더링 + radialGradient + SMIL 애니메이션으로 풍선형 3D 입체감 구현
export function JellyRenderer({ bodies, face, emotionColor, emotion, jellyShape, bounceKey, skinId }: JellyRendererProps) {
  if (bodies.length === 0) return null;

  const jelly = bodies[0];
  const cx = jelly.position.x;
  const cy = jelly.position.y;
  const r = jelly.circleRadius || 40;

  // M2: 감정 색상 (기본값: JELLY_COLOR)
  const currentColor = emotionColor || JELLY_COLOR;
  const glowColor = hexToRgba(currentColor, 0.4);

  // @MX:NOTE: 감정별 EMOTION_THEME 참조 (face 렌더링용, shape는 SVG path가 대체)
  const _emotionShape = emotion && EMOTION_THEME[emotion]
    ? EMOTION_THEME[emotion].shape
    : JELLY_DEFAULT_SHAPE;
  void _emotionShape;

  // 사용자가 선택한 모양 (기본값: 'ppung')
  const selectedShape: JellyShape = jellyShape || 'ppung';
  let shapeConfig = JELLY_SHAPE_CONFIGS[selectedShape];

  // 안전장치: shapeConfig가 undefined인 경우 기본 모양 사용 (런타임 마이그레이션)
  if (!shapeConfig) {
    shapeConfig = JELLY_SHAPE_CONFIGS.ppung;
  }
  const jellyPath = shapeConfig.path;
  const { faceOffset } = shapeConfig;

  // SMIL 애니메이션 속성 (pathAlt가 있을 때만 활성화) - 더 빠르고 부드러운 울룩불룩 효과
  const smilAttrs = shapeConfig.pathAlt ? {
    dur: '2.5s',
    repeatCount: 'indefinite' as const,
    calcMode: 'spline' as const,
    keyTimes: '0;0.5;1',
    keySplines: '0.4 0 0.6 1;0.4 0 0.6 1',
    values: `${shapeConfig.path};${shapeConfig.pathAlt};${shapeConfig.path}`,
  } : null;

  const svgStyle: CSSProperties = {
    overflow: 'visible',
    animation: 'jelly-float 4s ease-in-out infinite',
    transition: 'all 800ms ease-in-out',
    position: 'absolute',
    top: 0,
    left: 0,
  };

  return (
    <div
      data-testid="jelly-renderer"
      key={bounceKey ? `bounce-${bounceKey}` : 'idle'}
      className={`absolute${bounceKey ? ' jelly-bounce-pop' : ''}`}
      style={{
        left: cx - r * 2.5,
        top: cy - r * 2.5,
        width: r * 5,
        height: r * 5,
      }}
    >
      <svg
        viewBox="0 0 1 1"
        width={r * 5}
        height={r * 5}
        style={svgStyle}
        aria-hidden
      >
        <defs>
          {/* 3D 깊이감을 위한 radialGradient: 좌상단 흰색 하이라이트 → 베이스 색 → 우하단 어두운 색 */}
          <radialGradient id="jelly-grad" cx="0.35" cy="0.28" r="0.72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.85" />
            <stop offset="22%" stopColor={lightenHex(currentColor, 45)} />
            <stop offset="62%" stopColor={currentColor} />
            <stop offset="100%" stopColor={darkenHex(currentColor, 25)} />
          </radialGradient>

          {/* 글로우 블러 필터 - 더 생생한 광채 */}
          <filter id="jelly-glow-filter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.055" result="blur" />
          </filter>

          {/* 드롭 섀도우 - 더 깊은 입체감 */}
          <filter id="jelly-shadow" x="-20%" y="-10%" width="140%" height="145%">
            <feDropShadow dx="0" dy="0.040" stdDeviation="0.045" floodColor={currentColor} floodOpacity="0.42" />
          </filter>

          {/* 하이라이트를 젤리 형태 안쪽으로 클리핑하기 위한 마스크 */}
          <mask id="jelly-mask">
            <path d={jellyPath} fill="white">
              {smilAttrs && <animate attributeName="d" {...smilAttrs} />}
            </path>
          </mask>
        </defs>

        {/* 외곽 글로우 */}
        <path
          data-testid="jelly-glow"
          d={jellyPath}
          fill={glowColor}
          filter="url(#jelly-glow-filter)"
          opacity="0.75"
          transform="translate(0.5 0.5) scale(1.22) translate(-0.5 -0.5)"
        >
          {smilAttrs && <animate attributeName="d" {...smilAttrs} />}
        </path>

        {/* 3D 그라디언트가 적용된 메인 젤리 바디 */}
        <path
          data-testid="jelly-body"
          d={jellyPath}
          fill="url(#jelly-grad)"
          filter="url(#jelly-shadow)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.016"
          opacity="0.93"
          style={{ transition: 'fill 800ms ease-in-out' }}
        >
          {smilAttrs && <animate attributeName="d" {...smilAttrs} />}
        </path>

        {/* 젤리 형태로 클리핑된 하이라이트 그룹 */}
        <g mask="url(#jelly-mask)">
          {/* 메인 하이라이트 블롭 - 크고 부드러운 광채 */}
          <ellipse cx="0.33" cy="0.26" rx="0.17" ry="0.10" fill="white" opacity="0.52" style={{ filter: 'blur(2px)' }} />
          {/* 스페큘러 하이라이트 - 선명한 반사광 */}
          <ellipse cx="0.26" cy="0.21" rx="0.055" ry="0.036" fill="white" opacity="0.88" transform="rotate(-22 0.26 0.21)" />
          {/* 작은 2차 스페큘러 */}
          <circle cx="0.35" cy="0.18" r="0.020" fill="white" opacity="0.70" />
        </g>

        {/* 스킨 동물 특징 - 바디 외곽에 배치 (마스크 외부) */}
        {skinId && SKIN_FEATURES[skinId] && (
          <g className="skin-features" aria-hidden="true">
            {SKIN_FEATURES[skinId].map((feature, i) => {
              const theme = SKIN_THEMES[skinId];
              const colorMap: Record<string, string> = {
                primary: theme?.primaryColor || currentColor,
                accent: theme?.accentColor || lightenHex(currentColor, 20),
                dark: darkenHex(currentColor, 30),
                white: '#ffffff',
              };
              const fillColor = colorMap[feature.colorKey] || currentColor;
              const strokeAttrs = feature.stroke
                ? { stroke: feature.stroke.color === 'primary' || feature.stroke.color === 'accent' || feature.stroke.color === 'dark' || feature.stroke.color === 'white' ? colorMap[feature.stroke.color] : feature.stroke.color, strokeWidth: feature.stroke.width }
                : {};

              if (feature.type === 'circle') {
                return (
                  <circle
                    key={`skin-${i}`}
                    cx={feature.attrs.cx as number}
                    cy={feature.attrs.cy as number}
                    r={feature.attrs.r as number}
                    fill={fillColor}
                    opacity={feature.opacity ?? 0.9}
                    {...strokeAttrs}
                  />
                );
              }
              if (feature.type === 'ellipse') {
                return (
                  <ellipse
                    key={`skin-${i}`}
                    cx={feature.attrs.cx as number}
                    cy={feature.attrs.cy as number}
                    rx={feature.attrs.rx as number}
                    ry={feature.attrs.ry as number}
                    fill={fillColor}
                    opacity={feature.opacity ?? 0.9}
                    transform={feature.attrs.transform as string | undefined}
                    {...strokeAttrs}
                  />
                );
              }
              // path
              return (
                <path
                  key={`skin-${i}`}
                  d={feature.attrs.d as string}
                  fill={fillColor}
                  opacity={feature.opacity ?? 0.9}
                  {...strokeAttrs}
                />
              );
            })}
          </g>
        )}

        {/* 표정 그룹 - 젤리 바디와 함께 움직이도록 mask 적용 */}
        <g mask="url(#jelly-mask)" className="jelly-face">
          {/* eating과 happy는 emotion보다 우선: 구슬 먹는 애니메이션과 터치 반응이 감정 표정을 덮어씀 */}
          {face === 'eating' ? (
            <>
              <path
                d={`M 0.34 ${faceOffset.eyeY} L 0.42 ${faceOffset.eyeY} M 0.58 ${faceOffset.eyeY} L 0.66 ${faceOffset.eyeY}`}
                stroke="#7a5761"
                strokeWidth="0.008"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse
                cx="0.50"
                cy={faceOffset.mouthY + 0.04}
                rx="0.12"
                ry="0.07"
                stroke="#7a5761"
                strokeWidth="0.008"
                fill="rgba(80, 45, 55, 0.50)"
              />
            </>
          ) : face === 'happy' ? (
            // SPEC-TOUCH-001 REQ-TOUCH-002: happy 표정 (^ ^ 눈 + 큰 U자 미소)
            <path
              d={`
                M 0.34 ${faceOffset.eyeY + 0.02} Q 0.38 ${faceOffset.eyeY - 0.04} 0.42 ${faceOffset.eyeY + 0.02}
                M 0.58 ${faceOffset.eyeY + 0.02} Q 0.62 ${faceOffset.eyeY - 0.04} 0.66 ${faceOffset.eyeY + 0.02}
                M 0.30 ${faceOffset.mouthY - 0.02} Q 0.50 ${faceOffset.mouthY + 0.18} 0.70 ${faceOffset.mouthY - 0.02}
              `}
              stroke="#7a5761"
              strokeWidth="0.008"
              fill="none"
              strokeLinecap="round"
            />
          ) : emotion && EMOTION_THEME[emotion] ? (
            // 감정 표정 (SVG 기반) - faceOffset 적용
            <>
              {renderEmotionEyes(emotion, faceOffset)}
              {renderEmotionMouth(emotion, faceOffset)}
            </>
          ) : (
            // 기본 상태 표정 (idle/anticipation/eating/satisfied) - 하나의 path로 통합
            <>
              {face === 'idle' && (
                <path
                  d={`
                    M 0.34 ${faceOffset.eyeY} L 0.42 ${faceOffset.eyeY}
                    M 0.58 ${faceOffset.eyeY} L 0.66 ${faceOffset.eyeY}
                    M 0.42 ${faceOffset.mouthY + 0.04} Q 0.5 ${faceOffset.mouthY - 0.04} 0.58 ${faceOffset.mouthY + 0.04}
                  `}
                  stroke="#7a5761"
                  strokeWidth="0.008"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {face === 'satisfied' && (
                <path
                  d={`
                    M 0.34 ${faceOffset.eyeY - 0.01} L 0.42 ${faceOffset.eyeY - 0.01}
                    M 0.58 ${faceOffset.eyeY - 0.01} L 0.66 ${faceOffset.eyeY - 0.01}
                    M 0.38 ${faceOffset.mouthY - 0.06} Q 0.50 ${faceOffset.mouthY + 0.06} 0.62 ${faceOffset.mouthY - 0.06}
                  `}
                  stroke="#7a5761"
                  strokeWidth="0.008"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {face === 'anticipation' && (
                <path
                  d={`
                    M 0.35 ${faceOffset.eyeY - 0.01} L 0.41 ${faceOffset.eyeY - 0.01}
                    M 0.59 ${faceOffset.eyeY - 0.01} L 0.65 ${faceOffset.eyeY - 0.01}
                    M 0.44 ${faceOffset.mouthY - 0.02} L 0.56 ${faceOffset.mouthY - 0.02}
                  `}
                  stroke="#7a5761"
                  strokeWidth="0.008"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              )}
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

// @MX:NOTE: 감정별 SVG 눈 렌더링 (viewBox 0 0 1 1 기반)
// @MX:REASON: 좌측 눈 중심 x=0.38, 우측 눈 중심 x=0.62 → SVG 중심 0.50 대칭, idle 표정과 동일 간격
function renderEmotionEyes(emotion: EmotionType, faceOffset: { eyeY: number; mouthY: number }) {
  const theme = EMOTION_THEME[emotion];
  const eyeColor = '#7a5761';

  const eyeY = faceOffset.eyeY;

  switch (theme.face.eyes) {
    case 'happy': // joy: ^ ^ 행복한 곡선 눈
      return (
        <g className="emotion-eyes">
          <path d={`M 0.34 ${eyeY + 0.02} Q 0.38 ${eyeY - 0.04} 0.42 ${eyeY + 0.02}`} stroke={eyeColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
          <path d={`M 0.58 ${eyeY + 0.02} Q 0.62 ${eyeY - 0.04} 0.66 ${eyeY + 0.02}`} stroke={eyeColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'sad': // sadness: U자형 처진 눈 + 눈물
      return (
        <g className="emotion-eyes">
          <path d={`M 0.34 ${eyeY - 0.04} Q 0.38 ${eyeY + 0.10} 0.42 ${eyeY - 0.04}`} stroke={eyeColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
          <path d={`M 0.58 ${eyeY - 0.04} Q 0.62 ${eyeY + 0.10} 0.66 ${eyeY - 0.04}`} stroke={eyeColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
          <ellipse cx="0.42" cy={eyeY + 0.10} rx="0.006" ry="0.01" fill="#AEC6CF" opacity="0.7" />
          <ellipse cx="0.66" cy={eyeY + 0.08} rx="0.006" ry="0.01" fill="#AEC6CF" opacity="0.5" />
        </g>
      );
    case 'angry': // anger: 각진 눈썹 + 날카로운 눈
      return (
        <g className="emotion-eyes">
          <line x1="0.30" y1={eyeY - 0.06} x2="0.44" y2={eyeY - 0.01} stroke={eyeColor} strokeWidth="0.01" strokeLinecap="round" />
          <line x1="0.70" y1={eyeY - 0.06} x2="0.56" y2={eyeY - 0.01} stroke={eyeColor} strokeWidth="0.01" strokeLinecap="round" />
          <circle cx="0.38" cy={eyeY + 0.02} r="0.008" fill={eyeColor} />
          <circle cx="0.62" cy={eyeY + 0.02} r="0.008" fill={eyeColor} />
        </g>
      );
    case 'scared': // fear: 큰 둥근 눈 + 작은 동공
      return (
        <g className="emotion-eyes">
          <circle cx="0.38" cy={eyeY} r="0.02" stroke={eyeColor} strokeWidth="0.006" fill="white" opacity="0.8" />
          <circle cx="0.38" cy={eyeY} r="0.009" fill={eyeColor} />
          <circle cx="0.39" cy={eyeY - 0.02} r="0.004" fill="white" />
          <circle cx="0.62" cy={eyeY} r="0.02" stroke={eyeColor} strokeWidth="0.006" fill="white" opacity="0.8" />
          <circle cx="0.62" cy={eyeY} r="0.009" fill={eyeColor} />
          <circle cx="0.63" cy={eyeY - 0.02} r="0.004" fill="white" />
        </g>
      );
    case 'squint': // disgust: 가늘어진 눈
      return (
        <g className="emotion-eyes">
          <line x1="0.34" y1={eyeY} x2="0.42" y2={eyeY} stroke={eyeColor} strokeWidth="0.008" strokeLinecap="round" />
          <line x1="0.58" y1={eyeY} x2="0.66" y2={eyeY} stroke={eyeColor} strokeWidth="0.008" strokeLinecap="round" />
        </g>
      );
    case 'wide': // surprise: 커다란 둥근 눈
      return (
        <g className="emotion-eyes">
          <circle cx="0.38" cy={eyeY} r="0.024" stroke={eyeColor} strokeWidth="0.004" fill="white" opacity="0.9" />
          <circle cx="0.38" cy={eyeY} r="0.014" fill={eyeColor} />
          <circle cx="0.40" cy={eyeY - 0.02} r="0.005" fill="white" />
          <circle cx="0.62" cy={eyeY} r="0.024" stroke={eyeColor} strokeWidth="0.004" fill="white" opacity="0.9" />
          <circle cx="0.62" cy={eyeY} r="0.014" fill={eyeColor} />
          <circle cx="0.64" cy={eyeY - 0.02} r="0.005" fill="white" />
        </g>
      );
    case 'heart': // love: 하트 모양 눈
      return (
        <g className="emotion-eyes">
          <path d={`M 0.38 ${eyeY - 0.02} C 0.38 ${eyeY - 0.04}, 0.34 ${eyeY - 0.05}, 0.34 ${eyeY - 0.02} C 0.34 ${eyeY}, 0.38 ${eyeY + 0.04}, 0.38 ${eyeY + 0.04} C 0.38 ${eyeY + 0.04}, 0.42 ${eyeY}, 0.42 ${eyeY - 0.02} C 0.42 ${eyeY - 0.05}, 0.38 ${eyeY - 0.04}, 0.38 ${eyeY - 0.02} Z`} fill="#E8788A" />
          <path d={`M 0.62 ${eyeY - 0.02} C 0.62 ${eyeY - 0.04}, 0.58 ${eyeY - 0.05}, 0.58 ${eyeY - 0.02} C 0.58 ${eyeY}, 0.62 ${eyeY + 0.04}, 0.62 ${eyeY + 0.04} C 0.62 ${eyeY + 0.04}, 0.66 ${eyeY}, 0.66 ${eyeY - 0.02} C 0.66 ${eyeY - 0.05}, 0.62 ${eyeY - 0.04}, 0.62 ${eyeY - 0.02} Z`} fill="#E8788A" />
        </g>
      );
    case 'crescent': // gratitude: 아래로 향한 우아한 초승달 눈
      return (
        <g className="emotion-eyes">
          <path d={`M 0.34 ${eyeY - 0.04} Q 0.38 ${eyeY + 0.08} 0.42 ${eyeY - 0.04}`} stroke={eyeColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
          <path d={`M 0.58 ${eyeY - 0.04} Q 0.62 ${eyeY + 0.08} 0.66 ${eyeY - 0.04}`} stroke={eyeColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'sparkle': // hope: 반짝이는 별 모양 눈
      return (
        <g className="emotion-eyes">
          <path d={`M 0.38 ${eyeY - 0.04} L 0.385 ${eyeY} L 0.42 ${eyeY} L 0.385 ${eyeY + 0.01} L 0.38 ${eyeY + 0.06} L 0.375 ${eyeY + 0.01} L 0.34 ${eyeY} L 0.375 ${eyeY} Z`} fill="#F4C542" />
          <path d={`M 0.62 ${eyeY - 0.04} L 0.625 ${eyeY} L 0.66 ${eyeY} L 0.625 ${eyeY + 0.01} L 0.62 ${eyeY + 0.06} L 0.615 ${eyeY + 0.01} L 0.58 ${eyeY} L 0.615 ${eyeY} Z`} fill="#F4C542" />
        </g>
      );
    default:
      return null;
  }
}

// @MX:NOTE: 감정별 SVG 입 렌더링 (viewBox 0 0 1 1 기반)
// @MX:REASON: SVG 내부에서 렌더링되어 젤리 바디와 완전 동기화
function renderEmotionMouth(emotion: EmotionType, faceOffset: { eyeY: number; mouthY: number }) {
  const theme = EMOTION_THEME[emotion];
  const mouthColor = '#7a5761';
  const mouthY = faceOffset.mouthY;

  switch (theme.face.mouth) {
    case 'smile': // joy: 넓은 미소
      return (
        <path d={`M 0.32 ${mouthY} Q 0.5 ${mouthY + 0.16} 0.68 ${mouthY}`} stroke={mouthColor} strokeWidth="0.008" fill="none" strokeLinecap="round" className="emotion-mouth" />
      );
    case 'wave': // sadness: 물결형 처진 입
      return (
        <path d={`M 0.34 ${mouthY} Q 0.42 ${mouthY + 0.08} 0.50 ${mouthY} Q 0.58 ${mouthY - 0.08} 0.66 ${mouthY}`} stroke={mouthColor} strokeWidth="0.006" fill="none" strokeLinecap="round" className="emotion-mouth" />
      );
    case 'wavy': // anger: 물결형 팽팽한 입
      return (
        <path d={`M 0.34 ${mouthY} Q 0.42 ${mouthY - 0.06} 0.50 ${mouthY} Q 0.58 ${mouthY + 0.06} 0.66 ${mouthY}`} stroke={mouthColor} strokeWidth="0.008" fill="none" strokeLinecap="round" className="emotion-mouth" />
      );
    case 'o-mouth': // fear: O자형 입
      return (
        <ellipse cx="0.5" cy={mouthY} rx="0.02" ry="0.024" stroke={mouthColor} strokeWidth="0.006" fill="none" className="emotion-mouth" />
      );
    case 'flat': // disgust: 일자형 입
      return (
        <line x1="0.38" y1={mouthY} x2="0.62" y2={mouthY} stroke={mouthColor} strokeWidth="0.008" strokeLinecap="round" className="emotion-mouth" />
      );
    case 'o': // surprise: 작고 둥근 O자형 입
      return (
        <circle cx="0.5" cy={mouthY} r="0.02" stroke={mouthColor} strokeWidth="0.006" fill="none" className="emotion-mouth" />
      );
    case 'grin': // gratitude: 넓은 미소 + 이 힌트
      return (
        <g className="emotion-mouth">
          <path d={`M 0.34 ${mouthY} Q 0.5 ${mouthY + 0.06} 0.66 ${mouthY} L 0.66 ${mouthY + 0.02} Q 0.5 ${mouthY + 0.06} 0.34 ${mouthY + 0.02} Z`} fill={mouthColor} opacity="0.2" />
          <path d={`M 0.34 ${mouthY} Q 0.5 ${mouthY + 0.16} 0.66 ${mouthY}`} stroke={mouthColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'beam': // hope: 아주 넓은 환한 미소 + 보조개
      return (
        <g className="emotion-mouth">
          <path d={`M 0.30 ${mouthY} Q 0.5 ${mouthY + 0.16} 0.70 ${mouthY}`} stroke={mouthColor} strokeWidth="0.008" fill="none" strokeLinecap="round" />
          <path d={`M 0.28 ${mouthY + 0.02} Q 0.30 ${mouthY + 0.06} 0.32 ${mouthY + 0.02}`} stroke={mouthColor} strokeWidth="0.005" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d={`M 0.68 ${mouthY + 0.02} Q 0.70 ${mouthY + 0.06} 0.72 ${mouthY + 0.02}`} stroke={mouthColor} strokeWidth="0.005" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    default:
      return null;
  }
}
