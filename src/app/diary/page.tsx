'use client';

import { useState, useMemo, useEffect } from 'react';
import NavMenu from '@/components/layout/NavMenu';
import { diaryStore } from '@/stores/diaryStore';
import type { DiaryEntry } from '@/types/diary';
import type { EmotionType } from '@/types/emotion';

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
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

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

/**
 * 특정 날짜가 속한 주의 월요일 인덱스 계산 (0=월, 6=일)
 */
function getMondayIndex(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DiaryPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // store에서 엔트리 읽기
  const entries = diaryStore((state) => state.entries);

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
    [currentYear, currentMonth, entries],
  );

  // 날짜별 엔트리 존재 여부 (빠른 조회용 Set)
  const daysWithEntries = useMemo(() => {
    const daySet = new Set<number>();
    monthEntries.forEach((entry) => {
      const d = new Date(entry.createdAt);
      daySet.add(d.getDate());
    });
    return daySet;
  }, [monthEntries]);

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
    [selectedDate, entries],
  );

  // 주간 차트용 데이터 (월~일 순서)
  const weekChartData = useMemo(() => {
    const monday = getMondayIndex(selectedDate);
    const emotionTypes: EmotionType[] = [
      'joy',
      'sadness',
      'anger',
      'fear',
      'disgust',
      'surprise',
      'love',
      'gratitude',
      'hope',
    ];

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(day.getDate() + i);
      const dayEntries = diaryStore
        .getState()
        .getEntriesByDate(day);

      const total = dayEntries.length;
      if (total === 0) return null;

      const segments: { emotion: EmotionType; percent: number }[] = [];
      emotionTypes.forEach((emotion) => {
        const count = dayEntries.filter((e) => e.emotion === emotion).length;
        if (count > 0) {
          segments.push({
            emotion,
            percent: Math.round((count / total) * 100),
          });
        }
      });

      return {
        dayIndex: i,
        label: DAY_LABELS[i],
        isToday: formatDateKey(day) === formatDateKey(today),
        segments,
      };
    });
  }, [selectedDate, entries, today]);

  return (
    <div className="text-on-background min-h-screen pb-6 font-gowun">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-[20px] h-16 bg-surface/85 backdrop-blur-[8px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">
            bubble_chart
          </span>
          <h1 className="font-dongle text-[32px] leading-none text-primary pt-2">
            오늘의 감정 일기
          </h1>
        </div>
        <NavMenu activeTab="history" />
      </header>

      <main id="main-content" className="px-[20px] mt-[16px] space-y-[24px]">
        {/* Calendar Section */}
        <section role="group" aria-label="달력" className="glass-card rounded-[20px] p-[16px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-[8px]">
            <span className="text-primary font-dongle text-[28px] font-normal">
              {formatMonthKo(currentYear, currentMonth)}
            </span>
            <div className="flex gap-[4px]">
              <button
                onClick={goToPrevMonth}
                className="cursor-pointer"
                aria-label="이전 달"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  chevron_left
                </span>
              </button>
              <button
                onClick={goToNextMonth}
                className="cursor-pointer"
                aria-label="다음 달"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  chevron_right
                </span>
              </button>
            </div>
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
              const hasEntry = daysWithEntries.has(day);

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
                  {mounted && hasEntry && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-jelly-base rounded-full border border-white" />
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
          <h2 className="text-primary px-1 font-dongle text-[28px] font-normal">
            타임라인
          </h2>

          {dayEntries.length === 0 ? (
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
            <div aria-live="polite" className="relative pl-8 space-y-[12px] before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
              {dayEntries.map((entry) => (
                <TimelineEntry key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>

        {/* Weekly Emotion Flow Chart */}
        <section className="glass-card rounded-[20px] p-[16px] shadow-sm">
          <h2 className="text-primary mb-[16px] font-dongle text-[28px] font-normal">
            이번 주 감정 흐름
          </h2>

          {weekChartData.every((d) => d === null) ? (
            /* 빈 상태 */
            <div className="text-center py-[16px]">
              <p className="text-on-surface-variant text-[14px]">
                이번 주 감정 기록이 아직 없어요
              </p>
            </div>
          ) : (
            <div className="space-y-[8px]">
              {weekChartData.map((data, idx) => {
                if (!data) {
                  return (
                    <div
                      key={`empty-week-${idx}`}
                      className="flex items-center gap-[16px]"
                    >
                      <span className="w-8 text-on-surface-variant font-gamja text-[16px] opacity-40">
                        {DAY_LABELS[idx]}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-surface-container-high" />
                    </div>
                  );
                }

                return (
                  <div
                    key={`week-${idx}`}
                    className="flex items-center gap-[16px]"
                  >
                    <span
                      className={`w-8 font-gamja text-[16px] ${
                        data.isToday
                          ? 'text-primary font-bold'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {data.isToday ? '오늘' : data.label}
                    </span>
                    <div
                      className={`flex-1 ${
                        data.isToday ? 'h-4 ring-2 ring-primary/10' : 'h-3'
                      } flex rounded-full overflow-hidden bg-surface-container-high`}
                    >
                      {data.segments.map((seg, si) => (
                        <div
                          key={`${seg.emotion}-${si}`}
                          className={`h-full ${EMOTION_UI[seg.emotion].bg}`}
                          style={{ width: `${seg.percent}%` }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 범례 */}
          <div className="mt-[16px] flex justify-center gap-[24px]">
            {(['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'love', 'gratitude', 'hope'] as EmotionType[]).map(
              (emotion) => (
                <div key={emotion} className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${EMOTION_UI[emotion].dot}`}
                  />
                  <span className="text-on-surface-variant font-gamja text-[14px]">
                    {EMOTION_UI[emotion].label}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      </main>

    </div>
  );
}

/**
 * 타임라인 개별 엔트리 컴포넌트
 */
function TimelineEntry({ entry }: { entry: DiaryEntry }) {
  const ui = EMOTION_UI[entry.emotion];

  return (
    <article aria-label={`${ui.label} 감정 기록`} className="glass-card rounded-[20px] p-[16px] shadow-sm relative transition-all active:scale-[0.98]">
      <div
        className={`absolute -left-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 ${ui.bg} rounded-full border-4 border-surface shadow-sm`}
      >
        <span className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
      <div className="flex items-center gap-[8px]">
        <span className="material-symbols-outlined text-secondary">
          {ui.icon}
        </span>
        <div>
          <p className="font-bold text-on-surface">{entry.text}</p>
          <p className="text-[13px] text-on-surface-variant">
            {formatTimeKo(entry.createdAt)}
          </p>
        </div>
      </div>
    </article>
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
