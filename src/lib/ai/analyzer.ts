/**
 * 감정 분석기 - 클라이언트 사이드 API 호출
 * M1-T3: analyzeEmotion
 */
import type { EmotionResult } from '@/types/emotion';
import { analysisResponseSchema } from '@/lib/ai/schemas';

// @MX:NOTE: 전체 작업 타임아웃 (재시도 포함 25초)
const API_TIMEOUT_MS = 25_000;

// @MX:NOTE: 503 재시도 대기 시간
const RETRY_DELAY_MS = 3_000;

// @MX:WARN: 503(_RATE LIMIT) 시 1회 재시도 - Zhipu API 연속 호출 시 429 발생
// @MX:REASON: 첫 호출 성공 후 즉시 두 번째 호출하면 API rate limit에 걸림
export async function analyzeEmotion(text: string): Promise<EmotionResult> {
  const controller = new AbortController();
  const totalTimeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      // 503(API 과부하) 시 1회 재시도
      if (response.status === 503 && attempt === 0) {
        continue;
      }

      if (!response.ok) {
        throw new Error(`감정 분석 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = analysisResponseSchema.safeParse(data);

      if (!parsed.success) {
        throw new Error('감정 분석 응답 데이터가 유효하지 않습니다');
      }

      return {
        emotion: parsed.data.emotion,
        confidence: parsed.data.confidence,
      };
    }

    // 두 번 모두 503이면 에러
    throw new Error('AI 서비스가 혼잡합니다. 잠시 후 다시 시도해주세요.');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('감정 분석 요청 시간이 초과되었습니다');
    }
    throw error;
  } finally {
    clearTimeout(totalTimeout);
  }
}
