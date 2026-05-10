/**
 * Zod 스키마 유효성 검사 테스트
 * M1-T2: emotionSchema, analysisResponseSchema
 */
import { emotionSchema, analysisResponseSchema } from '@/lib/ai/schemas';
import type { EmotionType } from '@/types/emotion';

describe('emotionSchema', () => {
  it('유효한 감정 타입을 허용한다', () => {
    const validEmotions: EmotionType[] = ['joy', 'sadness', 'anger', 'fear', 'disgust'];

    validEmotions.forEach((emotion) => {
      const result = emotionSchema.safeParse(emotion);
      expect(result.success).toBe(true);
    });
  });

  it('유효하지 않은 감정 타입을 거부한다', () => {
    const invalidEmotions = ['happy', 'SURPRISE', '', 'anxiety', 123, null, undefined];

    invalidEmotions.forEach((emotion) => {
      const result = emotionSchema.safeParse(emotion);
      expect(result.success).toBe(false);
    });
  });

  it('빈 문자열을 거부한다', () => {
    const result = emotionSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('analysisResponseSchema', () => {
  it('유효한 응답을 허용한다', () => {
    const validResponse = {
      emotion: 'joy',
      confidence: 0.95,
      emotionKo: '기쁨',
    };

    const result = analysisResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validResponse);
    }
  });

  it('모든 감정 타입의 유효한 응답을 허용한다', () => {
    const emotions = [
      { emotion: 'joy', confidence: 0.8, emotionKo: '기쁨' },
      { emotion: 'sadness', confidence: 0.7, emotionKo: '슬픔' },
      { emotion: 'anger', confidence: 0.9, emotionKo: '분노' },
      { emotion: 'fear', confidence: 0.6, emotionKo: '공포' },
      { emotion: 'disgust', confidence: 0.5, emotionKo: '혐오' },
    ];

    emotions.forEach((response) => {
      const result = analysisResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });

  it('confidence가 0 미만이면 거부한다', () => {
    const invalidResponse = {
      emotion: 'joy',
      confidence: -0.1,
      emotionKo: '기쁨',
    };

    const result = analysisResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('confidence가 1 초과이면 거부한다', () => {
    const invalidResponse = {
      emotion: 'joy',
      confidence: 1.1,
      emotionKo: '기쁨',
    };

    const result = analysisResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('confidence 0과 1은 허용한다', () => {
    const boundaryLow = { emotion: 'sadness', confidence: 0, emotionKo: '슬픔' };
    const boundaryHigh = { emotion: 'anger', confidence: 1, emotionKo: '분노' };

    expect(analysisResponseSchema.safeParse(boundaryLow).success).toBe(true);
    expect(analysisResponseSchema.safeParse(boundaryHigh).success).toBe(true);
  });

  it('필드가 누락되면 거부한다', () => {
    const missingEmotion = { confidence: 0.8, emotionKo: '기쁨' };
    const missingConfidence = { emotion: 'joy', emotionKo: '기쁨' };
    const missingEmotionKo = { emotion: 'joy', confidence: 0.8 };

    expect(analysisResponseSchema.safeParse(missingEmotion).success).toBe(false);
    expect(analysisResponseSchema.safeParse(missingConfidence).success).toBe(false);
    expect(analysisResponseSchema.safeParse(missingEmotionKo).success).toBe(false);
  });

  it('빈 emotionKo를 거부한다', () => {
    const invalidResponse = {
      emotion: 'joy',
      confidence: 0.8,
      emotionKo: '',
    };

    const result = analysisResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('유효하지 않은 emotion 값을 가진 응답을 거부한다', () => {
    const invalidResponse = {
      emotion: 'happy',
      confidence: 0.8,
      emotionKo: '행복',
    };

    const result = analysisResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});
