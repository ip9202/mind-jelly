/**
 * 감정 통계 바텀시트 모달 컴포넌트
 * SPEC-UI-002: REQ-SHEET-001 ~ REQ-SHEET-008
 * SPEC-UI-003: 인사이트 탭 추가 (topEmotions, streak, patternChange)
 * @MX:ANCHOR: [AUTO] 감정 통계 차트 바텀시트 모달
 * @MX:REASON: 홈 화면에서 차트를 하단 슬라이드업으로 분리하여 모바일 세로 공간 최적화
 * @MX:SPEC: SPEC-UI-003
 */

'use client';

import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import dynamic from 'next/dynamic';
import { EmotionDetailPanel } from './EmotionDetailPanel';
import { useEmotionChartData } from '@/hooks/useEmotionChartData';
import { useEmotionInsights } from '@/hooks/useEmotionInsights';
import { EMOTION_COLORS, EMOTION_THEME, EMOTION_TEXT_COLORS, UI_COLORS } from '@/lib/constants/emotion';
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
  // @MX:NOTE: [AUTO] SPEC-UI-003 - 인사이트 탭에서 topEmotions, streak, patternChange 사용
  const { topEmotions, streak, patternChange } = useEmotionInsights();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [chartTab, setChartTab] = useState<'trend' | 'donut' | 'insights'>('trend');
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  // @MX:NOTE: [AUTO] 드래그-팔로우 애니메이션 상태 (드래그 중 실시간 transform 추적)
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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
  // @MX:NOTE: [AUTO] 드래그-팔로우: 터치 즉시 시트가 손가락을 따라 이동
  const touchLastY = useRef<number | null>(null);

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
        onClose();
        setDragOffset(0);
      }, 300);
    } else {
      // 임계값 미만: 원래 위치로 스냅백
      setDragOffset(0);
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
        className="glass-card fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] min-h-[60vh] rounded-t-3xl bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-white/10 overflow-y-auto overscroll-contain"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          willChange: isDragging ? 'transform' : undefined,
        }}
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
        <div className="flex items-center justify-center px-5 pb-3">
          <h2 className="font-gamja text-base text-text-primary">감정 통계</h2>
        </div>

        {/* 탭 전환 버튼 */}
        {hasData && (
          <div className="flex gap-2 px-5 pb-3">
            <button
              onClick={() => setChartTab('trend')}
              className={`flex-1 h-12 rounded-full text-sm font-gamja font-medium transition-all duration-300 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                chartTab === 'trend'
                  ? 'bg-white dark:bg-gray-100 text-gray-800 shadow-sm'
                  : 'bg-white/30 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/20'
              }`}
              aria-label="트렌드 차트"
              aria-pressed={chartTab === 'trend'}
            >
              <span className="material-symbols-outlined text-base align-middle mr-1" aria-hidden="true">
                show_chart
              </span>
              트렌드
            </button>
            <button
              onClick={() => setChartTab('donut')}
              className={`flex-1 h-12 rounded-full text-sm font-gamja font-medium transition-all duration-300 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                chartTab === 'donut'
                  ? 'bg-white dark:bg-gray-100 text-gray-800 shadow-sm'
                  : 'bg-white/30 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/20'
              }`}
              aria-label="도넛 차트"
              aria-pressed={chartTab === 'donut'}
            >
              <span className="material-symbols-outlined text-base align-middle mr-1" aria-hidden="true">
                donut_large
              </span>
              도넛
            </button>
            {/* SPEC-UI-003 REQ-UI-003-4: 인사이트 탭 */}
            <button
              onClick={() => setChartTab('insights')}
              className={`flex-1 h-12 rounded-full text-sm font-gamja font-medium transition-all duration-300 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                chartTab === 'insights'
                  ? 'bg-white dark:bg-gray-100 text-gray-800 shadow-sm'
                  : 'bg-white/30 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/20'
              }`}
              aria-label="인사이트"
              aria-pressed={chartTab === 'insights'}
            >
              <span className="material-symbols-outlined text-base align-middle mr-1" aria-hidden="true">
                auto_awesome
              </span>
              인사이트
            </button>
          </div>
        )}

        {/* REQ-SHEET-006: 차트 영역 */}
        {hasData ? (
          <div className="px-5 pb-6">
            {chartTab === 'trend' ? (
              <WeeklyTrendChart />
            ) : chartTab === 'donut' ? (
              <EmotionDonutChart
                selectedEmotion={selectedEmotion}
                onEmotionSelect={setSelectedEmotion}
              />
            ) : (
              /* SPEC-UI-003 REQ-UI-003-5: 인사이트 탭 - 대시보드 리디자인 */
              <div className="space-y-4" aria-label="개인화 인사이트" role="region">
                {/* Tier 1: 상위 감정 순위 카드 (Hero Section) */}
                {topEmotions.length > 0 && (
                  <div
                    className="rounded-2xl bg-white/60 dark:bg-white/10 p-4 border border-white/30 dark:border-white/10"
                    role="list"
                    aria-label="상위 감정 순위"
                  >
                    {/* 카드 헤더 - 스트릭 인라인 통합 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="material-symbols-outlined text-sm text-text-secondary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          aria-hidden="true"
                        >
                          emoji_events
                        </span>
                        <span className="font-gamja text-xs text-text-secondary">
                          가장 많이 느낀 감정
                        </span>
                      </div>
                      {/* 스트릭 인라인 표시 (불꽃 + 숫자) */}
                      {streak > 0 && (
                        <div className="flex items-center gap-1" aria-label={`연속 ${streak}일 일기 작성 중`}>
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ color: UI_COLORS.streak, fontVariationSettings: "'FILL' 1" }}
                            aria-hidden="true"
                          >
                            whatshot
                          </span>
                          <span className="font-dongle text-lg leading-none" style={{ color: UI_COLORS.streak }}>
                            {streak}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 감정 랭크 리스트 */}
                    <div className="space-y-3">
                      {topEmotions.slice(0, 3).map((item, index) => {
                        const emotionColor = EMOTION_COLORS[item.emotion as keyof typeof EMOTION_COLORS];
                        const emotionTextColor = EMOTION_TEXT_COLORS[item.emotion as keyof typeof EMOTION_TEXT_COLORS];
                        const emotionLabel = EMOTION_THEME[item.emotion as keyof typeof EMOTION_THEME]?.label ?? item.emotion;
                        const isFirst = index === 0;
                        const barHeight = isFirst ? 'h-2' : 'h-1.5';
                        const textSize = isFirst ? 'text-lg' : 'text-base';

                        return (
                          <div
                            key={item.emotion}
                            role="listitem"
                            aria-label={`${emotionLabel} ${item.percentage}%, ${index + 1}위`}
                            className="space-y-1.5"
                          >
                            {/* 감정명 + 퍼센티지 행 */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* 순위 뱃지 */}
                                <span
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                  style={{ backgroundColor: emotionColor }}
                                  aria-hidden="true"
                                >
                                  {index + 1}
                                </span>
                                {/* 감정명 */}
                                <span
                                  className="font-gamja text-sm"
                                  style={{ color: emotionTextColor }}
                                >
                                  {emotionLabel}
                                </span>
                              </div>
                              {/* 퍼센티지 (Dongle 폰트) */}
                              <span
                                className={`font-dongle ${textSize} leading-none`}
                                style={{ color: emotionTextColor }}
                              >
                                {item.percentage}%
                              </span>
                            </div>
                            {/* 프로그레스 바 */}
                            <div
                              className="w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
                              role="progressbar"
                              aria-valuenow={item.percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${emotionLabel} ${item.percentage}%`}
                            >
                              <div
                                className={`${barHeight} rounded-full transition-all duration-500 ease-out`}
                                style={{
                                  width: `${Math.max(item.percentage, 4)}%`,
                                  backgroundColor: emotionColor,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tier 3: 패턴 변화 카드 (Trend) - 전체 너비 */}
                {patternChange && (
                  <div
                    className="rounded-2xl p-4 border border-white/30 dark:border-white/10 flex flex-col items-center justify-center text-center"
                    style={{
                      backgroundColor: patternChange.trend === 'down'
                        ? 'rgba(91, 192, 235, 0.08)'
                        : `${EMOTION_COLORS[patternChange.emotion as keyof typeof EMOTION_COLORS]}14`,
                      borderColor: patternChange.trend === 'down'
                        ? 'rgba(91, 192, 235, 0.2)'
                        : `${EMOTION_COLORS[patternChange.emotion as keyof typeof EMOTION_COLORS]}26`,
                    }}
                    aria-label={patternChange.message}
                  >
                    {/* 트렌드 화살표 */}
                    <span
                      className="material-symbols-outlined text-2xl mb-1"
                      style={{
                        color: patternChange.trend === 'down'
                          ? UI_COLORS.trendDown
                          : EMOTION_TEXT_COLORS[patternChange.emotion as keyof typeof EMOTION_TEXT_COLORS],
                        fontVariationSettings: "'FILL' 1",
                      }}
                      aria-hidden="true"
                    >
                      {patternChange.trend === 'down' ? 'trending_down' : 'trending_up'}
                    </span>
                    {/* 감정명 */}
                    <span
                      className="font-gamja text-xs"
                      style={{
                        color: patternChange.trend === 'down'
                          ? UI_COLORS.trendDown
                          : EMOTION_TEXT_COLORS[patternChange.emotion as keyof typeof EMOTION_TEXT_COLORS],
                      }}
                    >
                      {EMOTION_THEME[patternChange.emotion as keyof typeof EMOTION_THEME]?.label ?? patternChange.emotion}
                    </span>
                    {/* 메시지 */}
                    <span className="font-gowun text-[11px] text-text-secondary mt-0.5 leading-tight">
                      {patternChange.message}
                    </span>
                  </div>
                )}
              </div>
            )}
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
