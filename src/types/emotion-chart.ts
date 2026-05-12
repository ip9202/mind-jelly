/**
 * 감정 차트 데이터 타입 정의
 * Recharts 차트 시각화를 위한 타입 스키마
 */

import type { EmotionType } from './emotion';

// @MX:NOTE: ISO 날짜 문자열 (YYYY-MM-DD 형식)
export type EmotionChartDate = string;

// @MX:NOTE: 감정 빈도 수
export type EmotionChartFrequency = number;

// @MX:NOTE: 주간 감정 트렌드 데이터 (Recharts BarChart용)
// 각 날짜별 감정 빈도를 포함
export interface WeeklyEmotionData {
  date: EmotionChartDate;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  disgust: number;
  surprise: number;
  love: number;
  gratitude: number;
  hope: number;
}

// @MX:NOTE: 감정 분포 데이터 (Recharts DonutChart/PieChart용)
export interface EmotionDistribution {
  emotionKey: EmotionType;
  count: number;
  percentage: number;
  color: string;
}

// @MX:NOTE: 차트 테마 색상 매핑 (감정키 → hex 색상)
export interface ChartThemeColors {
  [emotionKey: string]: string;
}

// @MX:NOTE: useEmotionChartData 훅 반환 타입
// REQ-VIS-004-3: 주간/월간 뷰 전환 지원
export interface EmotionChartDataResult {
  weeklyData: WeeklyEmotionData[];
  monthlyData: WeeklyEmotionData[];
  distribution: EmotionDistribution[];
}
