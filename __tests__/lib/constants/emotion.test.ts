/**
 * 감정/구슬 상수 테스트
 * REQ-EVT-005
 */

import { EMOTION_COLORS, BEAD_COLORS, JELLY_COLOR } from '@/lib/constants/emotion';

describe('EMOTION_COLORS', () => {
  it('기본 감정 색상을 정의해야 한다', () => {
    expect(EMOTION_COLORS.joy).toBeDefined();
    expect(EMOTION_COLORS.sadness).toBeDefined();
    expect(EMOTION_COLORS.anger).toBeDefined();
    expect(EMOTION_COLORS.fear).toBeDefined();
    expect(EMOTION_COLORS.disgust).toBeDefined();
  });

  it('모든 색상은 16진수 형식이어야 한다', () => {
    Object.values(EMOTION_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('BEAD_COLORS', () => {
  it('구슬 색상 배열을 정의해야 한다', () => {
    expect(Array.isArray(BEAD_COLORS)).toBe(true);
    expect(BEAD_COLORS.length).toBeGreaterThan(0);
  });

  it('모든 구슬 색상은 16진수 형식이어야 한다', () => {
    BEAD_COLORS.forEach((color) => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('JELLY_COLOR', () => {
  it('젤리 기본 색상은 #FFD1DC이어야 한다', () => {
    expect(JELLY_COLOR).toBe('#FFD1DC');
  });
});
