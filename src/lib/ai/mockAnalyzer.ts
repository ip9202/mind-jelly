/**
 * Mock 감정 분석기 - API 키 없이 동작하는 키워드 기반 분석
 * 한국어 키워드 매칭으로 감정을 추정한다
 */

import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 감정별 한국어 키워드 매핑
const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  joy: ['기쁘', '행복', '좋', '즐겁', '신나', '웃', '사랑', '해피', '감사', '축하', '기분좋', '재밌', '행복하'],
  sadness: ['슬프', '우울', '외롭', '눈물', '그립', '아프', '힘들', '외로', '서운', '속상', '비'],
  anger: ['화나', '짜증', '분노', '열받', '억울', '어이없', '귀찮', '화가', '미워', '싫어'],
  fear: ['무섭', '두렵', '불안', '걱정', '긴장', '떨려', '겁', '혹시', '몰라', '두려'],
  disgust: ['싫', '역겹', '불쾌', '오글', '찌질', '징그럽', '더러', '지저분'],
};

/**
 * 텍스트에서 키워드 기반으로 감정을 추정한다
 */
export function mockAnalyze(text: string): { emotion: EmotionType; confidence: number } {
  const lower = text.toLowerCase();

  let bestEmotion: EmotionType = 'joy';
  let bestScore = 0;

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS) as [EmotionType, string[]][]) {
    const score = keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestEmotion = emotion;
    }
  }

  // 키워드 매칭이 없으면 기쁨 + 낮은 신뢰도
  const confidence = bestScore > 0
    ? Math.min(0.95, 0.5 + bestScore * 0.15)
    : 0.35;

  return { emotion: bestEmotion, confidence };
}
