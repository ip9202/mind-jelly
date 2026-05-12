/**
 * 감정/구슬 상수 정의
 * REQ-EVT-005
 * @MX:NOTE: 감정별 색상 매핑 (P0 단계는 하드코딩)
 * @MX:SPEC: REQ-EVT-005
 */

import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: UI 보조 색상 (감정 외 고정 색상)
// @MX:SPEC: SPEC-UI-001
export const UI_COLORS = {
  /** 기타 섹터 색상 */
  otherSector: '#E0E0E0',
  /** 스트릭 아이콘/텍스트 색상 */
  streak: '#FF6D3F',
  /** 트렌드 하락 색상 */
  trendDown: '#5BC0EB',
} as const;

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
  advice: string[];
  shape: { borderRadius: string; borderRadiusAlt?: string };
  face: { eyes: string; mouth: string };
}> = {
  joy: {
    jellyColor: '#FFB7C5',
    bgGradientStart: '#FFF0F3',
    bgGradientEnd: '#FFB7C5',
    label: '평온',
    message: '마음이 평온한 상태예요',
    advice: [
      '지금 이 순간을 음미하며 좋아하는 음악을 들어보세요',
      '평온한 마음으로 좋아하는 책을 읽어보세요',
      '오늘 하루 감사한 순간을 떠올려보세요',
      '창밖 풍경을 보며 여유를 즐겨보세요',
      '마음이 편안할 때 좋아하는 취미를 즐겨보세요',
    ],
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
    advice: [
      '가벼운 산책이나 따뜻한 차 한 잔 어떨까요',
      '신뢰할 수 있는 사람에게 마음을 털어놓아보세요',
      '좋아하는 영화나 드라마를 보며 위로받아보세요',
      '일기를 써서 마음을 정리해보세요',
      '따뜻한 물로 샤워하며 하루를 마무리해보세요',
    ],
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
    advice: [
      '심호흡을 천천히 세 번 해보세요',
      '종이에 감정을 적어보고 찢어버려보세요',
      '30초 동안 찬물로 손을 씻어보세요',
      '조용한 곳에서 1분간 눈을 감아보세요',
      '가벼운 스트레칭으로 몸의 긴장을 풀어보세요',
    ],
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
    advice: [
      '주변의 사물 5가지를 찾아보세요',
      '손으로 바닥을 짚고 느낌에 집중해보세요',
      '4초간 숨을 들이마시고 7초간 내쉬어보세요',
      '안전한 사람에게 지금 느끼는 감정을 말해보세요',
      '좋아하는 향기 나는 것을 가까이 해보세요',
    ],
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
    advice: [
      '잠시 자리에서 일어나 기지개를 켜보세요',
      '차가운 물을 한 모금 마셔보세요',
      '다른 공간으로 이동해 환경을 바꿔보세요',
      '좋아하는 음악을 들으며 기분을 전환해보세요',
      '10분간 산책하며 머리를 식혀보세요',
    ],
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
    advice: [
      '천천히 한 번 심호흡하고 상황을 정리해보세요',
      '놀란 일을 종이에 적어보며 정리해보세요',
      '친한 사람에게 방금 있었던 일을 이야기해보세요',
      '따뜻한 차를 마시며 진정해보세요',
      '지금 느끼는 감정에 이름을 붙여보세요',
    ],
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
    advice: [
      '소중한 사람에게 마음을 전해보세요',
      '사랑하는 사람과 추억 사진을 돌아보세요',
      '따뜻한 마음이 느껴지는 음악을 들어보세요',
      '감정을 편지로 적어보세요',
      '소중한 사람과 함께 맛있는 것을 먹어보세요',
    ],
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
    advice: [
      '오늘 감사한 일 세 가지를 적어보세요',
      '도움을 준 사람에게 고마움을 전해보세요',
      '작은 선행을 하나 실천해보세요',
      '감사한 마음을 일기로 남겨보세요',
      '주변 사람들에게 따뜻한 말 한마디 건네보세요',
    ],
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
    advice: [
      '작은 목표 하나를 정해 도전해보세요',
      '하고 싶었던 일을 지금 바로 시작해보세요',
      '미래의 나에게 편지를 써보세요',
      '긍정적인 글귀를 메모해두고 자주 읽어보세요',
      '새로운 것을 하나 배워보세요',
    ],
    // 위로 뻗는 타원형
    shape: {
      borderRadius: '50% 50% 55% 45% / 38% 55% 45% 62%',
      borderRadiusAlt: '45% 55% 48% 52% / 55% 42% 58% 45%',
    },
    face: { eyes: 'sparkle', mouth: 'beam' },
  },
};
