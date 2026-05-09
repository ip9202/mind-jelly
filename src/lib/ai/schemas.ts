/**
 * 감정 분석 Zod 스키마
 * M1-T2: emotionSchema, analysisResponseSchema
 */
import { z } from 'zod';

// @MX:ANCHOR: 감정 타입 검증 스키마
// @MX:REASON: analyzer, API route, EmotionInput 등에서 응답 검증에 사용
// @MX:SPEC: SPEC-JELLY-002 M1-T2
export const emotionSchema = z.enum(['joy', 'sadness', 'anger', 'fear', 'disgust']);

// @MX:NOTE: 감정 분석 응답 검증 스키마
export const analysisResponseSchema = z.object({
  emotion: emotionSchema,
  confidence: z.number().min(0).max(1),
  emotionKo: z.string().min(1),
});
