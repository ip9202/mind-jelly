'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { jellyStore } from '@/stores/jellyStore';
import { analyzeEmotion } from '@/lib/ai/analyzer';
import { EMOTION_COLORS } from '@/lib/constants/emotion';
import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 입력 최대 길이
const MAX_TEXT_LENGTH = 500;
// @MX:NOTE: 경고 임계값 (이 수치부터 글자 수 카운터 색상 변경)
const WARNING_THRESHOLD = 450;
// @MX:NOTE: 결과 표시 후 자동 초기화 시간 (ms)
const AUTO_RESET_MS = 2000;

// @MX:NOTE: 한국어 감정명 매핑
const EMOTION_KO: Record<EmotionType, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '분노',
  fear: '공포',
  disgust: '혐오',
};

/**
 * 텍스트 기반 감정 입력 컴포넌트
 * M1-T6: textarea + 분석 요청 + 결과 표시
 */
export function EmotionInput() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ emotion: EmotionType; confidence: number } | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAnalyzing = jellyStore((s) => s.isAnalyzing);
  const analysisError = jellyStore((s) => s.analysisError);

  const trimmedText = text.trim();
  const isSubmitDisabled = trimmedText.length === 0 || isAnalyzing;
  const charCount = text.length;
  const isNearLimit = charCount >= WARNING_THRESHOLD;

  // 자동 초기화 타이머 정리
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) return;

    const { setAnalyzing, setAnalysisError, addEmotionResult, setLastEmotion, incrementBeadCount } =
      jellyStore.getState();

    setAnalyzing(true);
    setAnalysisError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeEmotion(trimmedText);

      const fullResult = {
        emotion: analysisResult.emotion,
        confidence: analysisResult.confidence,
        emotionKo: EMOTION_KO[analysisResult.emotion],
      };

      addEmotionResult(fullResult);
      setLastEmotion(analysisResult.emotion);
      incrementBeadCount(5);
      setResult(analysisResult);

      // 2초 후 자동 초기화
      resetTimerRef.current = setTimeout(() => {
        setResult(null);
        setText('');
      }, AUTO_RESET_MS);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '분석 중 오류가 발생했습니다';
      setAnalysisError(message);
    } finally {
      setAnalyzing(false);
    }
  }, [isSubmitDisabled, trimmedText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TEXT_LENGTH) {
      setText(value);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-[#191F28]/90 backdrop-blur-xl rounded-t-[28px] rounded-b-lg shadow-xl p-6">
      <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-4" />

      {/* 결과 표시 */}
      {result && (
        <div
          className="mb-4 p-3 rounded-xl text-center"
          style={{ backgroundColor: `${EMOTION_COLORS[result.emotion]}20` }}
        >
          <span
            className="font-gamja text-2xl"
            style={{ color: EMOTION_COLORS[result.emotion] }}
          >
            {EMOTION_KO[result.emotion]}
          </span>
          <span className="ml-2 text-sm text-on-surface-variant">
            {(result.confidence * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* 에러 표시 */}
      {analysisError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-center">
          <span className="text-sm text-red-600">{analysisError}</span>
        </div>
      )}

      {/* 텍스트 입력 */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="오늘 감정을 적어보세요..."
          maxLength={MAX_TEXT_LENGTH}
          disabled={isAnalyzing}
          className="w-full h-20 p-3 rounded-xl border border-outline-variant dark:border-white/20 bg-surface-container-lowest dark:bg-[#1a2233] text-on-surface dark:text-[#e8eaed] resize-none text-sm focus:outline-none focus:border-primary disabled:opacity-50"
        />
        <span
          className={`absolute bottom-2 right-3 text-xs ${
            isNearLimit ? 'text-red-500' : 'text-on-surface-variant'
          }`}
        >
          {charCount}/{MAX_TEXT_LENGTH}
        </span>
      </div>

      {/* 제출 버튼 + 로딩 */}
      <div className="mt-3 flex justify-center">
        {isAnalyzing ? (
          <div
            data-testid="loading-indicator"
            className="flex items-center gap-2 text-primary"
          >
            <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">분석 중...</span>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="px-6 py-2 rounded-xl bg-primary text-on-primary dark:bg-primary/80 dark:text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
          >
            감정 분석
          </button>
        )}
      </div>
    </div>
  );
}
