/**
 * 감정 분석기 - 클라이언트 사이드 API 호출
 * M1-T3: analyzeEmotion
 */
import type { EmotionResult } from '@/types/emotion';
import { analysisResponseSchema } from '@/lib/ai/schemas';

// @MX:NOTE: API 호출 타임아웃 (25초, 모델 폴백 체인 대응)
const API_TIMEOUT_MS = 25_000;

// @MX:WARN: AbortController 타임아웃 사용 - 메모리 누수 방지를 위해 반드시 abort 필요
// @MX:REASON: 타임아웃 없는 fetch는 무한 대기 가능, AbortController로 자원 해제 보장
export async function analyzeEmotion(text: string): Promise<EmotionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

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
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('감정 분석 요청 시간이 초과되었습니다');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
