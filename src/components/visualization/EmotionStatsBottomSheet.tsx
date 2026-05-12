/**
 * 감정 통계 바텀시트 모달 컴포넌트
 * SPEC-UI-002: REQ-SHEET-001 ~ REQ-SHEET-008
 * WeeklyTrendChart와 EmotionDonutChart를 바텀시트 내부에 렌더링
 * @MX:ANCHOR: [AUTO] 감정 통계 차트 바텀시트 모달
 * @MX:REASON: 홈 화면에서 차트를 하단 슬라이드업으로 분리하여 모바일 세로 공간 최적화
 * @MX:SPEC: SPEC-UI-002
 */

'use client';

import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import dynamic from 'next/dynamic';
import { EmotionDetailPanel } from './EmotionDetailPanel';
import { useEmotionChartData } from '@/hooks/useEmotionChartData';
import type { EmotionType } from '@/types/emotion';

// REQ-VIS-010: Recharts 동적 임포트 유지
// @MX:NOTE: next/dynamic으로 코드 분할 - 바텀시트가 닫힐 때 차트 렌더링하지 않음
const WeeklyTrendChart = dynamic(
  () => import('./WeeklyTrendChart').then((mod) => mod.WeeklyTrendChart),
  {
    loading: () => (
      <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" aria-hidden="true" />
    ),
    ssr: false,
  }
);

const EmotionDonutChart = dynamic(
  () => import('./EmotionDonutChart').then((mod) => mod.EmotionDonutChart),
  {
    loading: () => (
      <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" aria-hidden="true" />
    ),
    ssr: false,
  }
);

interface EmotionStatsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

// @MX:NOTE: [AUTO] 스와이프 감지 최소 거리 (50px)
const SWIPE_THRESHOLD_PX = 50;

/**
 * 감정 통계 바텀시트 모달 컴포넌트
 * REQ-SHEET-001: 바텀시트 모달
 * REQ-SHEET-002: 열기/닫기 트리거
 * REQ-SHEET-003: 백드롭 오버레이
 * REQ-SHEET-007: 슬라이드 애니메이션
 * REQ-SHEET-008: 접근성
 */
export function EmotionStatsBottomSheet({ isOpen, onClose, triggerRef }: EmotionStatsBottomSheetProps) {
  const { distribution } = useEmotionChartData();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  // REQ-SHEET-002: ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // REQ-SHEET-008: 바텀시트 열릴 때 포커스 이동
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const firstFocusable = sheetRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // REQ-SHEET-008: 바텀시트 닫힐 때 포커스 복원
  useEffect(() => {
    if (!isOpen) {
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  // REQ-SHEET-002: 드래그 핸들 스와이프다운으로 닫기
  // @MX:NOTE: touchMove에서 마지막 Y 위치를 추적하여 touchEnd에서 비교
  // @MX:REASON: jsdom에서 touchEnd.changedTouches 지원 불안정으로 인해 touchMove 기반 추적
  const touchLastY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchLastY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchLastY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current === null || touchLastY.current === null) return;

    const deltaY = touchLastY.current - touchStartY.current;

    if (deltaY > SWIPE_THRESHOLD_PX) {
      onClose();
    }

    touchStartY.current = null;
    touchLastY.current = null;
  }, [onClose]);

  // REQ-SHEET-007: reduced-motion 감지
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (!isOpen) return null;

  const hasData = distribution.length > 0;

  return (
    <>
      {/* REQ-SHEET-003: 백드롭 오버레이 */}
      <div
        data-testid="backdrop"
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 ${prefersReducedMotion ? '' : 'transition-opacity duration-300'}`}
        onClick={onClose}
      />

      {/* REQ-SHEET-001: 바텀시트 본체 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="감정 통계"
        ref={sheetRef}
        data-testid="sheet-content"
        className={`glass-card fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] min-h-[60vh] rounded-t-3xl bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-white/10 overflow-y-auto overscroll-contain ${prefersReducedMotion ? '' : 'animate-slide-up'}`}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex justify-center pt-3 pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="drag-handle"
        >
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="font-gamja text-base text-text-primary">감정 통계</h2>
          {/* REQ-SHEET-002: 닫기 버튼 */}
          <button
            onClick={onClose}
            aria-label="감정 통계 닫기"
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300" aria-hidden="true">close</span>
          </button>
        </div>

        {/* REQ-SHEET-006: 차트 영역 */}
        {hasData ? (
          <div className="px-5 pb-6 space-y-4">
            <WeeklyTrendChart />
            <EmotionDonutChart
              selectedEmotion={selectedEmotion}
              onEmotionSelect={setSelectedEmotion}
            />
          </div>
        ) : (
          // AC-014: 빈 데이터 상태
          <div className="flex items-center justify-center py-12 text-text-secondary/50 dark:text-gray-400 font-gamja text-sm">
            아직 기록된 감정이 없어요. 일기를 써보세요!
          </div>
        )}
      </div>

      {/* REQ-SHEET-006: 도넛 차트 섹터 클릭 시 EmotionDetailPanel 표시 */}
      <EmotionDetailPanel
        isOpen={selectedEmotion !== null}
        emotionKey={selectedEmotion || 'joy'}
        onClose={() => setSelectedEmotion(null)}
      />
    </>
  );
}
