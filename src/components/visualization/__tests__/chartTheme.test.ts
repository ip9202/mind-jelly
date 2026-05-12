/**
 * 차트 테마 매핑 테스트
 * T1: Recharts 인프라 - EMOTION_COLORS → Recharts 테마 변환
 * TDD Phase: RED
 */

import { describe, it, expect } from '@jest/globals';
import { EMOTION_COLORS } from '@/lib/constants/emotion';
import { chartTheme, getChartColor, EMOTION_CHART_ORDER } from '../chartTheme';

describe('chartTheme', () => {
  describe('chartTheme 상수', () => {
    it('EMOTION_COLORS의 모든 감정 키를 포함해야 합니다', () => {
      const emotionKeys = Object.keys(EMOTION_COLORS);
      const themeKeys = Object.keys(chartTheme);

      emotionKeys.forEach((key) => {
        expect(themeKeys).toContain(key);
      });
    });

    it('각 감정 키의 색상 값이 EMOTION_COLORS와 동일해야 합니다', () => {
      Object.entries(EMOTION_COLORS).forEach(([key, color]) => {
        expect(chartTheme[key]).toBe(color);
      });
    });

    it('9개의 감정 키가 모두 존재해야 합니다', () => {
      expect(Object.keys(chartTheme)).toHaveLength(9);
    });

    it('모든 색상 값이 유효한 hex 형식이어야 합니다', () => {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      Object.values(chartTheme).forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe('getChartColor 함수', () => {
    it('감정 키에 해당하는 색상을 반환해야 합니다', () => {
      expect(getChartColor('joy')).toBe(EMOTION_COLORS.joy);
      expect(getChartColor('sadness')).toBe(EMOTION_COLORS.sadness);
      expect(getChartColor('anger')).toBe(EMOTION_COLORS.anger);
    });

    it('모든 9개 감정 타입에 대해 색상을 반환해야 합니다', () => {
      const emotions: Array<keyof typeof EMOTION_COLORS> = [
        'joy', 'sadness', 'anger', 'fear', 'disgust',
        'surprise', 'love', 'gratitude', 'hope',
      ];

      emotions.forEach((emotion) => {
        expect(getChartColor(emotion)).toBeDefined();
        expect(getChartColor(emotion)).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('알 수 없는 감정 키에는 기본 회색을 반환해야 합니다', () => {
      // @ts-expect-error - 의도적으로 잘못된 키 전달
      expect(getChartColor('unknown')).toBe('#999999');
    });
  });

  describe('EMOTION_CHART_ORDER 상수', () => {
    it('차트 표시 순서대로 9개 감정 키를 포함해야 합니다', () => {
      expect(EMOTION_CHART_ORDER).toHaveLength(9);
    });

    it('모든 감정 키가 EMOTION_COLORS에 존재해야 합니다', () => {
      EMOTION_CHART_ORDER.forEach((key) => {
        expect(EMOTION_COLORS).toHaveProperty(key);
      });
    });

    it('중복 키가 없어야 합니다', () => {
      const uniqueKeys = new Set(EMOTION_CHART_ORDER);
      expect(uniqueKeys.size).toBe(EMOTION_CHART_ORDER.length);
    });
  });
});
