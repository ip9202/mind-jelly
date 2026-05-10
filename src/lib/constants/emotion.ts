/**
 * 감정/구슬 상수 정의
 * REQ-EVT-005
 * @MX:NOTE: 감정별 색상 매핑 (P0 단계는 하드코딩)
 * @MX:SPEC: REQ-EVT-005
 */

import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 기본 감정 색상 매핑
// @MX:SPEC: REQ-EVT-005
export const EMOTION_COLORS = {
  joy: '#FFB7C5', // 평온: 벚꽃핑크
  sadness: '#7EB8D8', // 우울: 하늘파랑
  anger: '#F28B82', // 분노: 산호빨강
  fear: '#B39DDB', // 불안: 보라라벤더
  disgust: '#81C784', // 혐오: 청록그린
  surprise: '#FFD93D', // 놀람: 앰버옐로우
  love: '#FF6B8A', // 사랑: 따뜻한핑크
  gratitude: '#FFB347', // 감사: 오렌지골드
  hope: '#5BC0EB', // 희망: 하늘시안
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

// @MX:ANCHOR: 감정 테마 매핑 (UI 전체에서 사용)
// @MX:REASON: 홈 화면 배경, 젤리 표정, 메시지 카드 등 3개 이상 모듈에서 참조
// @MX:SPEC: Stitch 디자인 스펙 기반 감정별 UI 테마

// @MX:NOTE: 감정별 블롭 형태 (CSS 8값 border-radius로 유기적 형태 표현)
export const JELLY_DEFAULT_SHAPE: { borderRadius: string; borderRadiusAlt: string } = {
  borderRadius: '63% 37% 55% 45% / 38% 58% 42% 62%',
  borderRadiusAlt: '45% 55% 60% 40% / 55% 42% 58% 45%',
};

export const EMOTION_THEME: Record<EmotionType, {
  jellyColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  label: string;
  message: string;
  shape: { borderRadius: string; borderRadiusAlt?: string };
  face: { eyes: string; mouth: string };
}> = {
  joy: {
    jellyColor: '#FFB7C5',
    bgGradientStart: '#FFF0F3',
    bgGradientEnd: '#FFB7C5',
    label: '평온',
    message: '마음이 평온한 상태예요',
    // 둥근형: 부드럽고 풍만한 형태
    shape: {
      borderRadius: '65% 35% 58% 42% / 40% 60% 35% 65%',
      borderRadiusAlt: '42% 58% 50% 50% / 55% 38% 62% 45%',
    },
    face: { eyes: 'happy', mouth: 'smile' },
  },
  sadness: {
    jellyColor: '#7EB8D8',
    bgGradientStart: '#E8F1F7',
    bgGradientEnd: '#7EB8D8',
    label: '우울',
    message: '마음에 먹구름이 끼어있어요',
    // 처진형: 아래쪽으로 늘어진 형태
    shape: {
      borderRadius: '45% 55% 70% 30% / 35% 40% 60% 65%',
      borderRadiusAlt: '55% 45% 60% 40% / 40% 50% 50% 55%',
    },
    face: { eyes: 'sad', mouth: 'wave' },
  },
  anger: {
    jellyColor: '#F28B82',
    bgGradientStart: '#FDECEA',
    bgGradientEnd: '#F28B82',
    label: '분노',
    message: '마음에 뜨거운 감정이 올라왔어요',
    // 각진형: 팽팽하고 긴장된 형태
    shape: {
      borderRadius: '40% 60% 35% 65% / 60% 38% 65% 35%',
      borderRadiusAlt: '55% 45% 50% 50% / 45% 55% 50% 50%',
    },
    face: { eyes: 'angry', mouth: 'wavy' },
  },
  fear: {
    jellyColor: '#B39DDB',
    bgGradientStart: '#EDE7F6',
    bgGradientEnd: '#B39DDB',
    label: '불안',
    message: '마음에 불안이 감도는 느낌이에요',
    // 떨리는형: 불안정하고 미세하게 흔들리는 형태
    shape: {
      borderRadius: '58% 42% 48% 52% / 52% 58% 42% 48%',
      borderRadiusAlt: '42% 58% 55% 45% / 48% 42% 58% 52%',
    },
    face: { eyes: 'scared', mouth: 'o-mouth' },
  },
  disgust: {
    jellyColor: '#81C784',
    bgGradientStart: '#E8F5E9',
    bgGradientEnd: '#81C784',
    label: '불쾌',
    message: '마음에 거슬리는 느낌이 있어요',
    // 비대칭형: 한쪽으로 치우친 형태
    shape: {
      borderRadius: '70% 30% 55% 45% / 40% 65% 35% 60%',
      borderRadiusAlt: '50% 50% 65% 35% / 60% 40% 55% 45%',
    },
    face: { eyes: 'squint', mouth: 'flat' },
  },
  surprise: {
    jellyColor: '#FFD93D',
    bgGradientStart: '#FFFDE7',
    bgGradientEnd: '#FFD93D',
    label: '놀람',
    message: '마음에 깜짝 놀랄 일이 생겼어요',
    // 약간 불규칙한 둥근형
    shape: {
      borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%',
      borderRadiusAlt: '45% 55% 60% 40% / 55% 45% 50% 50%',
    },
    face: { eyes: 'wide', mouth: 'o' },
  },
  love: {
    jellyColor: '#FF6B8A',
    bgGradientStart: '#FFF0F3',
    bgGradientEnd: '#FF6B8A',
    label: '사랑',
    message: '마음에 따뜻한 사랑이 가득해요',
    // 부드러운 하트형
    shape: {
      borderRadius: '68% 32% 62% 38% / 38% 62% 38% 62%',
      borderRadiusAlt: '38% 62% 45% 55% / 60% 40% 55% 45%',
    },
    face: { eyes: 'heart', mouth: 'smile' },
  },
  gratitude: {
    jellyColor: '#FFB347',
    bgGradientStart: '#FFF8E1',
    bgGradientEnd: '#FFB347',
    label: '감사',
    message: '마음에 감사한 마음이 피어났어요',
    // 포근한 둥근형
    shape: {
      borderRadius: '62% 38% 58% 42% / 42% 58% 38% 62%',
      borderRadiusAlt: '48% 52% 52% 48% / 52% 48% 55% 45%',
    },
    face: { eyes: 'crescent', mouth: 'grin' },
  },
  hope: {
    jellyColor: '#5BC0EB',
    bgGradientStart: '#E1F5FE',
    bgGradientEnd: '#5BC0EB',
    label: '희망',
    message: '마음에 밝은 희망이 빛나고 있어요',
    // 위로 뻗는 타원형
    shape: {
      borderRadius: '50% 50% 55% 45% / 38% 55% 45% 62%',
      borderRadiusAlt: '45% 55% 48% 52% / 55% 42% 58% 45%',
    },
    face: { eyes: 'sparkle', mouth: 'beam' },
  },
};
