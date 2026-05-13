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
// @MX:NOTE: [AUTO] 스와이프 감지 최소 거리 (EmotionStatsBottomSheet와 동일)
const SWIPE_THRESHOLD_PX = 50;

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
export function EmotionInput({
  onCompleteAction,
  onCancelAction
}: {
  onCompleteAction?: () => void;
  onCancelAction?: () => void;
}) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ emotion: EmotionType; confidence: number } | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // @MX:NOTE: [AUTO] 스와이프다운 감지용 터치 추적 refs
  const touchStartY = useRef<number | null>(null);
  const touchLastY = useRef<number | null>(null);
  // @MX:NOTE: [AUTO] 드래그-팔로우 애니메이션 상태 (드래그 중 실시간 transform 추적)
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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
      await addEmotionResult(fullResult);
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
  }, [isSubmitDisabled, trimmedText, onCompleteAction]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TEXT_LENGTH) {
      setText(value);
    }
  };

  // @MX:NOTE: [AUTO] 드래그-팔로우: 터치 즉시 컨테이너가 손가락을 따라 이동
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchLastY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // 아래로만 드래그 허용 (양수 deltaY)
    if (deltaY > 0) {
      setDragOffset(deltaY);
      touchLastY.current = currentY;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current === null || touchLastY.current === null) return;

    const deltaY = touchLastY.current - touchStartY.current;

    setIsDragging(false);

    if (deltaY > SWIPE_THRESHOLD_PX) {
      // 임계값 초과: 화면 밖으로 슬라이드 애니메이션 후 닫기
      setDragOffset(window.innerHeight);
      setTimeout(() => {
        onCancelAction?.();
        setDragOffset(0);
      }, 300);
    } else {
      // 임계값 미만: 원래 위치로 스냅백
      setDragOffset(0);
    }

    touchStartY.current = null;
    touchLastY.current = null;
  }, [onCancelAction]);

  return (
    <div
      className="bg-white/30 backdrop-blur-[12px] border border-white/20 rounded-3xl p-5 flex flex-col gap-3 shadow-[0_8px_32px_0_rgba(120,85,94,0.08)]"
      style={{
        transform: `translateY(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        willChange: isDragging ? 'transform' : undefined,
      }}
    >

      {/* 드래그 핸들 */}
      <div
        className="flex justify-center pt-1 pb-1 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-testid="drag-handle"
      >
        <div className="w-9 h-1 rounded-full bg-gray-300" />
      </div>

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
          className="w-full h-36 bg-white/60 border-none rounded-xl p-4 text-on-surface resize-none text-sm placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-[#ffd1dc] focus:outline-none transition-all disabled:opacity-50 font-gowun leading-relaxed"
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

      {/* 제출 버튼 (로딩 상태 통합으로 layout shift 제거) */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        aria-label="감정 분석하기"
        aria-busy={isAnalyzing}
        data-testid={isAnalyzing ? 'loading-indicator' : undefined}
        className="w-full h-11 rounded-xl text-on-primary font-gowun text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] hover:shadow-md"
        style={{
          background: 'linear-gradient(135deg, #FF9ECD 0%, #FFD1DC 100%)',
          boxShadow: '0 2px 8px rgba(255, 158, 205, 0.35)',
        }}
      >
        {isAnalyzing ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>분석 중...</span>
            <span className="sr-only" aria-live="polite">감정을 분석하고 있습니다...</span>
          </>
        ) : (
          <>
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              auto_awesome
            </span>
            <span>감정 분석</span>
          </>
        )}
      </button>
    </div>
  );
}
