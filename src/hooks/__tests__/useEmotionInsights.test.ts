/**
 * useEmotionInsights 훅 테스트
 * - 감정 인사이트 생성 로직
 * - 빈 데이터 처리
 * - 최다 빈도 감정 찾기
 * - 인사이트 메시지 생성
 * @MX:SPEC: SPEC-UI-001
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';

// @MX:NOTE: diaryStore 모킹 - 훅이 diaryStore에서 entries를 가져오므로
let mockEntries: Array<{
  id: string;
  text: string;
  emotion: string;
  confidence: number;
  emotionKo: string;
  createdAt: string;
  isShared: boolean;
}> = [];

jest.mock('@/stores/diaryStore', () => ({
  diaryStore: jest.fn((selector: (state: { entries: unknown[] }) => unknown) =>
    selector({ entries: mockEntries }),
  ),
}));

// EMOTION_THEME 모킹: 훅이 기본 감정의 message/advice를 참조하므로
const MOCK_EMOTION_THEME: Record<string, { message: string; advice: string[] }> = {
  joy: {
    message: '마음이 평온한 상태예요',
    advice: [
      '지금 이 순간을 음미하며 좋아하는 음악을 들어보세요',
      '평온한 마음으로 좋아하는 책을 읽어보세요',
    ],
  },
  sadness: {
    message: '마음에 먹구름이 끼어있어요',
    advice: ['슬픈 감정을 자연스럽게 받아들여보세요'],
  },
  anger: {
    message: '마음에 뜨거운 감정이 올라왔어요',
    advice: ['깊은 숨을 쉬며 마음을 진정시켜보세요'],
  },
  fear: {
    message: '마음에 불안이 감도는 느낌이에요',
    advice: ['불안의 원인을 천천히 적어보세요'],
  },
  gratitude: {
    message: '마음에 감사한 마음이 피어났어요',
    advice: ['오늘 감사한 일 세 가지를 적어보세요'],
  },
  hope: {
    message: '마음에 밝은 희망이 빛나고 있어요',
    advice: ['작은 목표 하나를 정해 도전해보세요'],
  },
  love: {
    message: '마음에 따뜻한 사랑이 가득해요',
    advice: ['소중한 사람에게 마음을 전해보세요'],
  },
  disgust: {
    message: '마음에 거슬리는 느낌이 있어요',
    advice: ['잠시 자리에서 일어나 기지개를 켜보세요'],
  },
  surprise: {
    message: '마음에 깜짝 놀랄 일이 생겼어요',
    advice: ['천천히 한 번 심호흡하고 상황을 정리해보세요'],
  },
};

jest.mock('@/lib/constants/emotion', () => ({
  EMOTION_THEME: MOCK_EMOTION_THEME,
}));

// @MX:NOTE: 엔트리 생성 헬퍼
function createEntry(emotion: string, daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  return {
    id: `test-${Math.random().toString(36).slice(2, 8)}`,
    text: '테스트 일기',
    emotion,
    confidence: 0.9,
    emotionKo: '테스트',
    createdAt: date.toISOString(),
    isShared: false,
  };
}

describe('useEmotionInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntries = [];
  });

  // ------------------------------------------------------------------ //
  // 1. 감정 인사이트 생성 로직
  // ------------------------------------------------------------------ //
  describe('감정 인사이트 생성 로직', () => {
    it('훅 호출 시 항상 인사이트 객체를 반환해야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current).toBeDefined();
      expect(result.current.currentInsight).toBeDefined();
      expect(result.current.topEmotions).toBeDefined();
      expect(result.current.patternChange).toBeDefined();
      expect(result.current.streak).toBeDefined();
    });

    it('반환값은 topEmotions, patternChange, streak, currentInsight 키를 포함해야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current).toHaveProperty('topEmotions');
      expect(result.current).toHaveProperty('patternChange');
      expect(result.current).toHaveProperty('streak');
      expect(result.current).toHaveProperty('currentInsight');
    });

    it('currentInsight은 summary와 advice 문자열을 포함해야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current.currentInsight).toHaveProperty('summary');
      expect(result.current.currentInsight).toHaveProperty('advice');
      expect(typeof result.current.currentInsight.summary).toBe('string');
      expect(typeof result.current.currentInsight.advice).toBe('string');
    });
  });

  // ------------------------------------------------------------------ //
  // 2. 빈 데이터 처리
  // ------------------------------------------------------------------ //
  describe('빈 데이터 처리', () => {
    it('데이터가 없을 때 topEmotions은 빈 배열이어야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current.topEmotions).toEqual([]);
    });

    it('데이터가 없을 때 patternChange는 null이어야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current.patternChange).toBeNull();
    });

    it('데이터가 없을 때 streak은 0이어야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current.streak).toBe(0);
    });

    it('데이터가 없을 때도 기본 인사이트는 제공되어야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      // 데이터가 없어도 기본 감정(joy)의 인사이트를 반환
      expect(result.current.currentInsight.summary).toBeTruthy();
      expect(result.current.currentInsight.advice).toBeTruthy();
    });
  });

  // ------------------------------------------------------------------ //
  // 3. 데이터 있을 때 개인화 인사이트
  // ------------------------------------------------------------------ //
  describe('데이터 있을 때 개인화 인사이트', () => {
    it('상위 감정을 반환해야 합니다', async () => {
      mockEntries = [
        createEntry('joy', 1),
        createEntry('joy', 2),
        createEntry('sadness', 1),
      ];

      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current.topEmotions.length).toBeGreaterThan(0);
      expect(result.current.topEmotions[0].emotion).toBe('joy');
      expect(result.current.topEmotions[0].percentage).toBeGreaterThan(0);
    });

    it('가장 많이 느낀 감정 기반 인사이트를 반환해야 합니다', async () => {
      mockEntries = [
        createEntry('sadness', 1),
        createEntry('sadness', 2),
        createEntry('sadness', 3),
      ];

      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current.currentInsight.summary).toBe(
        MOCK_EMOTION_THEME.sadness.message,
      );
    });

    it('연속 작성 일수를 반환해야 합니다', async () => {
      mockEntries = [
        createEntry('joy', 0), // 오늘
        createEntry('joy', 1), // 어제
      ];

      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(result.current.streak).toBe(2);
    });
  });

  // ------------------------------------------------------------------ //
  // 4. 반환값 타입 일관성
  // ------------------------------------------------------------------ //
  describe('반환값 타입 일관성', () => {
    it('topEmotions은 항상 배열이어야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(Array.isArray(result.current.topEmotions)).toBe(true);
    });

    it('streak은 항상 숫자여야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(typeof result.current.streak).toBe('number');
      expect(result.current.streak).toBeGreaterThanOrEqual(0);
    });

    it('patternChange은 null 또는 객체여야 합니다', async () => {
      const { useEmotionInsights } = await import('../useEmotionInsights');
      const { result } = renderHook(() => useEmotionInsights());

      expect(
        result.current.patternChange === null ||
          typeof result.current.patternChange === 'object',
      ).toBe(true);
    });
  });
});
