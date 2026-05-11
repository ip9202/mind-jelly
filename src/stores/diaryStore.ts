/**
 * 일기 데이터 영속화 Store
 * localStorage(오프라인 캐시) + Supabase(서버 동기화) 이중 구조
 * supabaseUserId가 설정되면 Supabase가 단일 소스가 된다.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { deleteDiaryEntry, getMyDiaryEntries, saveDiaryEntry, toggleDiaryShare } from '@/lib/supabase/db';
import type { EmotionType } from '@/types/emotion';
import type { DiaryEntry, DiaryEntryInput } from '@/types/diary';

interface DiaryStoreState {
  entries: DiaryEntry[];
  supabaseUserId: string | null;
  isLoading: boolean;

  // Supabase userId 설정 + 데이터 로드
  setUserId: (id: string) => Promise<void>;

  // 엔트리 추가 (localStorage + Supabase 동시 저장)
  addEntry: (input: DiaryEntryInput) => Promise<void>;

  getEntriesByDate: (date: Date) => DiaryEntry[];
  getEntriesByMonth: (year: number, month: number) => DiaryEntry[];
  getWeekStats: (date: Date) => Record<EmotionType, number>;

  // 엔트리 삭제 (localStorage + Supabase 동시 삭제)
  deleteEntry: (id: string) => Promise<void>;

  // 친구 공유 여부 토글 (낙관적 업데이트, 실패 시 롤백)
  toggleShare: (id: string, isShared: boolean) => Promise<void>;
}

// @MX:ANCHOR: 일기 데이터 단일 소스 (Supabase 전용, localStorage 미사용)
// @MX:REASON: diary page, jellyStore addEmotionResult 등에서 참조
export const diaryStore = create<DiaryStoreState>()(
  devtools(
    (set, get) => ({
        entries: [],
        supabaseUserId: null,
        isLoading: false,

        setUserId: async (id: string) => {
          set({ supabaseUserId: id, isLoading: true });
          try {
            const rows = await getMyDiaryEntries(id);
            const entries: DiaryEntry[] = rows.map((row) => ({
              id: row.id,
              text: row.text,
              emotion: row.emotion as EmotionType,
              confidence: row.confidence,
              emotionKo: row.emotion_ko,
              createdAt: row.created_at,
              isShared: Boolean(row.is_shared),
            }));
            set({ entries, isLoading: false });
          } catch {
            set({ isLoading: false });
          }
        },

        addEntry: async (input: DiaryEntryInput) => {
          const id =
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
          const createdAt = new Date().toISOString();
          const entry: DiaryEntry = { ...input, id, createdAt, isShared: false };

          // localStorage 즉시 반영
          set(
            (state) => ({ entries: [entry, ...state.entries] }),
            false,
            'addEntry',
          );

          // Supabase 저장 (로컬 id 동일하게 사용 → toggleShare 등 후속 작업의 id 일관성 보장)
          const { supabaseUserId } = get();
          if (supabaseUserId) {
            try {
              await saveDiaryEntry({
                id,
                userId: supabaseUserId,
                text: input.text,
                emotion: input.emotion,
                confidence: input.confidence,
                emotionKo: input.emotionKo,
                isShared: false,
                createdAt,
              });
            } catch {
              // Supabase 실패해도 로컬 상태는 유지
            }
          }
        },

        getEntriesByDate: (date: Date) => {
          const dateStr = formatDateKey(date);
          return get().entries.filter((e) => {
            const localDate = new Date(e.createdAt);
            return formatDateKey(localDate) === dateStr;
          });
        },

        getEntriesByMonth: (year: number, month: number) => {
          const prefix = `${year}-${String(month).padStart(2, '0')}`;
          return get().entries.filter((e) => {
            const localDate = new Date(e.createdAt);
            const localPrefix = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}`;
            return localPrefix === prefix;
          });
        },

        getWeekStats: (date: Date) => {
          const weekStart = getMonday(date);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);

          const stats: Record<EmotionType, number> = {
            joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0,
            surprise: 0, love: 0, gratitude: 0, hope: 0,
          };

          get().entries
            .filter((e) => {
              const d = new Date(e.createdAt);
              return d >= weekStart && d < weekEnd;
            })
            .forEach((e) => { stats[e.emotion] += 1; });

          return stats;
        },

        deleteEntry: async (id: string) => {
          set(
            (state) => ({ entries: state.entries.filter((e) => e.id !== id) }),
            false,
            'deleteEntry',
          );

          const { supabaseUserId } = get();
          if (supabaseUserId) {
            try {
              await deleteDiaryEntry(id);
            } catch {
              // 실패해도 localStorage는 이미 삭제
            }
          }
        },

        toggleShare: async (id: string, isShared: boolean) => {
          // 낙관적 업데이트: 로컬 상태 먼저 반영
          set(
            (state) => ({
              entries: state.entries.map((e) =>
                e.id === id ? { ...e, isShared } : e,
              ),
            }),
            false,
            'toggleShare',
          );

          try {
            await toggleDiaryShare(id, isShared);
          } catch (error) {
            // 실패 시 이전 상태로 롤백
            set(
              (state) => ({
                entries: state.entries.map((e) =>
                  e.id === id ? { ...e, isShared: !isShared } : e,
                ),
              }),
              false,
              'toggleShare/rollback',
            );
            throw error;
          }
        },
    }),
    { name: 'diaryStore' },
  ),
);

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
