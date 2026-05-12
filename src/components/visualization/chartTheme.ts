/**
 * Recharts 차트 테마 유틸리티
 * EMOTION_COLORS를 Recharts 차트 테마로 매핑
 */

import { EMOTION_COLORS } from '@/lib/constants/emotion';
import type { EmotionType } from '@/types/emotion';
import type { ChartThemeColors } from '@/types/emotion-chart';

// @MX:NOTE: EMOTION_COLORS → Recharts 테마 매핑
export const chartTheme: ChartThemeColors = { ...EMOTION_COLORS };

// @MX:NOTE: 감정 키별 색상 조회 함수
export function getChartColor(emotion: EmotionType): string {
  return chartTheme[emotion] ?? '#999999';
}

// @MX:NOTE: 차트 표시 순서 (긍정 → 부정 흐름)
export const EMOTION_CHART_ORDER: EmotionType[] = [
  'joy',
  'love',
  'gratitude',
  'hope',
  'surprise',
  'sadness',
  'fear',
  'anger',
  'disgust',
];
