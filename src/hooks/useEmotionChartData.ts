/**
 * 감정 차트 데이터 훅
 * diaryStore에서 최근 7일 데이터 집계
 * @MX:SPEC: SPEC-UI-001
 */

import { useMemo } from 'react';
import { diaryStore } from '@/stores/diaryStore';
import { EMOTION_COLORS } from '@/lib/constants/emotion';
import type { EmotionType } from '@/types/emotion';
import type { WeeklyEmotionData, EmotionDistribution, EmotionChartDataResult } from '@/types/emotion-chart';
import type { DiaryEntry } from '@/types/diary';

// @MX:NOTE: 모든 감정 키 배열 (초기화용)
const ALL_EMOTIONS: EmotionType[] = [
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope',
];

// @MX:NOTE: 감정별 빈도 초기값 (0으로 초기화)
const EMPTY_COUNTS: Record<EmotionType, number> = {
  joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0,
  surprise: 0, love: 0, gratitude: 0, hope: 0,
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 최근 N일간 날짜 배열 생성 (오늘 포함)
 * 인덱스 0 = (N-1)일 전, 인덱스 (N-1) = 오늘
 * @MX:NOTE: REQ-VIS-004-3 주간/월간 뷰 전환 지원
 */
function getLastNDays(daysCount: number): Date[] {
  const days: Date[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

/**
 * 최근 7일간 날짜 배열 생성 (오늘 포함)
 * 인덱스 0 = 6일 전, 인덱스 6 = 오늘
 */
function getLast7Days(): Date[] {
  return getLastNDays(7);
}

/**
 * 최근 30일간 날짜 배열 생성 (오늘 포함)
 * REQ-VIS-004-3: 월간 뷰 지원
 */
function getLast30Days(): Date[] {
  return getLastNDays(30);
}

/**
 * 엔트리가 특정 기간 범위 내에 있는지 확인
 * @MX:NOTE: N일 범위 필터링 (주간/월간 공통)
 */
function isWithinDateRange(createdAt: string, startDate: Date, daysCount: number): boolean {
  const entryDate = new Date(createdAt);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysCount);
  return entryDate >= startDate && entryDate < endDate;
}

/**
 * 엔트리가 최근 7일 범위 내에 있는지 확인
 */
function isWithinLast7Days(createdAt: string, startDate: Date): boolean {
  return isWithinDateRange(createdAt, startDate, 7);
}

/**
 * 엔트리가 최근 30일 범위 내에 있는지 확인
 * REQ-VIS-004-3: 월간 뷰 지원
 */
function isWithinLast30Days(createdAt: string, startDate: Date): boolean {
  return isWithinDateRange(createdAt, startDate, 30);
}

/**
 * 일별 감정 빈도 집계 (N일 범위)
 * @MX:NOTE: 주간/월간 데이터 집계 공통 함수
 */
function aggregateDailyData(entries: DiaryEntry[], daysCount: number): WeeklyEmotionData[] {
  const days = getLastNDays(daysCount);
  const startDate = days[0];

  // 날짜별 빈도 맵 초기화
  const frequencyMap = new Map<string, Record<EmotionType, number>>();

  days.forEach((day) => {
    const dateKey = formatDate(day);
    frequencyMap.set(dateKey, { ...EMPTY_COUNTS });
  });

  // N일 이내 엔트리만 집계
  entries
    .filter((entry) => isWithinDateRange(entry.createdAt, startDate, daysCount))
    .forEach((entry) => {
      const entryDate = formatDate(new Date(entry.createdAt));
      const dayCounts = frequencyMap.get(entryDate);
      if (dayCounts) {
        dayCounts[entry.emotion] += 1;
      }
    });

  // WeeklyEmotionData 배열로 변환
  return days.map((day) => {
    const dateKey = formatDate(day);
    const counts = frequencyMap.get(dateKey)!;
    return {
      date: dateKey,
      ...counts,
    };
  });
}

/**
 * 일별 감정 빈도 집계 (7일)
 */
function aggregateWeeklyData(entries: DiaryEntry[]): WeeklyEmotionData[] {
  return aggregateDailyData(entries, 7);
}

/**
 * 일별 감정 빈도 집계 (30일)
 * REQ-VIS-004-3: 월간 뷰 지원
 */
function aggregateMonthlyData(entries: DiaryEntry[]): WeeklyEmotionData[] {
  return aggregateDailyData(entries, 30);
}

/**
 * 감정 분포 백분율 계산
 */
function calculateDistribution(entries: DiaryEntry[]): EmotionDistribution[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  // 7일 이내 엔트리만 필터링
  const recentEntries = entries.filter((entry) =>
    isWithinLast7Days(entry.createdAt, startDate),
  );

  if (recentEntries.length === 0) {
    return [];
  }

  // 감정별 카운트
  const countMap: Record<EmotionType, number> = { ...EMPTY_COUNTS };

  recentEntries.forEach((entry) => {
    countMap[entry.emotion] += 1;
  });

  const total = recentEntries.length;

  // 빈도가 0인 감정은 제외하고 백분율 계산
  const distribution: EmotionDistribution[] = [];
  let remainingPercentage = 100;

  const emotionsWithCount = ALL_EMOTIONS.filter((e) => countMap[e] > 0);

  emotionsWithCount.forEach((emotion, index) => {
    const count = countMap[emotion];
    let percentage: number;

    // 마지막 항목은 남은 백분율을 모두 할당하여 합이 정확히 100이 되도록 보장
    if (index === emotionsWithCount.length - 1) {
      percentage = remainingPercentage;
    } else {
      percentage = Math.round((count / total) * 100);
      remainingPercentage -= percentage;
    }

    distribution.push({
      emotionKey: emotion,
      count,
      percentage,
      color: EMOTION_COLORS[emotion],
    });
  });

  return distribution;
}

/**
 * 감정 차트 데이터 집계 훅
 * diaryStore.entries에서 최근 7일/30일 데이터를 집계하여 반환합니다.
 * REQ-VIS-004-3: 주간/월간 뷰 전환 지원
 */
export function useEmotionChartData() {
  const entries = diaryStore((state) => state.entries);

  const weeklyData = useMemo(() => aggregateWeeklyData(entries), [entries]);
  const monthlyData = useMemo(() => aggregateMonthlyData(entries), [entries]);
  const distribution = useMemo(() => calculateDistribution(entries), [entries]);

  return { weeklyData, monthlyData, distribution };
}
