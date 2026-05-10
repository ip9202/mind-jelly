'use client';

import type { EmotionType } from '@/types/emotion';
import { EMOTION_THEME } from '@/lib/constants/emotion';

interface EmotionFaceProps {
  emotion: EmotionType;
  size?: number;
}

// @MX:NOTE: 감정별 눈 색상 (기본 #7a5761, 예외: love=#E8788A, hope=#F4C542)
const EYE_COLOR: Record<EmotionType, string> = {
  joy: '#7a5761',
  sadness: '#7a5761',
  anger: '#7a5761',
  fear: '#7a5761',
  disgust: '#7a5761',
  surprise: '#7a5761',
  love: '#E8788A',
  gratitude: '#7a5761',
  hope: '#F4C542',
};

const MOUTH_COLOR = '#7a5761';

/**
 * 감정 표정 렌더러
 * EMOTION_THEME[emotion].face 매핑에 따라 눈+입 SVG를 렌더링합니다.
 * 24px 이하 크기에서도 식별 가능하도록 stroke를 굵게 유지합니다.
 */
export function EmotionFace({ emotion, size = 24 }: EmotionFaceProps) {
  const theme = EMOTION_THEME[emotion];
  const eyeFill = EYE_COLOR[emotion];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      overflow="hidden"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {renderEyes(theme.face.eyes, eyeFill)}
      {renderMouth(theme.face.mouth, MOUTH_COLOR)}
    </svg>
  );
}

// ── 눈 렌더링 ──────────────────────────────────────────

function renderEyes(type: string, color: string) {
  switch (type) {
    // ^ ^ 아크 눈 (joy)
    case 'happy':
      return (
        <g>
          <path d="M10 14 Q13 8 16 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M24 14 Q27 8 30 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      );
    // U자형 눈 (sadness)
    case 'sad':
      return (
        <g>
          <path d="M10 10 Q13 16 16 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M24 10 Q27 16 30 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* 눈물 */}
          <ellipse cx="17" cy="15" rx="1.2" ry="2" fill="#7EB8D8" />
        </g>
      );
    // 비스듬한 눈썹 + 점 눈 (anger)
    case 'angry':
      return (
        <g>
          <line x1="9" y1="7" x2="16" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="31" y1="7" x2="24" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="13" cy="14" r="1.8" fill={color} />
          <circle cx="27" cy="14" r="1.8" fill={color} />
        </g>
      );
    // 큰 둥근 눈 + 작은 동공 + 하이라이트 (fear)
    case 'scared':
      return (
        <g>
          <circle cx="13" cy="13" r="4.5" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="13" cy="13" r="1.5" fill={color} />
          <circle cx="14.5" cy="11.5" r="1" fill="white" />
          <circle cx="27" cy="13" r="4.5" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="27" cy="13" r="1.5" fill={color} />
          <circle cx="28.5" cy="11.5" r="1" fill="white" />
        </g>
      );
    // 가로선 눈 (disgust)
    case 'squint':
      return (
        <g>
          <line x1="9" y1="13" x2="17" y2="13" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="23" y1="13" x2="31" y2="13" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    // 매우 큰 눈 + 확장 동공 (surprise)
    case 'wide':
      return (
        <g>
          <circle cx="13" cy="13" r="5" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="13" cy="13" r="2.5" fill={color} />
          <circle cx="27" cy="13" r="5" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="27" cy="13" r="2.5" fill={color} />
        </g>
      );
    // 하트 눈 (love)
    case 'heart':
      return (
        <g>
          {/* 왼쪽 하트 */}
          <path
            d="M13 9 C10 6 6 9 9 12 L13 16 L17 12 C20 9 16 6 13 9Z"
            fill={color}
          />
          {/* 오른쪽 하트 */}
          <path
            d="M27 9 C24 6 20 9 23 12 L27 16 L31 12 C34 9 30 6 27 9Z"
            fill={color}
          />
        </g>
      );
    // 초승달 눈 (gratitude)
    case 'crescent':
      return (
        <g>
          <path d="M9 14 Q13 8 17 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M23 14 Q27 8 31 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      );
    // 4포인트 스타 눈 (hope)
    case 'sparkle':
      return (
        <g>
          {/* 왼쪽 별 */}
          <path
            d="M13 8 L14.2 11.8 L18 13 L14.2 14.2 L13 18 L11.8 14.2 L8 13 L11.8 11.8Z"
            fill={color}
          />
          {/* 오른쪽 별 */}
          <path
            d="M27 8 L28.2 11.8 L32 13 L28.2 14.2 L27 18 L25.8 14.2 L22 13 L25.8 11.8Z"
            fill={color}
          />
        </g>
      );
    default:
      return null;
  }
}

// ── 입 렌더링 ──────────────────────────────────────────

function renderMouth(type: string, color: string) {
  switch (type) {
    // 위로 곡선 미소 (joy, love)
    case 'smile':
      return (
        <path
          d="M13 28 Q20 35 27 28"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      );
    // 물결 모양 아래 입 (sadness)
    case 'wave':
      return (
        <path
          d="M13 30 Q16 27 20 30 Q24 33 27 30"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      );
    // 지그재그 입 (anger)
    case 'wavy':
      return (
        <path
          d="M12 29 L16 27 L20 30 L24 27 L28 29"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    // O 모양 입 (fear)
    case 'o-mouth':
      return (
        <ellipse cx="20" cy="30" rx="4" ry="3.5" stroke={color} strokeWidth="2" fill="none" />
      );
    // 일자 입 (disgust)
    case 'flat':
      return (
        <line x1="14" y1="29" x2="26" y2="29" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      );
    // 작은 원형 입 (surprise)
    case 'o':
      return (
        <circle cx="20" cy="30" r="3" stroke={color} strokeWidth="2" fill="none" />
      );
    // 넓은 그린 (gratitude)
    case 'grin':
      return (
        <path
          d="M11 28 Q20 36 29 28"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      );
    // 넓은 빔 (hope)
    case 'beam':
      return (
        <g>
          <path
            d="M11 27 Q20 36 29 27"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* 입술 닫힌 선 */}
          <line x1="12" y1="28" x2="28" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}
