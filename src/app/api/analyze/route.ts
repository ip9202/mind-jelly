/**
 * 감정 분석 API Route Handler
 * M1-T4: POST /api/analyze
 */
import { NextResponse } from 'next/server';
import { emotionSchema, analysisResponseSchema } from '@/lib/ai/schemas';
import { mockAnalyze } from '@/lib/ai/mockAnalyzer';
import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 한국어 감정명 매핑
const EMOTION_KO: Record<EmotionType, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '분노',
  fear: '공포',
  disgust: '혐오',
};

// @MX:NOTE: 텍스트 길이 제한
const MAX_TEXT_LENGTH = 500;

// @MX:WARN: 모델당 타임아웃 - 폴백 체인 총 시간이 클라이언트 타임아웃(25s) 내이어야 함
// @MX:REASON: 서버 측 fetch에 타임아웃이 없으면 2차 모델 응답 지연 시 클라이언트 타임아웃 초과
const PER_MODEL_TIMEOUT_MS = 8_000;

// @MX:NOTE: 시스템 프롬프트 - 반드시 5가지 감정 중 하나만 반환
const SYSTEM_PROMPT =
  'Analyze the emotion of the Korean text. Return ONLY this JSON, no other text: {"emotion":"joy","confidence":0.9}. Emotion MUST be exactly one of: joy, sadness, anger, fear, disgust. Never use "neutral" or any other value. If unsure, pick the closest match.';

export async function POST(request: Request): Promise<Response> {
  // 요청 본문 파싱
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다' },
      { status: 400 },
    );
  }

  // 입력 검증
  if (!body || typeof body !== 'object' || !('text' in body)) {
    return NextResponse.json(
      { error: 'text 필드가 필요합니다' },
      { status: 400 },
    );
  }

  const { text } = body as { text: unknown };

  if (typeof text !== 'string') {
    return NextResponse.json(
      { error: 'text는 문자열이어야 합니다' },
      { status: 400 },
    );
  }

  if (text.trim().length === 0) {
    return NextResponse.json(
      { error: '텍스트를 입력해주세요' },
      { status: 400 },
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `${MAX_TEXT_LENGTH}자 이하로 입력해주세요` },
      { status: 400 },
    );
  }

  // API 키 확인 (없으면 mock 분석 사용)
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const isPlaceholder = !apiKey || apiKey.startsWith('sk-your');
  if (isPlaceholder) {
    const mock = mockAnalyze(text);
    return NextResponse.json({
      emotion: mock.emotion,
      confidence: mock.confidence,
      emotionKo: EMOTION_KO[mock.emotion],
    });
  }

  // Z.AI API 직접 호출 (모델 폴백 체인: glm-4.5-flash → glm-4-plus)
  try {
    const apiUrl = `${baseUrl || 'https://open.bigmodel.cn/api/paas/v4'}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    // 1차: glm-4.5-flash (빠른 응답, 8s 타임아웃)
    const ctrl1 = new AbortController();
    const timer1 = setTimeout(() => ctrl1.abort(), PER_MODEL_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        signal: ctrl1.signal,
        body: JSON.stringify({
          model: 'glm-4.5-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
        }),
      });
    } catch (e) {
      response = { ok: false, status: 408 } as Response;
      console.warn('glm-4.5-flash 1차 타임아웃:', e instanceof Error ? e.message : e);
    } finally {
      clearTimeout(timer1);
    }

    // 2차: glm-4-plus 폴백 (안정적, 8s 타임아웃)
    if (!response.ok) {
      console.warn(`glm-4.5-flash 1차 실패(${response.status}), glm-4-plus 2차 폴백`);
      const ctrl2 = new AbortController();
      const timer2 = setTimeout(() => ctrl2.abort(), PER_MODEL_TIMEOUT_MS);
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          signal: ctrl2.signal,
          body: JSON.stringify({
            model: 'glm-4-plus',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: text },
            ],
            temperature: 0.3,
          }),
        });
      } catch (e) {
        response = { ok: false, status: 408 } as Response;
        console.warn('glm-4-plus 2차 타임아웃:', e instanceof Error ? e.message : e);
      } finally {
        clearTimeout(timer2);
      }
    }

    // 둘 다 실패하면 안내 메시지
    if (!response.ok) {
      console.warn(`Z.AI API 최종 실패 (glm-4.5-flash + glm-4-plus 모두 실패) ${response.status}`);
      return NextResponse.json(
        { error: 'AI 서비스가 혼잡합니다. 잠시 후 다시 이용해 주세요.' },
        { status: 503 },
      );
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'AI 응답을 받을 수 없습니다' },
        { status: 500 },
      );
    }

    // 응답 파싱 (마크다운 코드펜스 제거)
    let parsed: unknown;
    try {
      const cleaned = content.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'AI 응답을 해석할 수 없습니다' },
        { status: 500 },
      );
    }

    // emotion 검증
    const emotionResult = emotionSchema.safeParse(
      (parsed as Record<string, unknown>)?.emotion,
    );
    if (!emotionResult.success) {
      return NextResponse.json(
        { error: 'AI가 유효하지 않은 감정을 반환했습니다' },
        { status: 500 },
      );
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
      return NextResponse.json(
        { error: 'AI 응답 검증에 실패했습니다' },
        { status: 500 },
      );
    }

    return NextResponse.json(validationResult.data);
  } catch (error) {
    console.error('감정 분석 API 에러:', error);
    return NextResponse.json(
      { error: '감정 분석 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}
