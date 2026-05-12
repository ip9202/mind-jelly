/**
 * useEmotionChartData 훅 테스트
 * T2: 감정 차트 데이터 집계 로직
 * - useMemo 캐싱 동작 확인
 * - aggregateWeeklyData (7일 집계)
 * - aggregateMonthlyData (30일 집계)
 * - 빈 배열 처리
 * - calculateDistribution 백분율 계산
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import type { DiaryEntry } from '@/types/diary';
import type { EmotionType } from '@/types/emotion';

// diaryStore 모킹: selector 함수에 mockEntries 배열을 제공
const mockEntries: DiaryEntry[] = [];

jest.mock('@/stores/diaryStore', () => ({
  diaryStore: jest.fn((selector: (state: { entries: DiaryEntry[] }) => unknown) =>
    selector({ entries: mockEntries }),
  ),
}));

// 헬퍼: 오늘 기준 N일 전 ISO 날짜 문자열 생성
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

// 헬퍼: 테스트용 DiaryEntry 생성
function createEntry(emotion: EmotionType, daysOffset: number, id?: string): DiaryEntry {
  return {
    id: id ?? `entry-${emotion}-${daysOffset}`,
    text: `테스트 일기 - ${emotion}`,
    emotion,
    confidence: 0.9,
    emotionKo: emotion,
    createdAt: daysAgo(daysOffset),
    isShared: false,
  };
}

// 모든 감정 키 배열 (검증용)
const ALL_EMOTION_KEYS: EmotionType[] = [
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope',
];

describe('useEmotionChartData', () => {
  let mockDiaryStore: jest.Mock;

  beforeEach(() => {
    mockEntries.length = 0;

    // diaryStore mock을 원래 동작으로 리셋
    const { diaryStore } = jest.requireMock('@/stores/diaryStore');
    mockDiaryStore = diaryStore as jest.Mock;
    mockDiaryStore.mockImplementation(
      (selector: (state: { entries: DiaryEntry[] }) => unknown) =>
        selector({ entries: mockEntries }),
    );
  });

  // ------------------------------------------------------------------ //
  // 1. 빈 배열 처리
  // ------------------------------------------------------------------ //
  describe('빈 데이터 처리', () => {
    it('entries가 빈 배열이면 weeklyData는 7개 포인트를 반환하고 모든 감정값이 0이어야 합니다', async () => {
      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      expect(result.current.weeklyData).toHaveLength(7);
      result.current.weeklyData.forEach((d) => {
        ALL_EMOTION_KEYS.forEach((key) => {
          expect(d[key]).toBe(0);
        });
      });
    });

    it('entries가 빈 배열이면 monthlyData는 30개 포인트를 반환하고 모든 감정값이 0이어야 합니다', async () => {
      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      expect(result.current.monthlyData).toHaveLength(30);
      result.current.monthlyData.forEach((d) => {
        ALL_EMOTION_KEYS.forEach((key) => {
          expect(d[key]).toBe(0);
        });
      });
    });

    it('entries가 빈 배열이면 distribution은 빈 배열이어야 합니다', async () => {
      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      expect(result.current.distribution).toEqual([]);
    });
  });

  // ------------------------------------------------------------------ //
  // 2. aggregateWeeklyData - 주간(7일) 감정 빈도 집계
  // ------------------------------------------------------------------ //
  describe('aggregateWeeklyData (7일 집계)', () => {
    it('최근 7일간 날짜별 감정 빈도를 올바르게 집계해야 합니다', async () => {
      // 오늘: joy 2개, sadness 1개
      mockEntries.push(
        createEntry('joy', 0, 'a'),
        createEntry('joy', 0, 'b'),
        createEntry('sadness', 0, 'c'),
      );
      // 3일 전: anger 1개
      mockEntries.push(createEntry('anger', 3));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const weeklyData = result.current.weeklyData;
      expect(weeklyData).toHaveLength(7);

      // 오늘(인덱스 6): joy=2, sadness=1
      const todayData = weeklyData[6];
      expect(todayData.joy).toBe(2);
      expect(todayData.sadness).toBe(1);

      // 3일 전(인덱스 3): anger=1
      const threeDaysAgoData = weeklyData[3];
      expect(threeDaysAgoData.anger).toBe(1);
    });

    it('7일을 초과하는 과거 엔트리는 집계에서 제외해야 합니다', async () => {
      mockEntries.push(
        createEntry('joy', 8),      // 8일 전: 제외
        createEntry('sadness', 6),   // 6일 전: 포함
        createEntry('anger', 0),     // 오늘: 포함
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const weeklyData = result.current.weeklyData;
      expect(weeklyData).toHaveLength(7);

      const totalJoy = weeklyData.reduce((sum, d) => sum + d.joy, 0);
      expect(totalJoy).toBe(0); // 8일 전 joy는 제외

      const totalSadness = weeklyData.reduce((sum, d) => sum + d.sadness, 0);
      expect(totalSadness).toBe(1);

      const totalAnger = weeklyData.reduce((sum, d) => sum + d.anger, 0);
      expect(totalAnger).toBe(1);
    });

    it('데이터가 없는 날짜는 모든 감정 빈도가 0이어야 합니다', async () => {
      mockEntries.push(createEntry('joy', 0));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const weeklyData = result.current.weeklyData;
      // 가장 오래된 날(6일 전)은 데이터가 없음
      const emptyDay = weeklyData[0];
      ALL_EMOTION_KEYS.forEach((key) => {
        expect(emptyDay[key]).toBe(0);
      });
    });

    it('각 데이터 포인트는 YYYY-MM-DD 형식의 date 문자열을 가져야 합니다', async () => {
      mockEntries.push(createEntry('joy', 0));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      result.current.weeklyData.forEach((dataPoint) => {
        expect(dataPoint.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('같은 날 같은 감정이 여러 번이면 빈도가 누적되어야 합니다', async () => {
      mockEntries.push(
        createEntry('fear', 1, 'a'),
        createEntry('fear', 1, 'b'),
        createEntry('fear', 1, 'c'),
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      // 1일 전(인덱스 5): fear=3
      const oneDayAgoData = result.current.weeklyData[5];
      expect(oneDayAgoData.fear).toBe(3);
    });
  });

  // ------------------------------------------------------------------ //
  // 3. aggregateMonthlyData - 월간(30일) 감정 빈도 집계
  // ------------------------------------------------------------------ //
  describe('aggregateMonthlyData (30일 집계)', () => {
    it('monthlyData는 항상 30개 데이터 포인트를 반환해야 합니다', async () => {
      mockEntries.push(createEntry('joy', 0));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      expect(result.current.monthlyData).toHaveLength(30);
    });

    it('최근 30일간 날짜별 감정 빈도를 올바르게 집계해야 합니다', async () => {
      // 20일 전 엔트리
      mockEntries.push(
        createEntry('hope', 20, 'a'),
        createEntry('hope', 20, 'b'),
      );
      // 15일 전 엔트리
      mockEntries.push(createEntry('gratitude', 15));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const monthlyData = result.current.monthlyData;
      expect(monthlyData).toHaveLength(30);

      // 20일 전(인덱스 9): hope=2
      const twentyDaysAgoData = monthlyData[9];
      expect(twentyDaysAgoData.hope).toBe(2);

      // 15일 전(인덱스 14): gratitude=1
      const fifteenDaysAgoData = monthlyData[14];
      expect(fifteenDaysAgoData.gratitude).toBe(1);
    });

    it('30일을 초과하는 과거 엔트리는 제외되어야 합니다', async () => {
      mockEntries.push(
        createEntry('joy', 31),      // 31일 전: 제외
        createEntry('sadness', 29),   // 29일 전: 포함
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const monthlyData = result.current.monthlyData;
      expect(monthlyData).toHaveLength(30);

      const totalJoy = monthlyData.reduce((sum, d) => sum + d.joy, 0);
      expect(totalJoy).toBe(0); // 31일 전은 제외

      const totalSadness = monthlyData.reduce((sum, d) => sum + d.sadness, 0);
      expect(totalSadness).toBe(1);
    });

    it('weeklyData에 포함된 엔트리는 monthlyData에도 포함되어야 합니다', async () => {
      mockEntries.push(
        createEntry('love', 0),
        createEntry('love', 3),
        createEntry('love', 6),
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const weeklyTotal = result.current.weeklyData.reduce((s, d) => s + d.love, 0);
      const monthlyTotal = result.current.monthlyData.reduce((s, d) => s + d.love, 0);

      // 7일 이내 엔트리 3개는 weekly와 monthly 모두에 포함
      expect(weeklyTotal).toBe(3);
      expect(monthlyTotal).toBe(3);
    });

    it('데이터가 없는 날짜는 0으로 채워져야 합니다', async () => {
      // 25일 전 데이터만 존재
      mockEntries.push(createEntry('disgust', 25));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const monthlyData = result.current.monthlyData;

      // 대부분의 날은 모든 감정이 0
      let zeroDays = 0;
      monthlyData.forEach((d) => {
        const allZero = ALL_EMOTION_KEYS.every((key) => d[key] === 0);
        if (allZero) zeroDays++;
      });
      // 30일 중 1일만 데이터가 있으므로 29일은 모두 0
      expect(zeroDays).toBe(29);
    });
  });

  // ------------------------------------------------------------------ //
  // 4. calculateDistribution - 백분율 계산
  // ------------------------------------------------------------------ //
  describe('calculateDistribution (백분율 계산)', () => {
    it('각 감정의 백분율을 올바르게 계산해야 합니다', async () => {
      // joy 3개, sadness 1개 = 총 4개
      mockEntries.push(
        createEntry('joy', 0, 'a'),
        createEntry('joy', 1, 'b'),
        createEntry('joy', 2, 'c'),
        createEntry('sadness', 3),
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const distribution = result.current.distribution;
      const joyItem = distribution.find((d) => d.emotionKey === 'joy');
      const sadnessItem = distribution.find((d) => d.emotionKey === 'sadness');

      expect(joyItem?.percentage).toBe(75); // 3/4 * 100
      expect(sadnessItem?.percentage).toBe(25); // 1/4 * 100
    });

    it('백분율의 합은 항상 정확히 100이어야 합니다', async () => {
      // 4개 서로 다른 감정
      mockEntries.push(
        createEntry('joy', 0),
        createEntry('sadness', 1),
        createEntry('anger', 2),
        createEntry('fear', 3),
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const totalPercentage = result.current.distribution.reduce(
        (sum, d) => sum + d.percentage,
        0,
      );
      expect(totalPercentage).toBe(100);
    });

    it('빈도가 0인 감정은 distribution에서 제외되어야 합니다', async () => {
      mockEntries.push(
        createEntry('joy', 0),
        createEntry('joy', 1),
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const distribution = result.current.distribution;
      expect(distribution).toHaveLength(1);
      expect(distribution[0].emotionKey).toBe('joy');
    });

    it('단일 감정은 백분율 100이어야 합니다', async () => {
      mockEntries.push(createEntry('love', 0));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const distribution = result.current.distribution;
      expect(distribution).toHaveLength(1);
      expect(distribution[0].emotionKey).toBe('love');
      expect(distribution[0].percentage).toBe(100);
      expect(distribution[0].count).toBe(1);
    });

    it('각 distribution 항목은 emotionKey, count, percentage, color를 포함해야 합니다', async () => {
      mockEntries.push(createEntry('anger', 0));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const item = result.current.distribution[0];
      expect(item).toHaveProperty('emotionKey', 'anger');
      expect(item).toHaveProperty('count', 1);
      expect(item).toHaveProperty('percentage', 100);
      expect(item).toHaveProperty('color');
      expect(item.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('최근 7일 이내 엔트리만 distribution에 반영되어야 합니다', async () => {
      mockEntries.push(
        createEntry('joy', 3),       // 3일 전: 포함
        createEntry('sadness', 8),    // 8일 전: 제외
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const distribution = result.current.distribution;
      // sadness(8일 전)는 제외되므로 joy만 존재
      expect(distribution).toHaveLength(1);
      expect(distribution[0].emotionKey).toBe('joy');
      expect(distribution[0].count).toBe(1);
    });

    it('다수 감정의 백분율 합도 정확히 100이어야 합니다', async () => {
      // joy 5개, anger 3개, fear 2개 = 총 10개
      for (let i = 0; i < 5; i++) mockEntries.push(createEntry('joy', i, `j${i}`));
      for (let i = 0; i < 3; i++) mockEntries.push(createEntry('anger', i, `a${i}`));
      for (let i = 0; i < 2; i++) mockEntries.push(createEntry('fear', i, `f${i}`));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const distribution = result.current.distribution;

      // 백분율 합 = 100
      const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
      expect(totalPercentage).toBe(100);

      // 각 감정의 count 확인
      const joyItem = distribution.find((d) => d.emotionKey === 'joy');
      const angerItem = distribution.find((d) => d.emotionKey === 'anger');
      const fearItem = distribution.find((d) => d.emotionKey === 'fear');
      expect(joyItem?.count).toBe(5);
      expect(angerItem?.count).toBe(3);
      expect(fearItem?.count).toBe(2);
    });
  });

  // ------------------------------------------------------------------ //
  // 5. useMemo 캐싱 동작
  // ------------------------------------------------------------------ //
  describe('useMemo 캐싱 동작', () => {
    it('entries가 변경되지 않으면 동일한 참조를 유지해야 합니다', async () => {
      mockEntries.push(createEntry('joy', 0));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result, rerender } = renderHook(() => useEmotionChartData());

      const firstWeekly = result.current.weeklyData;
      const firstMonthly = result.current.monthlyData;
      const firstDistribution = result.current.distribution;

      rerender();

      // 동일 참조 (메모이제이션)
      expect(result.current.weeklyData).toBe(firstWeekly);
      expect(result.current.monthlyData).toBe(firstMonthly);
      expect(result.current.distribution).toBe(firstDistribution);
    });

    it('entries 참조가 변경되면 새로운 값으로 재계산되어야 합니다', async () => {
      // 초기 엔트리 설정
      mockEntries.push(createEntry('joy', 0));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result, rerender } = renderHook(() => useEmotionChartData());

      // 초기 상태: joy 1개
      expect(result.current.distribution).toHaveLength(1);

      // 새로운 entries 배열로 diaryStore mock 교체 (참조 변경)
      const updatedEntries = [
        createEntry('joy', 0),
        createEntry('sadness', 1),
      ];
      mockDiaryStore.mockImplementation(
        (selector: (state: { entries: DiaryEntry[] }) => unknown) =>
          selector({ entries: updatedEntries }),
      );

      rerender();

      // 재계산됨: joy + sadness
      expect(result.current.distribution).toHaveLength(2);
      const emotionKeys = result.current.distribution.map((d) => d.emotionKey);
      expect(emotionKeys).toContain('joy');
      expect(emotionKeys).toContain('sadness');
    });
  });

  // ------------------------------------------------------------------ //
  // 6. 엣지 케이스
  // ------------------------------------------------------------------ //
  describe('엣지 케이스', () => {
    it('단일 엔트리도 올바르게 처리되어야 합니다', async () => {
      mockEntries.push(createEntry('love', 2));

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      // weeklyData: 7일 중 2일 전에 love=1
      const weeklyData = result.current.weeklyData;
      expect(weeklyData).toHaveLength(7);
      expect(weeklyData[4].love).toBe(1); // 인덱스 4 = 2일 전

      // monthlyData: 30일 중 2일 전에 love=1
      const monthlyData = result.current.monthlyData;
      expect(monthlyData).toHaveLength(30);
      expect(monthlyData[27].love).toBe(1); // 인덱스 27 = 2일 전

      // distribution: love 100%
      const distribution = result.current.distribution;
      expect(distribution).toHaveLength(1);
      expect(distribution[0].emotionKey).toBe('love');
      expect(distribution[0].percentage).toBe(100);
    });

    it('같은 날 여러 감정이 기록되면 각각 독립적으로 집계되어야 합니다', async () => {
      mockEntries.push(
        createEntry('joy', 0, 'a'),
        createEntry('anger', 0, 'b'),
        createEntry('fear', 0, 'c'),
      );

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const todayData = result.current.weeklyData[6];
      expect(todayData.joy).toBe(1);
      expect(todayData.anger).toBe(1);
      expect(todayData.fear).toBe(1);

      const distribution = result.current.distribution;
      expect(distribution).toHaveLength(3);
      // 각 33% (반올림), 마지막 항목이 나머지를 가져와서 합=100
      const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
      expect(totalPercentage).toBe(100);
    });

    it('모든 9개 감정이 골고루 분포해도 올바르게 집계되어야 합니다', async () => {
      ALL_EMOTION_KEYS.forEach((emotion, i) => {
        mockEntries.push(createEntry(emotion, i % 7, `all-${emotion}`));
      });

      const { useEmotionChartData } = await import('../useEmotionChartData');
      const { result } = renderHook(() => useEmotionChartData());

      const distribution = result.current.distribution;

      // 9개 감정 모두 1개씩
      expect(distribution).toHaveLength(9);

      // 백분율 합 = 100
      const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
      expect(totalPercentage).toBe(100);

      // 각 감정 count = 1
      distribution.forEach((item) => {
        expect(item.count).toBe(1);
      });
    });
  });
});
