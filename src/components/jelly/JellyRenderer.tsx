'use client';

import { hexToRgba } from '@/lib/utils/color';
import { JELLY_COLOR, EMOTION_THEME } from '@/lib/constants/emotion';
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

  // @MX:NOTE: M2 800ms 트랜지션 (GPU 컴포지팅, 60fps 유지)
  const colorTransition = 'background-color 800ms ease-in-out';

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
      {/* 글로우 효과 */}
      <div
        data-testid="jelly-glow"
        className="absolute inset-0 rounded-full scale-125 blur-3xl"
        style={{
          backgroundColor: glowColor,
          transition: colorTransition,
        }}
      />
      {/* 젤리 바디 */}
      <div
        data-testid="jelly-body"
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          backgroundColor: currentColor,
          boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.05), inset 8px 8px 20px rgba(255,255,255,0.6)',
          border: '4px solid rgba(255, 255, 255, 0.4)',
          transition: colorTransition,
        }}
      >
        {/* 표정 */}
        <div className="flex flex-col items-center gap-2" style={{ marginTop: r * 0.15 }}>
          {/* 감정 표정 (emotion이 설정된 경우) */}
          {emotion && EMOTION_THEME[emotion] ? (
            <>
              {/* 눈: 감정별 눈 모양 */}
              <div className="flex gap-8">
                {renderEmotionEyes(emotion, r)}
              </div>
              {/* 입: 감정별 입 모양 */}
              {renderEmotionMouth(emotion, r)}
            </>
          ) : (
            <>
              {/* 기본 상태 표정 (idle/anticipation/eating/satisfied) */}
              <div className="flex gap-8">
                <div className="rounded-full" style={{ width: r * 0.12, height: r * 0.12, backgroundColor: '#7a5761' }} />
                <div className="rounded-full" style={{ width: r * 0.12, height: r * 0.12, backgroundColor: '#7a5761' }} />
              </div>
              {face === 'idle' && (
                <div
                  className="rounded-full border-2"
                  style={{ width: r * 0.2, height: r * 0.2, borderColor: 'rgba(122, 87, 97, 0.6)', backgroundColor: 'transparent' }}
                />
              )}
              {face === 'eating' && (
                <div
                  className="rounded-full"
                  style={{ width: r * 0.4, height: r * 0.3, backgroundColor: '#FF6B6B' }}
                />
              )}
              {face === 'satisfied' && (
                <svg width={r * 0.4} height={r * 0.2} viewBox="0 0 40 20">
                  <path d="M 4 4 Q 20 18 36 4" stroke="#7a5761" strokeWidth="3" fill="none" />
                </svg>
              )}
              {face === 'anticipation' && (
                <div
                  className="rounded-full"
                  style={{ width: r * 0.25, height: r * 0.15, backgroundColor: '#7a5761' }}
                />
              )}
            </>
          )}
        </div>
        {/* 내부 하이라이트 */}
        <div
          className="absolute rounded-full blur-md"
          style={{
            top: r * 0.3,
            left: r * 0.5,
            width: r * 0.6,
            height: r * 0.3,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            transform: 'rotate(-30deg)',
          }}
        />
      </div>
    </div>
  );
}

// @MX:NOTE: 감정별 눈 렌더링 (SVG/도트)
// @MX:REASON: 5개 감정 타입별 고유 눈 모양 렌더링
function renderEmotionEyes(emotion: EmotionType, r: number) {
  const eyeSize = r * 0.14;
  const theme = EMOTION_THEME[emotion];
  const eyeColor = '#7a5761';

  switch (theme.face.eyes) {
    case 'u u': // sadness: U자형 눈
      return (
        <>
          <svg width={eyeSize * 2} height={eyeSize * 2} viewBox="0 0 20 20">
            <path d="M 4 4 Q 10 16 16 4" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <svg width={eyeSize * 2} height={eyeSize * 2} viewBox="0 0 20 20">
            <path d="M 4 4 Q 10 16 16 4" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </>
      );
    case '/ \\': // anger: 찡그린 눈
      return (
        <>
          <svg width={eyeSize * 2.5} height={eyeSize * 1.5} viewBox="0 0 24 16">
            <line x1="2" y1="12" x2="22" y2="4" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <svg width={eyeSize * 2.5} height={eyeSize * 1.5} viewBox="0 0 24 16">
            <line x1="2" y1="4" x2="22" y2="12" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </>
      );
    case 'o o': // fear: 둥근 큰 눈
      return (
        <>
          <div className="rounded-full border-2" style={{ width: eyeSize * 1.5, height: eyeSize * 1.5, borderColor: eyeColor, backgroundColor: 'transparent' }} />
          <div className="rounded-full border-2" style={{ width: eyeSize * 1.5, height: eyeSize * 1.5, borderColor: eyeColor, backgroundColor: 'transparent' }} />
        </>
      );
    case '•  •': // disgust: 약간 벌어진 눈
      return (
        <>
          <div className="rounded-full" style={{ width: eyeSize * 0.9, height: eyeSize * 0.9, backgroundColor: eyeColor }} />
          <div className="rounded-full" style={{ width: eyeSize * 0.9, height: eyeSize * 0.9, backgroundColor: eyeColor }} />
        </>
      );
    default: // joy: "• •" 일반 도트
      return (
        <>
          <div className="rounded-full" style={{ width: eyeSize, height: eyeSize, backgroundColor: eyeColor }} />
          <div className="rounded-full" style={{ width: eyeSize, height: eyeSize, backgroundColor: eyeColor }} />
        </>
      );
  }
}

// @MX:NOTE: 감정별 입 렌더링 (SVG)
// @MX:REASON: 5개 감정 타입별 고유 입 모양 렌더링
function renderEmotionMouth(emotion: EmotionType, r: number) {
  const theme = EMOTION_THEME[emotion];
  const mouthColor = '#7a5761';
  const w = r * 0.4;
  const h = r * 0.2;

  switch (theme.face.mouth) {
    case 'smile': // joy
      return (
        <svg width={w} height={h} viewBox="0 0 40 20">
          <path d="M 4 4 Q 20 18 36 4" stroke={mouthColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'wave': // sadness: 물결형 입
      return (
        <svg width={w} height={h} viewBox="0 0 40 20">
          <path d="M 4 10 Q 12 2 20 10 Q 28 18 36 10" stroke={mouthColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'wavy': // anger: 물결형 (불만)
      return (
        <svg width={w} height={h} viewBox="0 0 40 20">
          <path d="M 4 12 Q 12 4 20 12 Q 28 20 36 12" stroke={mouthColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'o-mouth': // fear: O자형 입
      return (
        <div
          className="rounded-full border-2"
          style={{ width: r * 0.2, height: r * 0.2, borderColor: mouthColor, backgroundColor: 'transparent' }}
        />
      );
    case 'flat': // disgust: 일자형 입
      return (
        <svg width={w} height={h * 0.5} viewBox="0 0 40 10">
          <line x1="8" y1="5" x2="32" y2="5" stroke={mouthColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
