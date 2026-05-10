/**
 * 감정 분석기 - 클라이언트 사이드 Z.AI API 직접 호출
 * Static Export 마이그레이션: 서버 API 프록시 → 클라이언트 직접 호출
 */
import type { EmotionType } from '@/types/emotion';
import type { EmotionResult } from '@/types/emotion';
import { emotionSchema, analysisResponseSchema } from '@/lib/ai/schemas';
import { mockAnalyze } from '@/lib/ai/mockAnalyzer';

// @MX:NOTE: 전체 작업 타임아웃 (재시도 포함 95초)
const API_TIMEOUT_MS = 95_000;

// @MX:NOTE: 모델별 타임아웃 - glm-4-plus 기본 (안정적), glm-4.5-flash 폴백 (빠름)
const PRIMARY_TIMEOUT_MS = 60_000;
const FALLBACK_TIMEOUT_MS = 30_000;

// @MX:NOTE: 503 재시도 대기 시간
const RETRY_DELAY_MS = 3_000;

// @MX:NOTE: 텍스트 길이 제한
const MAX_TEXT_LENGTH = 500;

// @MX:NOTE: 한국어 감정명 매핑
const EMOTION_KO: Record<EmotionType, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '분노',
  fear: '공포',
  disgust: '혐오',
  surprise: '놀람',
  love: '사랑',
  gratitude: '감사',
  hope: '희망',
};

// @MX:NOTE: 시스템 프롬프트 - 반드시 5가지 감정 중 하나만 반환
const SYSTEM_PROMPT =
  'Analyze the emotion of the Korean text. Return ONLY this JSON, no other text: {"emotion":"joy","confidence":0.9}. Emotion MUST be exactly one of: joy, sadness, anger, fear, disgust, surprise, love, gratitude, hope. Never use "neutral" or any other value. If unsure, pick the closest match.';

// @MX:WARN: API 키가 클라이언트 번들에 노출됨 - NEXT_PUBLIC_ 접두사 필요
// @MX:REASON: Static Export 환경에서 서버 사이드 env 접근 불가, 빌드타임 인라인
function getApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY;
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
}

/**
 * Z.AI API로 모델 호출 (모델명 지정)
 */
async function callModel(
  text: string,
  model: string,
  apiKey: string,
  baseUrl: string,
  signal: AbortSignal,
): Promise<{ ok: boolean; status: number; data?: { choices: Array<{ message: { content: string } }> } }> {
  const apiUrl = `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    return { ok: true, status: response.status, data };
  } catch (e) {
    console.warn(`${model} 타임아웃:`, e instanceof Error ? e.message : e);
    return { ok: false, status: 408 };
  }
}

// @MX:WARN: 503 시 1회 재시도 + 모델 폴백 체인 (glm-4.5-flash → glm-4-plus)
// @MX:REASON: Z.AI API rate limit 대응 + 1차 모델 타임아웃 시 2차 모델 폴백
export async function analyzeEmotion(text: string): Promise<EmotionResult> {
  // 입력 검증
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('텍스트를 입력해주세요');
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`${MAX_TEXT_LENGTH}자 이하로 입력해주세요`);
  }

  // API 키 확인 (없거나 플레이스홀더면 mock 분석 사용)
  const apiKey = getApiKey();
  const isPlaceholder = !apiKey || apiKey.startsWith('sk-your');
  if (isPlaceholder) {
    const mock = mockAnalyze(text);
    return {
      emotion: mock.emotion,
      confidence: mock.confidence,
    };
  }

  const baseUrl = getBaseUrl();
  const controller = new AbortController();
  const totalTimeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }

      // 1차: glm-4-plus (기본 모델, 안정적)
      const ctrl1 = new AbortController();
      const timer1 = setTimeout(() => ctrl1.abort(), PRIMARY_TIMEOUT_MS);
      let result = await callModel(text, 'glm-4-plus', apiKey, baseUrl, ctrl1.signal);
      clearTimeout(timer1);

      // 2차: glm-4.5-flash 폴백 (빠른 응답)
      if (!result.ok) {
        console.warn(`glm-4-plus 1차 실패(${result.status}), glm-4.5-flash 2차 폴백`);
        const ctrl2 = new AbortController();
        const timer2 = setTimeout(() => ctrl2.abort(), FALLBACK_TIMEOUT_MS);
        result = await callModel(text, 'glm-4.5-flash', apiKey, baseUrl, ctrl2.signal);
        clearTimeout(timer2);
      }

      // 둘 다 실패
      if (!result.ok) {
        // 503이면 재시도
        if (result.status === 503 && attempt === 0) {
          continue;
        }
        console.warn(`Z.AI API 최종 실패 (glm-4-plus + glm-4.5-flash 모두 실패) ${result.status}`);
        throw new Error('AI 서비스가 혼잡합니다. 잠시 후 다시 이용해 주세요.');
      }

      // 응답 파싱
      const content = result.data?.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 응답을 받을 수 없습니다');
      }

      // 마크다운 코드펜스 제거 후 JSON 파싱
      let parsed: unknown;
      try {
        const cleaned = content.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error('AI 응답을 해석할 수 없습니다');
      }

      // emotion 검증
      const emotionResult = emotionSchema.safeParse(
        (parsed as Record<string, unknown>)?.emotion,
      );
      if (!emotionResult.success) {
        throw new Error('AI가 유효하지 않은 감정을 반환했습니다');
      }

      const emotion = emotionResult.data;
      const confidence = Number((parsed as Record<string, unknown>)?.confidence) || 0;

      // 전체 응답 검증
      const fullResponse = {
        emotion,
        confidence,
        emotionKo: EMOTION_KO[emotion],
      };

      const validationResult = analysisResponseSchema.safeParse(fullResponse);
      if (!validationResult.success) {
        throw new Error('AI 응답 검증에 실패했습니다');
      }

      return {
        emotion: validationResult.data.emotion,
        confidence: validationResult.data.confidence,
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
