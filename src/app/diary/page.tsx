'use client';

import { useState, useMemo, useSyncExternalStore, useEffect, useRef } from 'react';
import { EmotionFace } from '@/components/jelly/EmotionFace';
import { diaryStore } from '@/stores/diaryStore';
import type { DiaryEntry } from '@/types/diary';
import type { EmotionType } from '@/types/emotion';
import { EMOTION_COLORS } from '@/lib/constants/emotion';
import BottomNav from '@/components/layout/BottomNav';

const emptySubscribe = () => () => {};

// 감정별 UI 매핑
const EMOTION_UI: Record<
  EmotionType,
  { bg: string; icon: string; label: string; dot: string }
> = {
  joy: {
    bg: 'bg-jelly-base',
    icon: 'sentiment_satisfied',
    label: '평온',
    dot: 'bg-jelly-base',
  },
  sadness: {
    bg: 'bg-jelly-sad',
    icon: 'water_drop',
    label: '우울',
    dot: 'bg-jelly-sad',
  },
  anger: {
    bg: 'bg-jelly-anger',
    icon: 'bolt',
    label: '분노',
    dot: 'bg-jelly-anger',
  },
  fear: {
    bg: 'bg-jelly-tired',
    icon: 'bedtime',
    label: '불안',
    dot: 'bg-jelly-tired',
  },
  disgust: {
    bg: 'bg-jelly-tired',
    icon: 'sick',
    label: '혐오',
    dot: 'bg-jelly-tired',
  },
  surprise: {
    bg: 'bg-jelly-surprise',
    icon: 'sentiment_surprised',
    label: '놀람',
    dot: 'bg-jelly-surprise',
  },
  love: {
    bg: 'bg-jelly-love',
    icon: 'favorite',
    label: '사랑',
    dot: 'bg-jelly-love',
  },
  gratitude: {
    bg: 'bg-jelly-gratitude',
    icon: 'sentiment_very_satisfied',
    label: '감사',
    dot: 'bg-jelly-gratitude',
  },
  hope: {
    bg: 'bg-jelly-hope',
    icon: 'wb_sunny',
    label: '희망',
    dot: 'bg-jelly-hope',
  },
};

// 요일 헤더
const WEEK_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 시간을 한국어 오전/오후 형식으로 변환
 */
function formatTimeKo(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * 날짜를 한국어 형식으로 변환 (예: "2026년 5월")
 */
function formatMonthKo(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

/**
 * 캘린더 그리드에 표시할 날짜 배열 생성
 * 이전 달 마지막 일부 + 현재 달 전체 + 다음 달 일부
 */
function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=일
  const daysInMonth = lastDay.getDate();

  // 일요일 시작 캘린더에서 첫 주 빈 칸 수
  const leadingEmpty = startDayOfWeek;
  const days: (number | null)[] = Array(leadingEmpty).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  // 7의 배수가 되도록 채움
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function DiaryPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [anyModalOpen, setAnyModalOpen] = useState(false);

  // 월 이동
  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  // 캘린더 날짜 배열
  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  // 이번 달 엔트리 (캘린더 도트 표시용)
  const monthEntries = useMemo(
    () =>
      diaryStore.getState().getEntriesByMonth(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  // 날짜별 대표 감정 Map (SPEC-CALENDAR-001: 최빈 감정, 동률 시 최근 감정)
  const dayEmotionMap = useMemo(() => {
    const map = new Map<number, EmotionType>();
    const dayGroups = new Map<number, DiaryEntry[]>();
    monthEntries.forEach((entry) => {
      const d = new Date(entry.createdAt);
      if (d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth) {
        const day = d.getDate();
        if (!dayGroups.has(day)) dayGroups.set(day, []);
        dayGroups.get(day)!.push(entry);
      }
    });
    dayGroups.forEach((entries, day) => {
      const counts = new Map<EmotionType, number>();
      entries.forEach((e) => counts.set(e.emotion, (counts.get(e.emotion) ?? 0) + 1));
      const maxCount = Math.max(...counts.values());
      const topEmotions = [...counts.entries()].filter(([, c]) => c === maxCount).map(([e]) => e);
      if (topEmotions.length === 1) {
        map.set(day, topEmotions[0]);
      } else {
        // 동률 시 가장 최근 감정 선택
        const mostRecent = entries
          .filter((e) => topEmotions.includes(e.emotion))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        map.set(day, mostRecent.emotion);
      }
    });
    return map;
  }, [monthEntries, currentYear, currentMonth]);

  // 선택된 날짜의 타임라인 엔트리 (최신순)
  const dayEntries = useMemo(
    () =>
      diaryStore
        .getState()
        .getEntriesByDate(selectedDate)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [selectedDate],
  );

  return (
    <div className="text-on-background min-h-screen pb-24 font-gowun">
      <main id="main-content" className="px-[20px] mt-[16px] space-y-[24px]">
        {/* Calendar Section */}
        <section role="group" aria-label="달력" className="glass-card rounded-[20px] p-[16px] shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-3 items-center mb-[8px]">
            <button
              onClick={goToPrevMonth}
              className="cursor-pointer justify-self-start"
              aria-label="이전 달"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_left
              </span>
            </button>
            <span className="justify-self-center text-primary font-gowun text-lg font-bold leading-tight">
              {formatMonthKo(currentYear, currentMonth)}
            </span>
            <button
              onClick={goToNextMonth}
              className="cursor-pointer justify-self-end"
              aria-label="다음 달"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {WEEK_HEADERS.map((day) => (
              <div
                key={day}
                className="text-[13px] text-on-surface-variant opacity-50 font-gowun"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="p-2 text-[13px]" />;
              }

              const dateObj = new Date(currentYear, currentMonth - 1, day);
              const isSelected =
                formatDateKey(dateObj) === formatDateKey(selectedDate);
              const emotion = dayEmotionMap.get(day);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`p-2 text-[13px] font-gowun relative cursor-pointer rounded-full transition-colors ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'hover:bg-surface-container-high'
                  }`}
                >
                  {day}
                  {mounted && emotion && (
                    <div
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white"
                      style={{ backgroundColor: EMOTION_COLORS[emotion] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {/* 장식 젤리 */}
          <div className="absolute -bottom-2 -right-2 opacity-20" aria-hidden="true">
            <span className="material-symbols-outlined text-[64px]">pets</span>
          </div>
        </section>

        {/* Emotion Timeline */}
        <section className="space-y-[12px]">
          <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">
            타임라인
          </h2>

          {!mounted || dayEntries.length === 0 ? (
            /* 빈 상태 */
            <div className="glass-card rounded-[20px] p-[32px] shadow-sm text-center">
              <span className="material-symbols-outlined text-on-surface-variant text-[48px] opacity-40" aria-hidden="true">
                edit_note
              </span>
              <p className="text-on-surface-variant text-[14px] mt-[8px]">
                이 날의 감정 기록이 없어요
              </p>
              <p className="text-on-surface-variant text-[13px] opacity-60 mt-[4px]">
                홈에서 감정을 분석해보세요
              </p>
            </div>
          ) : (
            <div aria-live="polite" className="space-y-[12px]">
              {dayEntries.map((entry) => (
                <TimelineEntry key={entry.id} entry={entry} onModalChange={setAnyModalOpen} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 전역 BottomNav — 모달 오픈 시 숨김 */}
      {!anyModalOpen && <BottomNav activeTab="history" />}
    </div>
  );
}

/**
 * 감정 신뢰도를 한국어 등급으로 변환
 */
function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return '많이';
  if (confidence >= 0.5) return '어느정도';
  return '살짝';
}

/**
 * 타임라인 개별 엔트리 컴포넌트
 */
const SWIPE_THRESHOLD_PX = 80;

function TimelineEntry({ entry, onModalChange }: { entry: DiaryEntry; onModalChange: (open: boolean) => void }) {
  const ui = EMOTION_UI[entry.emotion];
  const [modalOpen, setModalOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const touchLastY = useRef<number | null>(null);

  // SPEC-DIARY-002: 스와이프 삭제 상태
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [swipeActiveState, setSwipeActiveState] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const swipeActive = useRef<boolean>(false);

  function handleCardTouchStart(e: React.TouchEvent) {
    if (modalOpen) return;
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
    swipeActive.current = false;
    setSwipeActiveState(false);
  }

  function handleCardTouchMove(e: React.TouchEvent) {
    if (modalOpen || swipeStartX.current === null || swipeStartY.current === null) return;
    const deltaX = e.touches[0].clientX - swipeStartX.current;
    const deltaY = e.touches[0].clientY - swipeStartY.current;
    // 세로 스크롤 우선: 가로 우세할 때만 활성화
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      swipeActive.current = true;
      setSwipeActiveState(true);
    }
    if (!swipeActive.current) return;
    // 왼쪽 스와이프만 허용, 최대 -80
    const newOffset = Math.max(Math.min(deltaX, 0), -80);
    setSwipeOffset(newOffset);
  }

  function handleCardTouchEnd() {
    if (modalOpen) {
      swipeStartX.current = null;
      swipeStartY.current = null;
      swipeActive.current = false;
      setSwipeActiveState(false);
      return;
    }
    if (swipeActive.current) {
      // 60px 이상 왼쪽 스와이프 → 삭제 버튼 노출
      if (swipeOffset <= -60) {
        setSwipeOffset(-80);
      } else {
        setSwipeOffset(0);
      }
    }
    swipeStartX.current = null;
    swipeStartY.current = null;
    swipeActive.current = false;
    setSwipeActiveState(false);
  }

  function handleCardClick() {
    // 스와이프로 삭제 버튼이 노출된 상태에서는 카드 탭으로 모달 열지 않고 원복
    if (swipeOffset !== 0) {
      setSwipeOffset(0);
      return;
    }
    setModalOpen(true);
    onModalChange(true);
  }

  function handleDeleteConfirm() {
    setShowDeleteConfirm(false);
    setSwipeOffset(0);
    diaryStore.getState().deleteEntry(entry.id);
  }

  function handleDeleteCancel() {
    setShowDeleteConfirm(false);
    setSwipeOffset(0);
  }

  // 모달 오픈 시 body 스크롤 잠금
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  function handleHandleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
    touchLastY.current = e.touches[0].clientY;
    setIsDragging(true);
  }

  function handleHandleTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
      touchLastY.current = e.touches[0].clientY;
    }
  }

  function handleHandleTouchEnd() {
    if (touchStartY.current === null || touchLastY.current === null) return;
    const deltaY = touchLastY.current - touchStartY.current;
    setIsDragging(false);

    if (deltaY > SWIPE_THRESHOLD_PX) {
      setDragOffset(window.innerHeight);
      setTimeout(() => {
        setModalOpen(false);
        onModalChange(false);
        setDragOffset(0);
      }, 300);
    } else {
      setDragOffset(0);
    }

    touchStartY.current = null;
    touchLastY.current = null;
  }

  const showDeleteBtn = swipeOffset <= -60;

  // transition 값 계산 (ref 접근 방지)
  const cardTransition = useMemo(() => {
    return swipeActiveState ? 'none' : 'transform 0.2s';
  }, [swipeActiveState]);

  return (
    <>
      <div className="relative overflow-hidden rounded-[20px]">
        {/* 스와이프 삭제 버튼 (카드 뒤) */}
        {showDeleteBtn && (
          <button
            data-testid="swipe-delete-btn"
            aria-label="삭제"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="absolute right-0 top-0 h-full w-20 bg-red-500 text-white flex items-center justify-center font-bold"
          >
            <span className="material-symbols-outlined" aria-hidden="true">delete</span>
          </button>
        )}
      <article
        aria-label={`${ui.label} 감정 기록`}
        onClick={handleCardClick}
        onTouchStart={handleCardTouchStart}
        onTouchMove={handleCardTouchMove}
        onTouchEnd={handleCardTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: cardTransition,
        }}
        className="glass-card rounded-[20px] p-[16px] shadow-sm relative transition-all active:scale-[0.98] cursor-pointer"
      >
        <div
          className={`absolute -left-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 ${ui.bg} rounded-full border-4 border-surface shadow-sm`}
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
        <div className="flex items-center gap-[8px]">
          <div className={`shrink-0 flex items-center justify-center w-8 h-8 ${ui.bg} rounded-full`}>
            <EmotionFace emotion={entry.emotion} size={22} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-on-surface line-clamp-2">{entry.text}</p>
            <p className="text-[13px] text-on-surface-variant">
              {formatTimeKo(entry.createdAt)}
            </p>
          </div>
        </div>
      </article>
      </div>

      {/* SPEC-DIARY-002: 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
          onClick={handleDeleteCancel}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="삭제 확인"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface rounded-t-[24px] p-[20px] pb-[32px] shadow-lg"
          >
            <div className="flex justify-center mb-[16px]">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <p className="text-center text-on-surface font-bold mb-[8px]">
              이 감정 기록을 삭제할까요?
            </p>
            <p className="text-center text-on-surface-variant text-[13px] mb-[24px]">
              삭제하면 복구할 수 없어요
            </p>
            <div className="flex gap-[8px]">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-[12px] rounded-[12px] bg-surface-container text-on-surface font-bold"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-[12px] rounded-[12px] bg-red-500 text-white font-bold"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 바텀시트 모달 */}
      {modalOpen && (
        <div
          data-testid="modal-overlay"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
          onClick={() => { setModalOpen(false); onModalChange(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="감정 기록 상세"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface rounded-t-[24px] p-[20px] pb-[32px] shadow-lg"
            style={{
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              willChange: isDragging ? 'transform' : undefined,
            }}
          >
            {/* 핸들바 - 드래그로 모달 닫기 */}
            <div
              data-testid="modal-handle"
              className="flex justify-center py-3 mb-[8px] touch-none cursor-grab"
              onTouchStart={handleHandleTouchStart}
              onTouchMove={handleHandleTouchMove}
              onTouchEnd={handleHandleTouchEnd}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* 헤더: 감정 아이콘 + 라벨 */}
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className={`shrink-0 flex items-center justify-center w-10 h-10 ${ui.bg} rounded-full`}>
                <EmotionFace emotion={entry.emotion} size={28} />
              </div>
              <span className="font-bold text-on-surface text-[18px]">{ui.label}</span>
              <div
                data-testid="emotion-color-dot"
                className={`w-3 h-3 rounded-full ${ui.dot}`}
              />
            </div>

            {/* 전체 텍스트 */}
            <p className="text-on-surface text-[15px] leading-relaxed whitespace-pre-wrap mb-[16px]">
              {entry.text}
            </p>

            {/* 메타 정보 */}
            <div className="flex items-center gap-[12px] text-[13px] text-on-surface-variant">
              <span>{formatTimeKo(entry.createdAt)}</span>
              <span className="text-outline-variant">|</span>
              <span>신뢰도: {getConfidenceLabel(entry.confidence)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Date 객체를 'YYYY-MM-DD' 형식 문자열로 변환
 */
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
