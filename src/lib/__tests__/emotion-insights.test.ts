/**
 * emotion-insights 유틸리티 테스트
 * @MX:SPEC: SPEC-UI-001
 * - calculateTopEmotions: 상위 감정 집계
 * - detectPatternChange: 패턴 변화 감지
 * - calculateStreak: 연속 작성 일수
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateTopEmotions,
  detectPatternChange,
  calculateStreak,
} from '../emotion-insights';
import type { DiaryEntry } from '@/types/diary';

// @MX:NOTE: 테스트용 엔트리 생성 헬퍼
function createEntry(emotion: string, daysAgo: number): DiaryEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);

  return {
    id: `test-${Math.random().toString(36).slice(2, 8)}`,
    text: '테스트 일기',
    emotion: emotion as DiaryEntry['emotion'],
    confidence: 0.9,
    emotionKo: '테스트',
    createdAt: date.toISOString(),
    isShared: false,
  };
}

describe('calculateTopEmotions', () => {
  it('빈 배열이면 빈 배열을 반환해야 함', () => {
    const result = calculateTopEmotions([]);
    expect(result).toEqual([]);
  });

  it('데이터가 7일 범위를 벗어나면 제외해야 함', () => {
    const entries = [
      createEntry('joy', 10), // 10일 전 - 범위 밖
      createEntry('sadness', 3), // 3일 전 - 범위 내
    ];

    const result = calculateTopEmotions(entries);
    expect(result).toHaveLength(1);
    expect(result[0].emotion).toBe('sadness');
  });

  it('상위 3개 감정을 퍼센트와 함께 반환해야 함', () => {
    const entries = [
      createEntry('joy', 1),
      createEntry('joy', 1),
      createEntry('joy', 2),
      createEntry('sadness', 1),
      createEntry('sadness', 2),
      createEntry('anger', 3),
    ];

    const result = calculateTopEmotions(entries);

    expect(result).toHaveLength(3);
    expect(result[0].emotion).toBe('joy');
    expect(result[0].count).toBe(3);
    expect(result[1].emotion).toBe('sadness');
    expect(result[1].count).toBe(2);
    expect(result[2].emotion).toBe('anger');
    expect(result[2].count).toBe(1);
  });

  it('퍼센트 합이 100이어야 함', () => {
    const entries = [
      createEntry('joy', 1),
      createEntry('joy', 2),
      createEntry('sadness', 1),
      createEntry('anger', 3),
      createEntry('fear', 4),
    ];

    const result = calculateTopEmotions(entries);
    const totalPercentage = result.reduce((sum, item) => sum + item.percentage, 0);

    expect(totalPercentage).toBe(100);
  });

  it('단일 감정만 있으면 100%로 반환해야 함', () => {
    const entries = [
      createEntry('joy', 1),
      createEntry('joy', 2),
      createEntry('joy', 3),
    ];

    const result = calculateTopEmotions(entries);

    expect(result).toHaveLength(1);
    expect(result[0].emotion).toBe('joy');
    expect(result[0].percentage).toBe(100);
  });

  it('빈도가 0인 감정은 제외해야 함', () => {
    const entries = [
      createEntry('joy', 1),
    ];

    const result = calculateTopEmotions(entries);

    expect(result).toHaveLength(1);
    expect(result[0].emotion).toBe('joy');
  });
});

describe('detectPatternChange', () => {
  it('빈 배열이면 null을 반환해야 함', () => {
    expect(detectPatternChange([])).toBeNull();
  });

  it('데이터가 부족하면 null을 반환해야 함', () => {
    // 최근 3일에만 데이터 있고 이전 3일에 없으면 null
    const entries = [
      createEntry('joy', 0),
      createEntry('joy', 1),
    ];

    expect(detectPatternChange(entries)).toBeNull();
  });

  it('유의미한 변화가 없으면 null을 반환해야 함', () => {
    // 양쪽 기간에 비슷한 분포
    const entries = [
      createEntry('joy', 0),
      createEntry('joy', 1),
      createEntry('joy', 2),
      createEntry('joy', 3),
      createEntry('joy', 4),
      createEntry('joy', 5),
    ];

    expect(detectPatternChange(entries)).toBeNull();
  });

  it('슬픔이 줄어들면 down 트렌드를 반환해야 함', () => {
    // 최근 3일: joy 2개, sadness 0개 (recentTotal=2)
    // 이전 3일: sadness 3개, joy 0개 (prevTotal=3)
    // sadness 변화: 0/2 - 3/3 = -1.0 (절댓값이 가장 큰 변화)
    // joy 변화: 2/2 - 0/3 = +1.0
    // 증가 우선이므로 joy가 먼저 선택되지만, sadness의 절대변화도 1.0
    // 테스트를 위해 sadness의 변화가 확실히 더 크게 설정
    // 최근: joy 1개 (total=1), 이전: sadness 3개 (total=3)
    // sadness: 0/1 - 3/3 = -1.0, joy: 1/1 - 0/3 = +1.0
    // 증가 우선 로직에서 joy(up)이 선택됨
    // → sadness만 유일하게 큰 변화인 케이스로 변경
    const entries = [
      // 최근 3일: 혼합 (joy + anger)
      createEntry('joy', 0),
      createEntry('anger', 1),
      // 이전 3일: sadness 2개 + joy 1개
      createEntry('sadness', 3),
      createEntry('sadness', 4),
      createEntry('joy', 5),
    ];

    const result = detectPatternChange(entries);

    expect(result).not.toBeNull();
    expect(result!.trend).toBe('down');
    expect(result!.emotion).toBe('sadness');
    expect(result!.message).toContain('우울');
    expect(result!.message).toContain('줄었어');
  });

  it('특정 감정이 늘어나면 up 트렌드를 반환해야 함', () => {
    // 최근 3일: gratitude 3개 + joy 1개, 이전 3일: joy 3개 + gratitude 1개
    // gratitude 변화: (3/4) - (1/4) = +0.5 (가장 큰 변화)
    const entries = [
      // 최근 3일: gratitude 위주
      createEntry('gratitude', 0),
      createEntry('gratitude', 1),
      createEntry('gratitude', 2),
      createEntry('joy', 1),
      // 이전 3일: joy 위주
      createEntry('joy', 3),
      createEntry('joy', 4),
      createEntry('joy', 5),
      createEntry('gratitude', 4),
    ];

    const result = detectPatternChange(entries);

    expect(result).not.toBeNull();
    expect(result!.trend).toBe('up');
    expect(result!.emotion).toBe('gratitude');
    expect(result!.message).toContain('늘었어');
  });

  it('반환값에 message가 포함되어야 함', () => {
    const entries = [
      createEntry('love', 0),
      createEntry('love', 1),
      createEntry('love', 2),
      createEntry('anger', 3),
      createEntry('anger', 4),
      createEntry('anger', 5),
    ];

    const result = detectPatternChange(entries);

    if (result) {
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    }
  });
});

describe('calculateStreak', () => {
  it('빈 배열이면 0을 반환해야 함', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('오늘 일기가 없으면 0을 반환해야 함', () => {
    const entries = [
      createEntry('joy', 1),
      createEntry('joy', 2),
    ];

    // 오늘(0일 전) 엔트리가 없으므로 스트릭은 0
    expect(calculateStreak(entries)).toBe(0);
  });

  it('연속 일수를 정확히 계산해야 함', () => {
    const entries = [
      createEntry('joy', 0),  // 오늘
      createEntry('joy', 1),  // 어제
      createEntry('joy', 2),  // 그제
    ];

    expect(calculateStreak(entries)).toBe(3);
  });

  it('중간에 끊기면 오늘부터 연속된 일수만 계산해야 함', () => {
    const entries = [
      createEntry('joy', 0),  // 오늘
      createEntry('joy', 1),  // 어제
      // 2일 전 누락
      createEntry('joy', 3),  // 3일 전 (끊김)
      createEntry('joy', 4),
    ];

    expect(calculateStreak(entries)).toBe(2);
  });

  it('하루에 여러 엔트리가 있어도 1일로 계산해야 함', () => {
    const entries = [
      createEntry('joy', 0),
      createEntry('sadness', 0),
      createEntry('anger', 0),
    ];

    expect(calculateStreak(entries)).toBe(1);
  });

  it('오늘만 일기를 쓴 경우 1을 반환해야 함', () => {
    const entries = [
      createEntry('joy', 0),
    ];

    expect(calculateStreak(entries)).toBe(1);
  });

  it('긴 연속 일수를 정확히 계산해야 함', () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      createEntry('joy', i),
    );

    expect(calculateStreak(entries)).toBe(7);
  });
});
