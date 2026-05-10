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
// @MX:NOTE: 결과 표시 후 자동 초기화 시간 (ms) — restoring 전환 전 짧은 대기
const AUTO_RESET_MS = 1000;

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

/**
 * 텍스트 기반 감정 입력 컴포넌트
 * M1-T6: textarea + 분석 요청 + 결과 표시
 */
export function EmotionInput({ onCompleteAction }: { onCompleteAction?: () => void }) {
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

    const { setAnalyzing, setAnalysisError, addEmotionResult, setLastEmotion, setLastInputText } =
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

      setLastInputText(trimmedText);
      addEmotionResult(fullResult);
      setLastEmotion(analysisResult.emotion);
      setResult(analysisResult);

      // 결과를 잠시 보여준 후 부모에 완료 알림 (restoring 전이 트리거)
      resetTimerRef.current = setTimeout(() => {
        setResult(null);
        setText('');
        onCompleteAction?.();
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
    <div className="bg-white/30 backdrop-blur-[12px] border border-white/20 rounded-3xl p-5 flex flex-col gap-3 shadow-[0_8px_32px_0_rgba(120,85,94,0.08)]">

      {/* 결과 표시 */}
      {result && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl text-center"
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
        <div role="alert" aria-live="assertive" className="p-3 rounded-xl bg-red-50/60 text-center">
          <span className="text-sm text-red-600">{analysisError}</span>
        </div>
      )}

      {/* 제목 */}
      <h2 className="text-sm font-semibold text-center text-primary font-gowun">
        오늘 하루, 마음에 남은 이야기
      </h2>

      {/* 텍스트 입력 */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="감정을 자유롭게 적어보세요..."
          maxLength={MAX_TEXT_LENGTH}
          disabled={isAnalyzing}
          aria-label="감정 텍스트 입력"
          aria-describedby="char-count"
          className="w-full h-36 bg-white/60 border-none rounded-xl p-4 text-on-surface resize-none text-2xl placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-[#ffd1dc] focus:outline-none transition-all disabled:opacity-50"
        />
        <span
          id="char-count"
          aria-live="polite"
          aria-label={`현재 ${charCount}/${MAX_TEXT_LENGTH}자`}
          className={`absolute bottom-2 right-4 text-xs ${
            isNearLimit ? 'text-red-500' : 'text-on-surface-variant/50'
          }`}
        >
          {charCount}/{MAX_TEXT_LENGTH}
        </span>
      </div>

      {/* 제출 버튼 + 로딩 */}
      {isAnalyzing ? (
        <div
          data-testid="loading-indicator"
          className="flex items-center justify-center gap-2 py-3 text-primary"
          aria-busy="true"
        >
          <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="text-sm font-medium">분석 중...</span>
          <span className="sr-only" aria-live="polite">감정을 분석하고 있습니다...</span>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          aria-label="감정 분석하기"
          aria-busy={isAnalyzing}
          className="w-full bg-primary text-white font-medium py-3 rounded-full shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[0.98] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.3375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          감정 분석
        </button>
      )}
    </div>
  );
}
