/**
 * 감정 인사이트 훅
 * 개인화된 감정 패턴 분석
 * @MX:SPEC: SPEC-UI-001
 * @MX:NOTE: diaryStore.entries 기반 실제 데이터 집계
 */

import { useMemo, useRef } from 'react';
import { diaryStore } from '@/stores/diaryStore';
import { EMOTION_THEME } from '@/lib/constants/emotion';
import {
  calculateTopEmotions,
  detectPatternChange,
  calculateStreak,
} from '@/lib/emotion-insights';
import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 훅 반환 타입
export interface EmotionInsightsResult {
  topEmotions: Array<{ emotion: EmotionType; count: number; percentage: number }>;
  patternChange: {
    emotion: EmotionType;
    trend: 'up' | 'down' | 'same';
    message: string;
  } | null;
  streak: number;
  currentInsight: {
    summary: string;
    advice: string;
  };
}

// @MX:NOTE: 기본 감정 (데이터 없을 때 사용)
const DEFAULT_EMOTION: EmotionType = 'joy';

/**
 * 감정 인사이트 훅
 * diaryStore.entries에서 최근 7일 데이터를 분석하여 개인화된 인사이트를 제공합니다.
 */
export function useEmotionInsights(): EmotionInsightsResult {
  const entries = diaryStore((state) => state.entries);

  // @MX:NOTE: 상위 3개 감정 집계 (7일)
  const topEmotions = useMemo(
    () => calculateTopEmotions(entries, 7),
    [entries],
  );

  // @MX:NOTE: 감정 패턴 변화 감지
  const patternChange = useMemo(
    () => detectPatternChange(entries),
    [entries],
  );

  // @MX:NOTE: 연속 일기 작성 일수
  const streak = useMemo(
    () => calculateStreak(entries),
    [entries],
  );

  // @MX:NOTE: 현재 인사이트 - 가장 많이 느낀 감정 기반
  // @MX:NOTE: 렌더링마다 조언이 변경되지 않도록 useMemo로 안정화
  // @MX:NOTE: 첫 렌더링 시에만 랜덤 인덱스 생성 (purity rule 준수)
  const adviceIndexRef = useRef<number>(0);
  if (adviceIndexRef.current === 0) {
    adviceIndexRef.current = Math.floor(Math.random() * 10); // 초기화 시 한 번만 실행
  }

  const advice = useMemo(() => {
    const dominantEmotion = topEmotions.length > 0
      ? topEmotions[0].emotion
      : DEFAULT_EMOTION;
    const theme = EMOTION_THEME[dominantEmotion];
    // determinstic한 인덱스 계산 (감정 타입 기반 해시)
    const emotionCode = dominantEmotion.slice(0, 3).charCodeAt(0);
    const adviceIndex = emotionCode % theme.advice.length;
    return theme.advice[adviceIndex];
  }, [topEmotions]);

  const currentInsight = useMemo(() => {
    const dominantEmotion = topEmotions.length > 0
      ? topEmotions[0].emotion
      : DEFAULT_EMOTION;

    const theme = EMOTION_THEME[dominantEmotion];
    return {
      summary: theme.message,
      advice,
    };
  }, [topEmotions, advice]);

  return {
    topEmotions,
    patternChange,
    streak,
    currentInsight,
  };
}
