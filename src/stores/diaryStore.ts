/**
 * 일기 데이터 영속화 Store
 * Zustand persist + devtools 미들웨어 적용
 * localStorage에 일기 엔트리를 저장/조회한다.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { EmotionType } from '@/types/emotion';
import type { DiaryEntry, DiaryEntryInput } from '@/types/diary';

interface DiaryStoreState {
  // 일기 엔트리 목록
  entries: DiaryEntry[];

  // 엔트리 추가 (id, createdAt 자동 생성)
  addEntry: (input: DiaryEntryInput) => void;

  // 특정 날짜의 엔트리 조회
  getEntriesByDate: (date: Date) => DiaryEntry[];

  // 특정 월의 엔트리 조회
  getEntriesByMonth: (year: number, month: number) => DiaryEntry[];

  // 주간 감정 통계 (선택 날짜가 포함된 주, 월~일)
  getWeekStats: (date: Date) => Record<EmotionType, number>;

  // 엔트리 삭제
  deleteEntry: (id: string) => void;
}

// @MX:ANCHOR: 일기 데이터 단일 소스 (localStorage 영속화)
// @MX:REASON: diary page, jellyStore addEmotionResult 등에서 참조
export const diaryStore = create<DiaryStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        entries: [],

        // 엔트리 추가
        addEntry: (input: DiaryEntryInput) => {
          const entry: DiaryEntry = {
            ...input,
            id: typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            createdAt: new Date().toISOString(),
          };

          set(
            (state) => ({
              entries: [...state.entries, entry],
            }),
            false,
            'addEntry',
          );
        },

        // 특정 날짜의 엔트리 조회 (로컬 날짜 기준)
        getEntriesByDate: (date: Date) => {
          const dateStr = formatDateKey(date);
          return get().entries.filter((entry) =>
            entry.createdAt.startsWith(dateStr),
          );
        },

        // 특정 월의 엔트리 조회
        getEntriesByMonth: (year: number, month: number) => {
          // @MX:NOTE: month는 1~12, ISO 문자열 앞부분 매칭
          const prefix = `${year}-${String(month).padStart(2, '0')}`;
          return get().entries.filter((entry) =>
            entry.createdAt.startsWith(prefix),
          );
        },

        // 주간 감정 통계 (해당 주 월~일 범위)
        getWeekStats: (date: Date) => {
          const weekStart = getMonday(date);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);

          const weekEntries = get().entries.filter((entry) => {
            const entryDate = new Date(entry.createdAt);
            return entryDate >= weekStart && entryDate < weekEnd;
          });

          const stats: Record<EmotionType, number> = {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            disgust: 0,
            surprise: 0,
            love: 0,
            gratitude: 0,
            hope: 0,
          };

          weekEntries.forEach((entry) => {
            stats[entry.emotion] += 1;
          });

          return stats;
        },

        // 엔트리 삭제
        deleteEntry: (id: string) => {
          set(
            (state) => ({
              entries: state.entries.filter((entry) => entry.id !== id),
            }),
            false,
            'deleteEntry',
          );
        },
      }),
      {
        name: 'diary-storage',
      },
    ),
    {
      name: 'diaryStore',
    },
  ),
);

/**
 * Date 객체를 'YYYY-MM-DD' 형식 문자열로 변환
 * 로컬 타임존 기준
 */
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 주어진 날짜가 속한 주의 월요일을 반환
 * 일요일 시작 주에서 월요일 시작 주로 변환
 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // 일요일(0)이면 -6, 월요일(1)이면 0, 화요일(2)이면 -1, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
