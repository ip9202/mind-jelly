/**
 * 감정 분석 관련 타입 정의
 * M1-T1: EmotionType, EmotionResult, AnalysisRequest, AnalysisResponse
 */

// @MX:ANCHOR: 감정 타입 (다수 모듈에서 사용)
// @MX:REASON: EmotionInput, analyzer, API route, jellyStore 등에서 참조
// @MX:SPEC: SPEC-JELLY-002 M1
export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'disgust';

// @MX:NOTE: 감정 분석 결과
export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
}

// @MX:NOTE: 감정 분석 요청
export interface AnalysisRequest {
  text: string;
}

// @MX:NOTE: 감정 분석 응답 (API 반환값)
export interface AnalysisResponse {
  emotion: EmotionType;
  confidence: number;
  emotionKo: string;
}
