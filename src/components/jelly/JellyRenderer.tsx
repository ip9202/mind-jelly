'use client';

import { hexToRgba } from '@/lib/utils/color';
import { JELLY_COLOR, EMOTION_THEME, JELLY_DEFAULT_SHAPE } from '@/lib/constants/emotion';
import type { EmotionType } from '@/types/emotion';

interface JellyRendererProps {
  bodies: Array<{ position: { x: number; y: number }; circleRadius?: number }>;
  face: 'idle' | 'anticipation' | 'eating' | 'satisfied';
  animation: number;
  // M2: 감정 기반 색상 (기본값: JELLY_COLOR)
  emotionColor?: string;
  // 감정 표정 (활성화 시 face prop 대신 감정 표정 렌더링)
  emotion?: EmotionType | null;
}

export function JellyRenderer({ bodies, face, emotionColor, emotion }: JellyRendererProps) {
  if (bodies.length === 0) return null;

  const jelly = bodies[0];
  const cx = jelly.position.x;
  const cy = jelly.position.y;
  const r = jelly.circleRadius || 40;

  // M2: 감정 색상 (기본값: JELLY_COLOR)
  const currentColor = emotionColor || JELLY_COLOR;
  const glowColor = hexToRgba(currentColor, 0.4);

  // @MX:NOTE: 감정별 블롭 형태 (CSS 변수로 wobble 애니메이션 지원)
  const currentShape = emotion && EMOTION_THEME[emotion]
    ? EMOTION_THEME[emotion].shape
    : JELLY_DEFAULT_SHAPE;

  const borderRadius = currentShape.borderRadius;
  const borderRadiusAlt = currentShape.borderRadiusAlt || borderRadius;

  // @MX:NOTE: 800ms 트랜지션 (GPU 컴포지팅, 60fps 유지)
  const transitionStyle = 'background-color 800ms ease-in-out, border-radius 800ms ease-in-out, box-shadow 800ms ease-in-out';

  return (
    <div
      data-testid="jelly-renderer"
      className="absolute pointer-events-none"
      style={{
        left: cx - r * 2.5,
        top: cy - r * 2.5,
        width: r * 5,
        height: r * 5,
      }}
    >
      {/* 글로우 효과 - 감정별 색상 외곽광 */}
      <div
        data-testid="jelly-glow"
        className="absolute inset-0 scale-125 blur-3xl"
        style={{
          borderRadius,
          backgroundColor: glowColor,
          transition: 'background-color 800ms ease-in-out, border-radius 800ms ease-in-out',
        }}
      />

      {/* 젤리 바디 - 유기적 블롭 형태 */}
      <div
        data-testid="jelly-body"
        className="relative w-full h-full flex items-center justify-center"
        style={{
          // @MX:NOTE: CSS 변수로 wobble 애니메이션 구동
          '--jelly-br1': borderRadius,
          '--jelly-br2': borderRadiusAlt,
          borderRadius,
          backgroundColor: currentColor,
          opacity: 0.88,
          // 글래스모피즘 효과
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          // 3D 젤리 질감: 내부 그림자 + 외곽광
          boxShadow: [
            'inset -8px -8px 20px rgba(0,0,0,0.06)',
            'inset 8px 8px 24px rgba(255,255,255,0.5)',
            `0 0 30px ${hexToRgba(currentColor, 0.3)}`,
          ].join(', '),
          border: '3px solid rgba(255, 255, 255, 0.35)',
          transition: transitionStyle,
          // 부유 + 진동 복합 애니메이션
          animation: 'jelly-float 4s ease-in-out infinite, jelly-wobble 6s ease-in-out infinite',
        } as React.CSSProperties}
      >
        {/* 표정 레이어 */}
        <div
          className="flex flex-col items-center"
          style={{ marginTop: r * 0.05, gap: r * 0.06 }}
        >
          {emotion && EMOTION_THEME[emotion] ? (
            // 감정 표정 (SVG 기반)
            <>
              {renderEmotionEyes(emotion, r)}
              {renderEmotionMouth(emotion, r)}
            </>
          ) : (
            // 기본 상태 표정 (idle/anticipation/eating/satisfied)
            <>
              {/* 기본 눈: 큰 도트 */}
              <svg width={r * 1.4} height={r * 0.56} viewBox="0 0 50 18">
                <circle cx="14" cy="9" r="5.5" fill="#7a5761" />
                <circle cx="36" cy="9" r="5.5" fill="#7a5761" />
              </svg>
              {/* 상태별 입 */}
              {face === 'idle' && (
                <svg width={r * 0.6} height={r * 0.6} viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="6" stroke="#7a5761" strokeWidth="2" fill="none" opacity="0.7" />
                </svg>
              )}
              {face === 'eating' && (
                <svg width={r * 1.1} height={r * 0.8} viewBox="0 0 40 30">
                  <ellipse cx="20" cy="18" rx="12" ry="8" fill="#FF6B6B" opacity="0.8" />
                </svg>
              )}
              {face === 'satisfied' && (
                <svg width={r * 1.1} height={r * 0.6} viewBox="0 0 40 20">
                  <path d="M 4 4 Q 20 18 36 4" stroke="#7a5761" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              )}
              {face === 'anticipation' && (
                <svg width={r * 0.7} height={r * 0.44} viewBox="0 0 25 15">
                  <ellipse cx="12.5" cy="8" rx="8" ry="5" fill="#7a5761" opacity="0.6" />
                </svg>
              )}
            </>
          )}
        </div>

        {/* 내부 하이라이트 - 3D 젤리 광택 */}
        <div
          className="absolute rounded-full blur-md"
          style={{
            top: r * 0.25,
            left: r * 0.45,
            width: r * 0.7,
            height: r * 0.35,
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            transform: 'rotate(-25deg)',
            pointerEvents: 'none',
          }}
        />

        {/* 작은 하이라이트 도트 - 젤리 반사광 */}
        <div
          className="absolute rounded-full"
          style={{
            top: r * 0.2,
            left: r * 0.35,
            width: r * 0.12,
            height: r * 0.1,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            transform: 'rotate(-15deg)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

// @MX:NOTE: 감정별 SVG 눈 렌더링
// @MX:REASON: 5개 감정 타입별 고유 SVG 눈 모양 렌더링
function renderEmotionEyes(emotion: EmotionType, r: number) {
  const theme = EMOTION_THEME[emotion];
  const eyeColor = '#7a5761';
  const w = r * 1.6;
  const h = r * 0.7;

  switch (theme.face.eyes) {
    case 'happy': // joy: ^ ^ 행복한 곡선 눈
      return (
        <svg width={w} height={h} viewBox="0 0 50 22">
          <path d="M 6 16 Q 14 4 22 16" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 28 16 Q 36 4 44 16" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'sad': // sadness: U자형 처진 눈 + 눈물
      return (
        <svg width={w} height={h * 1.3} viewBox="0 0 50 28">
          {/* U자 눈 */}
          <path d="M 6 6 Q 14 22 22 6" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 28 6 Q 36 22 44 6" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* 눈물 방울 */}
          <ellipse cx="22" cy="24" rx="1.5" ry="2.5" fill="#AEC6CF" opacity="0.7" />
          <ellipse cx="36" cy="22" rx="1.5" ry="2.5" fill="#AEC6CF" opacity="0.5" />
        </svg>
      );
    case 'angry': // anger: 각진 눈썹 + 날카로운 눈
      return (
        <svg width={w} height={h * 1.2} viewBox="0 0 50 26">
          {/* 눈썹 */}
          <line x1="3" y1="4" x2="20" y2="10" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="47" y1="4" x2="30" y2="10" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          {/* 눈 */}
          <circle cx="12" cy="16" r="3" fill={eyeColor} />
          <circle cx="38" cy="16" r="3" fill={eyeColor} />
        </svg>
      );
    case 'scared': // fear: 큰 둥근 눈 + 작은 동공
      return (
        <svg width={w} height={h * 1.1} viewBox="0 0 50 24">
          {/* 큰 눈 흰자 */}
          <circle cx="14" cy="12" r="8" stroke={eyeColor} strokeWidth="2" fill="white" opacity="0.8" />
          <circle cx="36" cy="12" r="8" stroke={eyeColor} strokeWidth="2" fill="white" opacity="0.8" />
          {/* 작은 동공 */}
          <circle cx="14" cy="13" r="3.5" fill={eyeColor} />
          <circle cx="36" cy="13" r="3.5" fill={eyeColor} />
          {/* 반사광 */}
          <circle cx="16" cy="10" r="1.5" fill="white" />
          <circle cx="38" cy="10" r="1.5" fill="white" />
        </svg>
      );
    case 'squint': // disgust: 가늘어진 눈
      return (
        <svg width={w} height={h * 0.7} viewBox="0 0 50 15">
          <line x1="4" y1="8" x2="20" y2="8" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="30" y1="8" x2="46" y2="8" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          {/* 미세한 곡선으로 찡그림 표현 */}
          <path d="M 4 8 Q 12 4 20 8" stroke={eyeColor} strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M 30 8 Q 38 4 46 8" stroke={eyeColor} strokeWidth="1.5" fill="none" opacity="0.5" />
        </svg>
      );
    case 'wide': // surprise: 커다란 둥근 눈 + 확장된 동공 + 반사광
      return (
        <svg width={w} height={h} viewBox="0 0 50 26">
          {/* 커다란 흰자 */}
          <circle cx="14" cy="13" r="9.5" stroke={eyeColor} strokeWidth="1.5" fill="white" opacity="0.9" />
          <circle cx="36" cy="13" r="9.5" stroke={eyeColor} strokeWidth="1.5" fill="white" opacity="0.9" />
          {/* 확장된 동공 */}
          <circle cx="14" cy="14" r="5.5" fill={eyeColor} />
          <circle cx="36" cy="14" r="5.5" fill={eyeColor} />
          {/* 반사광 하이라이트 */}
          <circle cx="17" cy="11" r="2" fill="white" />
          <circle cx="39" cy="11" r="2" fill="white" />
        </svg>
      );
    case 'heart': // love: 하트 모양 눈
      return (
        <svg width={w} height={h} viewBox="0 0 50 24">
          {/* 왼쪽 하트 */}
          <path
            d="M 14 8 C 14 4, 8 2, 8 7 C 8 11, 14 16, 14 16 C 14 16, 20 11, 20 7 C 20 2, 14 4, 14 8 Z"
            fill="#E8788A"
          />
          {/* 오른쪽 하트 */}
          <path
            d="M 36 8 C 36 4, 30 2, 30 7 C 30 11, 36 16, 36 16 C 36 16, 42 11, 42 7 C 42 2, 36 4, 36 8 Z"
            fill="#E8788A"
          />
        </svg>
      );
    case 'crescent': // gratitude: 아래로 향한 우아한 초승달 눈
      return (
        <svg width={w} height={h} viewBox="0 0 50 20">
          {/* 우아한 아래 곡선 눈 */}
          <path d="M 6 6 Q 14 18 22 6" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 28 6 Q 36 18 44 6" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'sparkle': // hope: 반짝이는 별 모양 눈
      return (
        <svg width={w} height={h} viewBox="0 0 50 24">
          {/* 왼쪽 반짝이 */}
          <path
            d="M 14 2 L 15.5 9 L 22 10 L 15.5 11 L 14 18 L 12.5 11 L 6 10 L 12.5 9 Z"
            fill="#F4C542"
          />
          {/* 오른쪽 반짝이 */}
          <path
            d="M 36 2 L 37.5 9 L 44 10 L 37.5 11 L 36 18 L 34.5 11 L 28 10 L 34.5 9 Z"
            fill="#F4C542"
          />
        </svg>
      );
    default:
      return null;
  }
}

// @MX:NOTE: 감정별 SVG 입 렌더링
// @MX:REASON: 5개 감정 타입별 고유 SVG 입 모양 렌더링
function renderEmotionMouth(emotion: EmotionType, r: number) {
  const theme = EMOTION_THEME[emotion];
  const mouthColor = '#7a5761';
  const w = r * 1.3;
  const h = r * 0.6;

  switch (theme.face.mouth) {
    case 'smile': // joy: 넓은 미소
      return (
        <svg width={w * 1.2} height={h * 1.1} viewBox="0 0 48 22">
          <path d="M 4 6 Q 24 22 44 6" stroke={mouthColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'wave': // sadness: 물결형 처진 입
      return (
        <svg width={w} height={h} viewBox="0 0 40 20">
          <path d="M 4 8 Q 12 16 20 8 Q 28 0 36 8" stroke={mouthColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'wavy': // anger: 물결형 팽팽한 입
      return (
        <svg width={w} height={h * 0.8} viewBox="0 0 40 16">
          <path d="M 4 8 Q 12 2 20 8 Q 28 14 36 8" stroke={mouthColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'o-mouth': // fear: O자형 입
      return (
        <svg width={r * 0.35} height={r * 0.35} viewBox="0 0 22 22">
          <ellipse cx="11" cy="12" rx="6" ry="7" stroke={mouthColor} strokeWidth="2" fill="none" />
        </svg>
      );
    case 'flat': // disgust: 일자형 입
      return (
        <svg width={w * 0.8} height={h * 0.4} viewBox="0 0 32 10">
          <line x1="6" y1="5" x2="26" y2="5" stroke={mouthColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'o': // surprise: 작고 둥근 O자형 입
      return (
        <svg width={r * 0.4} height={r * 0.4} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="5.5" stroke={mouthColor} strokeWidth="2" fill="none" />
        </svg>
      );
    case 'grin': // gratitude: 넓은 미소 + 이 힌트
      return (
        <svg width={w * 1.3} height={h * 1.1} viewBox="0 0 48 24">
          {/* 이 힌트 (반투명) */}
          <path d="M 6 8 Q 24 12 42 8 L 42 10 Q 24 14 6 10 Z" fill={mouthColor} opacity="0.2" />
          {/* 넓은 미소 곡선 */}
          <path d="M 6 8 Q 24 24 42 8" stroke={mouthColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'beam': // hope: 아주 넓은 환한 미소 + 보조개
      return (
        <svg width={w * 1.4} height={h * 1.0} viewBox="0 0 52 22">
          {/* 넓은 미소 곡선 */}
          <path d="M 4 8 Q 26 24 48 8" stroke={mouthColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* 왼쪽 보조개 */}
          <path d="M 2 10 Q 4 14 6 10" stroke={mouthColor} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          {/* 오른쪽 보조개 */}
          <path d="M 46 10 Q 48 14 50 10" stroke={mouthColor} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
}
