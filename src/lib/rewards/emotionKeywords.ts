/**
 * emotionKeywords.ts
 *
 * TDD GREEN phase: 오늘의 감정 키워드 추출
 * 텍스트 형용소 분석 기반 키워드 추출 (간소화 버전)
 */

// 키워드 데이터
export interface EmotionKeyword {
  word: string;
  frequency: number;
  related?: boolean;
}

// 감정별 가중치
export interface EmotionWeight {
  [keyword: string]: number;
}

/**
 * emotionKeywords - 오늘의 감정 키워드 추출
 *
 * @MX:NOTE mecab-ko 형용소 분석 대신 간소화 버전 사용 (GREEN phase)
 * @MX:TODO 차기 mecab-ko 통합으로 정밀도 향상
 */
export const emotionKeywords = {
  /**
   * 텍스트에서 핵심 키워드 추출
   * @param text - 분석할 텍스트
   * @param emotion - 감정 타입 (가중치 적용용)
   * @returns 키워드 목록 (최대 5개)
   */
  extractKeywords: (text: string): EmotionKeyword[] => {
    // 빈 텍스트 처리
    if (!text || text.trim().length === 0) {
      return [];
    }

    // null 방지
    if (text == null) {
      return [];
    }

    // 텍스트 전처리
    const cleaned = emotionKeywords.preprocessText(text);

    // 간단한 단어 추출 (공백 기반, GREEN phase)
    const words = cleaned.split(/\s+/).filter((w) => w.length > 1);

    // 한국어 조사 (불용어 처리)
    const josa = new Set([
      '이', '은', '는', '을', '를', '의', '가', '에',
      '으로', '로', '만', '도', '까지', '부터', '하고',
      '이나', '이랑', '랑', '처럼', '같이',
    ]);

    // 한국어 접미사 (불용어 처리)
    const suffixes = new Set([
      '해요', '습니다', '거예요', '인데', '이라고', '입니다',
      '예요', '네요', '군요', ' 뭐',
    ]);

    // 불용어 리스트 (간소화)
    const stopwords = new Set([
      '좋아요', '정말', '아주', '매우', '너무', '그냥',
      '조금', '약간', '별로', '아니', '없다', '있다',
    ]);

    // 빈도 계산
    const frequency: Record<string, number> = {};
    words.forEach((word) => {
      let cleanWord = word.trim();

      // 접미사 제거 (후방 일치) - 먼저 처리
      suffixes.forEach((suffix) => {
        if (cleanWord.endsWith(suffix) && cleanWord.length > suffix.length + 1) {
          cleanWord = cleanWord.slice(0, -suffix.length);
        }
      });

      // 조사 제거 (후방 일치)
      josa.forEach((josaItem) => {
        if (cleanWord.endsWith(josaItem) && cleanWord.length > josaItem.length + 1) {
          cleanWord = cleanWord.slice(0, -josaItem.length);
        }
      });

      // 불용어 체크
      if (cleanWord.length > 1 && !stopwords.has(cleanWord)) {
        frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
      }
    });

    // 빈도수 높은 순 정렬, 최대 5개
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, freq]) => ({
        word,
        frequency: freq,
      }));

    return sorted;
  },

  /**
   * 텍스트 전처리
   * @param text - 원본 텍스트
   * @returns 전처리된 텍스트
   */
  preprocessText: (text: string): string => {
    if (!text) return '';

    let cleaned = text;

    // 특수 문자 제거
    cleaned = cleaned.replace(/[!?^@#$%^&*()_+=\[\]{};:'"\\|<>,./~`]/g, '');

    // 이모지 제거
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

    // 연속 공백 단일화
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  },

  /**
   * 감정별 연관 어휘 사전
   * @param emotion - 감정 타입
   * @returns 연관 어휘 목록
   */
  getRelatedTerms: (emotion: string): string[] => {
    const relatedTerms: Record<string, string[]> = {
      joy: ['행복', '즐거움', '기쁨', '웃음', '즐겁다'],
      sadness: ['슬픔', '우울', '그리움', '눈물', '씁쓸'],
      anger: ['화남', '분노', '짜증', '화나다', '미치다'],
      fear: ['두려움', '불안', '걱정', '공포', '떨리다'],
      disgust: ['혐오', '싫다', '역겨움', '불쾌', '역겨'],
      surprise: ['놀람', '놀라다', '깜짝', '의외', '헉'],
      love: ['사랑', '좋아', '애정', '사랑하다', '좋아하다'],
      gratitude: ['감사', '고맙다', '감격', '고마워', '덕분'],
      hope: ['희망', '기대', '바라다', ' Wunsch', '희망차다'],
    };

    return relatedTerms[emotion] || [];
  },

  /**
   * 감정별 키워드 가중치
   * @param emotion - 감정 타입
   * @returns 가중치 맵
   */
  getEmotionWeights: (emotion: string): EmotionWeight => {
    const weights: Record<string, EmotionWeight> = {
      joy: { '행복': 1.0, '즐거움': 0.9, '기쁨': 0.8 },
      sadness: { '슬픔': 1.0, '우울': 0.9, '그리움': 0.8 },
      anger: { '화남': 1.0, '분노': 0.9, '짜증': 0.8 },
      fear: { '두려움': 1.0, '불안': 0.9, '걱정': 0.8 },
      disgust: { '혐오': 1.0, '싫다': 0.9, '역겨움': 0.8 },
      surprise: { '놀람': 1.0, '놀라다': 0.9 },
      love: { '사랑': 1.0, '좋아': 0.9, '애정': 0.8 },
      gratitude: { '감사': 1.0, '고맙다': 0.9 },
      hope: { '희망': 1.0, '기대': 0.9 },
    };

    return weights[emotion] || {};
  },

  /**
   * 감정별 키워드 사전
   * @param emotion - 감정 타입
   * @returns 키워드와 가중치 목록
   */
  getEmotionKeywords: (emotion: string): Array<{ keyword: string; weight: number }> => {
    const keywords: Record<string, Array<{ keyword: string; weight: number }>> = {
      joy: [
        { keyword: '행복', weight: 1.0 },
        { keyword: '즐거움', weight: 0.9 },
        { keyword: '기쁨', weight: 0.8 },
        { keyword: '웃음', weight: 0.7 },
        { keyword: '즐겁다', weight: 0.6 },
      ],
      sadness: [
        { keyword: '슬픔', weight: 1.0 },
        { keyword: '우울', weight: 0.9 },
        { keyword: '그리움', weight: 0.8 },
        { keyword: '눈물', weight: 0.7 },
        { keyword: '씁쓸', weight: 0.6 },
      ],
      anger: [
        { keyword: '화남', weight: 1.0 },
        { keyword: '분노', weight: 0.9 },
        { keyword: '짜증', weight: 0.8 },
        { keyword: '화나다', weight: 0.7 },
        { keyword: '미치다', weight: 0.6 },
      ],
      fear: [
        { keyword: '두려움', weight: 1.0 },
        { keyword: '불안', weight: 0.9 },
        { keyword: '걱정', weight: 0.8 },
        { keyword: '공포', weight: 0.7 },
        { keyword: '떨리다', weight: 0.6 },
      ],
      disgust: [
        { keyword: '혐오', weight: 1.0 },
        { keyword: '싫다', weight: 0.9 },
        { keyword: '역겨움', weight: 0.8 },
        { keyword: '불쾌', weight: 0.7 },
        { keyword: '역겨', weight: 0.6 },
      ],
      surprise: [
        { keyword: '놀람', weight: 1.0 },
        { keyword: '놀라다', weight: 0.9 },
        { keyword: '깜짝', weight: 0.8 },
        { keyword: '의외', weight: 0.7 },
      ],
      love: [
        { keyword: '사랑', weight: 1.0 },
        { keyword: '좋아', weight: 0.9 },
        { keyword: '애정', weight: 0.8 },
        { keyword: '사랑하다', weight: 0.7 },
        { keyword: '좋아하다', weight: 0.6 },
      ],
      gratitude: [
        { keyword: '감사', weight: 1.0 },
        { keyword: '고맙다', weight: 0.9 },
        { keyword: '감격', weight: 0.8 },
        { keyword: '고마워', weight: 0.7 },
        { keyword: '덕분', weight: 0.6 },
      ],
      hope: [
        { keyword: '희망', weight: 1.0 },
        { keyword: '기대', weight: 0.9 },
        { keyword: '바라다', weight: 0.8 },
        { keyword: 'Wunsch', weight: 0.7 },
        { keyword: '희망차다', weight: 0.6 },
      ],
    };

    return keywords[emotion] || [];
  },
};
