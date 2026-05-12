// 감정 인사이트 훅
// 개인화된 감정 패턴 분석
// @MX:SPEC: SPEC-UI-001
// @MX:TODO: 현재 임시 구현. SPEC-UI-001-F에서 개인화 로직 구현 예정

import { EMOTION_THEME } from '@/lib/constants/emotion';
import type { EmotionType } from '@/types/emotion';

export function useEmotionInsights() {
  // @MX:TODO: RED phase - implement insights calculation
  // 임시 기본값 반환 (GREEN 단계)
  const defaultEmotion: EmotionType = 'joy';

  return {
    topEmotions: [],
    patternChange: null,
    streak: 0,
    // @MX:NOTE: 현재는 기본 감정의 메시지/조언 반환
    // SPEC-UI-001-F에서 실제 데이터 기반 인사이트로 대체 예정
    currentInsight: {
      summary: EMOTION_THEME[defaultEmotion].message,
      advice: EMOTION_THEME[defaultEmotion].advice[0],
    },
  };
}
