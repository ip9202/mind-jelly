/**
 * 감정 분석기 응답 시간 테스트
 * SPEC-JELLY-002: glm-4-plus 기본, glm-4.5-flash 폴백
 */
import { describe, it, expect, beforeAll, skip } from '@jest/globals';
import { analyzeEmotion } from '@/lib/ai/analyzer';

const hasApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY &&
  !process.env.NEXT_PUBLIC_OPENAI_API_KEY.startsWith('sk-your');

const responseTimes: number[] = [];

beforeAll(() => {
  if (!hasApiKey) {
    console.warn('⚠️ API 키가 설정되지 않아 실제 호출 테스트를 건너뜁니다');
    console.warn('   NEXT_PUBLIC_OPENAI_API_KEY 환경 변수를 설정해주세요');
  }
});

describe('감정 분석 응답 시간', () => {
  (hasApiKey ? describe : describe.skip)('glm-4-plus 기본 모델', () => {
    it('짧은 텍스트 응답 시간 측정 (10자)', async () => {
      const text = '오늘 정말 기쁜 하루!';
      const startTime = performance.now();

      const result = await analyzeEmotion(text);

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      responseTimes.push(responseTime);

      console.log(`📊 glm-4-plus 응답 시간: ${responseTime.toFixed(0)}ms (${text.length}자)`);
      console.log(`   결과: ${result.emotion} (confidence: ${result.confidence})`);

      expect(responseTime).toBeLessThan(30000);
      expect(result).toHaveProperty('emotion');
      expect(result).toHaveProperty('confidence');
    });

    it('긴 텍스트 응답 시간 측정 (100자)', async () => {
      const text = '오늘 아침에 일어나서 햇살을 보니 기분이 정말 좋았어요. ' +
        '친구들을 만나서 재미있는 이야기를 나누고 맛있는 점심을 먹었어요. ' +
        '오후에는 공원에서 산책도 하고 좋은 음악을 들었어요.';
      const startTime = performance.now();

      const result = await analyzeEmotion(text);

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      responseTimes.push(responseTime);

      console.log(`📊 glm-4-plus 응답 시간: ${responseTime.toFixed(0)}ms (${text.length}자)`);
      console.log(`   결과: ${result.emotion} (confidence: ${result.confidence})`);

      expect(responseTime).toBeLessThan(30000);
      expect(result).toHaveProperty('emotion');
      expect(result).toHaveProperty('confidence');
    });
  });

  (hasApiKey ? describe : describe.skip)('평균 응답 시간 보고', () => {
    it('평균 응답 시간 출력', () => {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);

      console.log('\n📈 응답 시간 통계:');
      console.log(`   평균: ${avgTime.toFixed(0)}ms`);
      console.log(`   최소: ${minTime.toFixed(0)}ms`);
      console.log(`   최대: ${maxTime.toFixed(0)}ms`);
      console.log(`   샘플: ${responseTimes.length}건`);

      expect(avgTime).toBeLessThan(20000);
    });
  });

  (hasApiKey ? describe : describe.skip)('타임아웃 처리', () => {
    it('전체 타임아웃 (95초) 이내에 응답해야 함', async () => {
      const text = '오늘 기분이 어때?';
      const startTime = performance.now();

      const result = await analyzeEmotion(text);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      console.log(`📊 전체 응답 시간: ${responseTime.toFixed(0)}ms`);

      expect(responseTime).toBeLessThan(95000);
      expect(result).toHaveProperty('emotion');
    });
  });
});
