/**
 * emotionKeywords.test.ts
 *
 * TDD RED phase: 오늘의 감정 키워드 추출 테스트
 * 모든 테스트는 실패 상태로 시작 (구현 전)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { emotionKeywords, EmotionKeyword } from '@/lib/rewards/emotionKeywords';

// 텍스트 분석 mock
const mockText = "오늘은 정말 행복해요. 친구랑 카페 가서 즐거웠어요. 사무실에서는 별로 예민한데 친구 덕분에 힘입나요.";

describe('emotionKeywords (TDD RED)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractKeywords', () => {
    it('텍스트에서 핵심 키워드 5개를 추출해야 함', () => {
      const keywords = emotionKeywords.extractKeywords(mockText);

      expect(keywords).toBeDefined();
      expect(keywords).toHaveLength(5);
    });

    it('각 키워드는 텍스트와 빈도수를 포함해야 함', () => {
      const keywords = emotionKeywords.extractKeywords(mockText) as EmotionKeyword[];

      keywords.forEach((keyword) => {
        expect(keyword.word).toBeDefined();
        expect(keyword.word.length).toBeGreaterThan(0);
        expect(keyword.frequency).toBeGreaterThan(0);
        expect(typeof keyword.word).toBe('string');
        expect(typeof keyword.frequency).toBe('number');
      });
    });

    it('빈도수 높은 순으로 정렬되어야 함', () => {
      const keywords = emotionKeywords.extractKeywords(mockText) as EmotionKeyword[];

      for (let i = 0; i < keywords.length - 1; i++) {
        expect(keywords[i].frequency).toBeGreaterThanOrEqual(keywords[i + 1].frequency);
      }
    });
  });

  describe('형용소 분석', () => {
    it('명사와 형용사만 추출해야 함', () => {
      const keywords = emotionKeywords.extractKeywords(mockText);

      // 실제 구현에서는 mecab-ko로 형용소 분석
      keywords.forEach((keyword) => {
        // 명사/형용사인지 확인 (품사/조사 제외)
        expect(keyword.word).toMatch(/^[가-힣]+$/); // 한글만
      });
    });

    it('불용어(stopwords)는 제외해야 함', () => {
      const textWithStopwords = "오늘 기분이 좋아요 아주 좋아요 정말 좋아요";
      const keywords = emotionKeywords.extractKeywords(textWithStopwords);

      // "좋아요" 같은 불용어 제거
      const goodWords = keywords.filter((k) => k.word.includes('좋'));
      expect(goodWords).toHaveLength(0);
    });
  });

  describe('감정 연관어 추천', () => {
    it('감정과 연관된 키워드를 추천해야 함', () => {
      const keywords = emotionKeywords.extractKeywords("맛있는 점심 식당 켠쳐봐어요");

      expect(keywords).toBeDefined();
      const hasFoodKeyword = keywords.some((k) =>
        k.word.includes('점심') || k.word.includes('식당')
      );
      expect(hasFoodKeyword).toBe(true);
    });

    it('관련 어휘 사전을 제공해야 함', () => {
      const relatedTerms = emotionKeywords.getRelatedTerms('joy');

      expect(relatedTerms).toBeDefined();
      expect(Array.isArray(relatedTerms)).toBe(true);
      expect(relatedTerms.length).toBeGreaterThan(0);
    });
  });

  describe('텍스트 전처리', () => {
    it('특수 문자와 공백을 제거해야 함', () => {
      const dirtyText = "오늘  기분이!!!  좋아요??  ^^";
      const cleaned = emotionKeywords.preprocessText(dirtyText);

      expect(cleaned).not.toContain('!');
      expect(cleaned).not.toContain('?');
      expect(cleaned).not.toContain('^');
    });

    it('이모지콘이 포함된 텍스트를 처리해야 함', () => {
      const textWithEmoji = "오늘 감정 😊 정말 행복해요 ❤️";
      const cleaned = emotionKeywords.preprocessText(textWithEmoji);

      expect(cleaned).not.toContain('😊');
      expect(cleaned).not.toContain('❤️');
    });
  });

  describe('빈도 계산', () => {
    it('단일 단위로 빈도를 계산해야 함', () => {
      const text = "행복 행복 정말 행복해요. 기분이 좋아요.";
      const keywords = emotionKeywords.extractKeywords(text);

      const happyCount = keywords.find((k) => k.word === '행복');
      expect(happyCount?.frequency).toBe(3);
    });

    it('동일 단어의 빈도는 합산으로 계산해야 함', () => {
      const text = "기분이 좋아요 기분이 좋아요";
      const keywords = emotionKeywords.extractKeywords(text);

      const goodCount = keywords.find((k) => k.word === '기분');
      expect(goodCount?.frequency).toBe(2);
    });
  });

  describe('감정별 키워드 가중치', () => {
    it('감정별로 키워드 가중치가 다를 수 있어야 함', () => {
      const joyWeights = emotionKeywords.getEmotionWeights('joy');
      const sadnessWeights = emotionKeywords.getEmotionWeights('sadness');

      expect(joyWeights).toBeDefined();
      expect(sadnessWeights).toBeDefined();

      // joy와 sadness는 다른 가중치를 가져야 함
      expect(joyWeights).not.toEqual(sadnessWeights);
    });

    it('가중치를 적용하여 키워드 순위를 매겨야 함', () => {
      const text = "행복 기분 좋아요";
      const keywords = emotionKeywords.extractKeywords(text);

      // 가중치가 적용된 순위 (행복 > 기분)
      expect(keywords[0].word).toBe('행복');
    });
  });

  describe('빈도수 임계값 설정', () => {
    it('최소 빈도수 1 이상인 키워드만 추출해야 함', () => {
      const text = "좋아요";
      const keywords = emotionKeywords.extractKeywords(text);

      keywords.forEach((keyword) => {
        expect(keyword.frequency).toBeGreaterThanOrEqual(1);
      });
    });

    it('최대 5개 키워드로 제한해야 함', () => {
      const longText = "행복 기분 좋아요 즐겁워요 사무 친구 카페";
      const keywords = emotionKeywords.extractKeywords(longText);

      expect(keywords.length).toBeLessThanOrEqual(5);
    });
  });

  describe('에러 처리', () => {
    it('빈 텍스트 입력 시 빈 배열을 반환해야 함', () => {
      const keywords = emotionKeywords.extractKeywords('');

      expect(keywords).toEqual([]);
    });

    it('null 입력 시 에러를 방지해야 함', () => {
      const keywords = emotionKeywords.extractKeywords(null as any);

      expect(keywords).toBeDefined();
      expect(keywords).toEqual([]);
    });
  });

  describe('감정 키워드 매핑', () => {
    it('9개 감정별 키워드 사전을 제공해야 함', () => {
      const emotions = ['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'love', 'gratitude', 'hope'];

      emotions.forEach((emotion) => {
        const keywords = emotionKeywords.getEmotionKeywords(emotion);
        expect(keywords).toBeDefined();
      });
    });

    it('감정별 사전은 키워드와 가중치를 포함해야 함', () => {
      const joyKeywords = emotionKeywords.getEmotionKeywords('joy');

      if (joyKeywords.length > 0) {
        expect(joyKeywords[0].keyword).toBeDefined();
        expect(joyKeywords[0].weight).toBeDefined();
      }
    });
  });
});
