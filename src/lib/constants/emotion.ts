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

// @MX:ANCHOR: 감정 테마 매핑 (UI 전체에서 사용)
// @MX:REASON: 홈 화면 배경, 젤리 표정, 메시지 카드 등 3개 이상 모듈에서 참조
// @MX:SPEC: Stitch 디자인 스펙 기반 감정별 UI 테마

export const EMOTION_THEME: Record<EmotionType, {
  jellyColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  label: string;
  message: string;
  face: { eyes: string; mouth: string };
}> = {
  joy: {
    jellyColor: '#FFD1DC',
    bgGradientStart: '#FFF0F3',
    bgGradientEnd: '#FFD1DC',
    label: '평온',
    message: '마음이 평온한 상태예요',
    face: { eyes: '• •', mouth: 'smile' },
  },
  sadness: {
    jellyColor: '#AEC6CF',
    bgGradientStart: '#EEF2F5',
    bgGradientEnd: '#AEC6CF',
    label: '우울',
    message: '마음에 먹구름이 끼어있어요',
    face: { eyes: 'u u', mouth: 'wave' },
  },
  anger: {
    jellyColor: '#FFB3A7',
    bgGradientStart: '#FFF0ED',
    bgGradientEnd: '#FFB3A7',
    label: '분노',
    message: '마음에 뜨거운 감정이 올라왔어요',
    face: { eyes: '/ \\', mouth: 'wavy' },
  },
  fear: {
    jellyColor: '#E6E6FA',
    bgGradientStart: '#F0EEF5',
    bgGradientEnd: '#E6E6FA',
    label: '불안',
    message: '마음에 불안이 감도는 느낌이에요',
    face: { eyes: 'o o', mouth: 'o-mouth' },
  },
  disgust: {
    jellyColor: '#B5D8C7',
    bgGradientStart: '#EEF5EF',
    bgGradientEnd: '#B5D8C7',
    label: '불쾌',
    message: '마음에 거슬리는 느낌이 있어요',
    face: { eyes: '•  •', mouth: 'flat' },
  },
};
