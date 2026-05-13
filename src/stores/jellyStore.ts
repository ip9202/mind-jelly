import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { JellyState, JellyFace, JellyShape } from '@/types/physics';
import type { EmotionType, AnalysisResponse } from '@/types/emotion';
import { JELLY_COLOR } from '@/lib/constants/emotion';
import { hasTodayDiary } from '@/lib/supabase/db';
import { diaryStore } from '@/stores/diaryStore';

// 상태 전이 맵 (유효한 전이만 정의)
const TRANSITION_MAP: Record<string, string[]> = {
  idle: ['anticipation', 'happy'],
  anticipation: ['eating'],
  eating: ['anticipation', 'satisfied'],
  satisfied: ['idle'],
  happy: ['idle'],
};

// 상태별 기본 표정
const STATE_FACES: Record<string, JellyFace> = {
  idle: { eyes: '• •', mouth: 'o' },
  anticipation: { eyes: '• •', mouth: 'o' },
  eating: { eyes: 'u u', mouth: 'o' },
  satisfied: { eyes: '^ ^', mouth: '-' },
  happy: { eyes: '^ ^', mouth: 'U' },
};

interface JellyStoreState {
  // 현재 상태
  currentState: JellyState;

  // 젤리 위치
  jellyPosition: { x: number; y: number };

  // 표정
  faceExpression: JellyFace;

  // 애니메이션 파라미터
  animationParams: {
    scale: number;
    translateY: number;
    wobble: number;
  };

  // 마지막 감정 타입
  lastEmotion: EmotionType;

  // M1: 감정 분석 상태
  isAnalyzing: boolean;
  analysisError: string | null;
  emotionHistory: AnalysisResponse[];

  // 마지막 분석 입력 텍스트 (diaryStore 저장용)
  lastInputText: string;

  // M2: 감정 기반 색상
  emotionColor: string;

  // 젤리 이름 (온보딩에서 설정, 영속 저장)
  jellyName: string;

  // 젤리 외형 모양 (설정 페이지에서 변경, 영속 저장)
  jellyShape: JellyShape;

  // SPEC-JELLY-003: 마지막 접속 날짜 (YYYY-MM-DD, 로컬 타임존)
  lastAccessDate: string;

  // 액션: 상태 전이
  transitionState: (newState: JellyState) => boolean;

  // @MX:NOTE: [AUTO] 다이어리 기반 일일 상태 초기화
  // @MX:REASON: 오늘 작성한 다이어리가 없으면 감정 상태를 기본값으로 리셋
  // @MX:SPEC: SPEC-JELLY-003
  checkDiaryAndReset: (userId: string) => Promise<void>;

  // 액션: 표정 업데이트
  setFaceExpression: (face: Partial<JellyFace>) => void;

  // 액션: 애니메이션 파라미터 업데이트
  setAnimationParams: (params: Partial<{
    scale: number;
    translateY: number;
    wobble: number;
  }>) => void;

  // 액션: 위치 업데이트
  setJellyPosition: (position: { x: number; y: number }) => void;

  // 액션: 마지막 감정 설정
  setLastEmotion: (emotion: EmotionType) => void;

  // M1 액션: 감정 분석 상태
  setAnalyzing: (value: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  addEmotionResult: (result: AnalysisResponse) => Promise<void>;

  // 마지막 입력 텍스트 설정
  setLastInputText: (text: string) => void;

  // M2 액션: 감정 색상
  setEmotionColor: (color: string) => void;

  // 액션: 젤리 이름 설정
  setJellyName: (name: string) => void;

  // 액션: 젤리 모양 설정
  setJellyShape: (shape: JellyShape) => void;

  // SPEC-TOUCH-001: 터치 쿨다운 타임스탬프 (0이면 쿨다운 없음)
  touchCooldownAt: number;

  // @MX:NOTE: [AUTO] SPEC-SETTINGS-001: 감정 상태 지속성 설정 (기본값: false = 매일 초기화)
  // @MX:SPEC: SPEC-SETTINGS-001 REQ-PERSIST-001
  persistEmotion: boolean;

  // SPEC-TOUCH-001: 터치 가능 여부 확인 (1초 쿨다운 체크)
  canTouch: () => boolean;

  // SPEC-TOUCH-001: happy 상태 트리거 (2초 후 idle 자동 복귀)
  triggerHappy: () => void;

  // 초기화 완료 플래그 (리프레시 시 깜빡임 방지)
  isInitialized: boolean;
  setInitialized: (initialized: boolean) => void;

  // @MX:NOTE: [AUTO] SPEC-SETTINGS-001: 감정 상태 지속성 토글 액션
  // @MX:SPEC: SPEC-SETTINGS-001 REQ-PERSIST-004
  setPersistEmotion: (value: boolean) => void;
}

/**
 * 젤리 상태 관리를 위한 Zustand Store
 *
 * 상태 머신과 전이 가드를 포함하며,
 * 표정, 애니메이션 파라미터, 감정 상태를 관리한다.
 */
// @MX:ANCHOR: 젤리 상태의 단일 소스 오브 트루스 (REQ-UBI-003)
// @MX:REASON: 모든 컴포넌트가 이 store를 통해 젤리 상태에 접근
// @MX:SPEC: SPEC-JELLY-001 REQ-UBI-003, REQ-STA-001~004, REQ-UNW-004
export const jellyStore = create<JellyStoreState>()(
  devtools(
    persist(
      (set, get) => ({
      // 초기 상태
      currentState: 'idle',

      jellyPosition: { x: 0, y: 0 },

      faceExpression: STATE_FACES.idle,

      animationParams: {
        scale: 1,
        translateY: 0,
        wobble: 0,
      },

      lastEmotion: 'joy',

      isAnalyzing: false,
      analysisError: null,
      emotionHistory: [],

      lastInputText: '',

      // M2: 감정 기반 색상 (초기값: 기본 젤리 색상)
      emotionColor: JELLY_COLOR,

      // 젤리 이름 (온보딩에서 설정)
      jellyName: '',

      // 젤리 외형 모양 (기본값: 퐁당)
      jellyShape: 'ppung',

      // SPEC-JELLY-003: 마지막 접속 날짜 (로컬 타임존 YYYY-MM-DD)
      lastAccessDate: '',

      // SPEC-TOUCH-001: 터치 쿨다운 타임스탬프
      touchCooldownAt: 0,

      // @MX:NOTE: [AUTO] SPEC-SETTINGS-001: 감정 상태 지속성 (기본값: false)
      // @MX:SPEC: SPEC-SETTINGS-001 REQ-PERSIST-001
      persistEmotion: false,

      // 초기화 완료 플래그 (기본값 false, BridgeInitializer에서 true 설정)
      isInitialized: false,

      // 상태 전이 (가드 조건 검증)
      transitionState: (newState: JellyState) => {
        const currentState = get().currentState;

        // 유효한 전이인지 확인
        const validTransitions = TRANSITION_MAP[currentState];
        if (!validTransitions || !validTransitions.includes(newState)) {
          console.warn(
            `무효한 상태 전이: ${currentState} -> ${newState}. ` +
              `유효한 전이: ${validTransitions?.join(', ') || '없음'}`,
          );
          return false;
        }

        // 상태 전이 및 표정 업데이트
        set({
          currentState: newState,
          faceExpression: STATE_FACES[newState],
        });

        return true;
      },

      // 표정 업데이트
      setFaceExpression: (face: Partial<JellyFace>) => {
        set((state) => ({
          faceExpression: {
            ...state.faceExpression,
            ...face,
          },
        }));
      },

      // 애니메이션 파라미터 업데이트
      setAnimationParams: (params) => {
        set((state) => ({
          animationParams: {
            ...state.animationParams,
            ...params,
          },
        }));
      },

      // 위치 업데이트
      setJellyPosition: (position) => {
        set({ jellyPosition: position });
      },

      // 마지막 감정 설정
      setLastEmotion: (emotion: EmotionType) => {
        set({ lastEmotion: emotion });
      },

      // M1: 분석 중 상태 설정
      setAnalyzing: (value: boolean) => {
        set({ isAnalyzing: value });
      },

      // M1: 분석 에러 설정
      setAnalysisError: (error: string | null) => {
        set({ analysisError: error });
      },

      // M2: 감정 색상 직접 설정
      setEmotionColor: (color: string) => {
        set({ emotionColor: color });
      },

      // M1: 감정 분석 결과 추가
      // emotionColor는 구슬 섭취 완료 후 page.tsx에서 적용
      // diaryStore에도 일기 엔트리로 자동 저장
      addEmotionResult: async (result: AnalysisResponse) => {
        set((state) => ({
          emotionHistory: [...state.emotionHistory, result],
        }));

        // diaryStore에 일기 엔트리로 저장
        const inputText = get().lastInputText;
        if (inputText) {
          await diaryStore.getState().addEntry({
            text: inputText,
            emotion: result.emotion,
            confidence: result.confidence,
            emotionKo: result.emotionKo,
          });
        }
      },

      // 마지막 입력 텍스트 설정
      setLastInputText: (text: string) => {
        set({ lastInputText: text });
      },

      // 젤리 이름 설정
      setJellyName: (name: string) => {
        set({ jellyName: name });
      },

      // 젤리 모양 설정
      setJellyShape: (shape: JellyShape) => {
        set({ jellyShape: shape });
      },

      // @MX:NOTE: [AUTO] SPEC-JELLY-003: 다이어리 기반 일일 상태 초기화
      // @MX:REASON: 무조건 다이어리 데이터가 1순위. 다이어리가 없으면 초기화
      // @MX:NOTE: [AUTO] SPEC-SETTINGS-001: persistEmotion 분기 추가
      // @MX:SPEC: SPEC-JELLY-003, SPEC-SETTINGS-001 REQ-PERSIST-002
      checkDiaryAndReset: async (userId: string) => {
        const today = new Date().toISOString().split('T')[0];

        try {
          // 무조건 다이어리 확인 (날짜 상관없음)
          const hasDiary = await hasTodayDiary(userId);

          if (!hasDiary) {
            const { jellyShape, jellyName, touchCooldownAt, persistEmotion } = get();

            if (persistEmotion) {
              // @MX:NOTE: [AUTO] SPEC-SETTINGS-001: 감정 유지 모드
              // @MX:REASON: persistEmotion=true면 감정 보존, transient 상태만 리셋
              set({
                currentState: 'idle',
                faceExpression: STATE_FACES.idle,
                lastAccessDate: today,
                jellyShape,
                jellyName,
                touchCooldownAt,
              });
            } else {
              // 다이어리가 없으면 무조건 감정 상태 초기화
              // jellyShape, jellyName, touchCooldownAt은 보존
              set({
                lastEmotion: 'joy',
                emotionColor: JELLY_COLOR,
                currentState: 'idle',
                faceExpression: STATE_FACES.idle,
                emotionHistory: [],
                lastAccessDate: today,
                jellyShape,
                jellyName,
                touchCooldownAt,
              });
            }
          } else {
            // @MX:NOTE: [AUTO] 다이어리가 있어도 애니메이션 상태는 항상 idle로 리셋
            // @MX:REASON: satisfied/eating은 일시적 UI 상태, 리프레시 후 복원 불가
            const { jellyShape, jellyName, touchCooldownAt, lastEmotion, emotionColor } = get();
            set({
              currentState: 'idle',
              faceExpression: STATE_FACES.idle,
              lastAccessDate: today,
              // 아래 값들은 보존 (오늘의 감정 데이터)
              jellyShape,
              jellyName,
              touchCooldownAt,
              lastEmotion,
              emotionColor,
            });
          }
        } catch {
          // Supabase 조회 실패 시 날짜만 업데이트 (기존 상태 유지)
          set({ lastAccessDate: today });
        }
      },

      // @MX:NOTE: [AUTO] SPEC-TOUCH-001 REQ-TOUCH-004: 1초 쿨다운 체크
      // @MX:REASON: 연속 터치 방지, touchCooldownAt 기준 1000ms 이내면 false
      canTouch: () => {
        const { touchCooldownAt } = get();
        if (touchCooldownAt === 0) return true;
        return Date.now() - touchCooldownAt >= 1000;
      },

      // @MX:NOTE: [AUTO] SPEC-TOUCH-001 REQ-TOUCH-002: happy 상태 트리거 + 2초 후 idle 자동 복귀
      // @MX:REASON: idle 상태에서만 호출 가능, transitionState 가드가 상태 검증
      triggerHappy: () => {
        const currentState = get().currentState;
        const validTransitions = TRANSITION_MAP[currentState];
        if (!validTransitions || !validTransitions.includes('happy')) {
          return;
        }

        set({
          currentState: 'happy',
          faceExpression: STATE_FACES.happy,
          touchCooldownAt: Date.now(),
        });

        // 2초 후 idle로 자동 복귀
        setTimeout(() => {
          const st = get();
          if (st.currentState === 'happy') {
            set({
              currentState: 'idle',
              faceExpression: STATE_FACES.idle,
            });
          }
        }, 2000);
      },

      // 초기화 완료 플래그 설정
      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },

      // @MX:NOTE: [AUTO] SPEC-SETTINGS-001 REQ-PERSIST-004: 감정 상태 지속성 토글
      // @MX:SPEC: SPEC-SETTINGS-001
      setPersistEmotion: (value: boolean) => {
        set({ persistEmotion: value });
      },
    }),
    {
      name: 'jelly-storage',
      version: 5,
      // @MX:NOTE: [AUTO] 순수 UI 상태만 저장 (REQ-UBI-003)
      // @MX:REASON: jellyName→Supabase users.nickname, emotionHistory→Supabase diary_entries로 이전
      // @MX:REASON: currentState는 일시적 애니메이션 상태이므로 persist에서 제외 (v4)
      partialize: (state) => ({
        lastEmotion: state.lastEmotion,
        emotionColor: state.emotionColor,
        // currentState 제거: satisfied/eating 등 일시적 상태가 리프레시 후 복원되는 것 방지
        jellyShape: state.jellyShape as JellyShape,
        // SPEC-JELLY-003 REQ-INIT-001: 마지막 접속 날짜 저장
        lastAccessDate: state.lastAccessDate,
        // @MX:NOTE: [AUTO] SPEC-SETTINGS-001 REQ-PERSIST-005: 감정 지속성 설정 영속 저장
        // @MX:SPEC: SPEC-SETTINGS-001
        persistEmotion: state.persistEmotion,
      }),
      // @MX:NOTE: [AUTO] 하이드레이션 완료 후 lastAccessDate 초기화 (최초 실행 시)
      // @MX:REASON: resetDailyState는 제거됨, 다이어리 기반 초기화는 BridgeInitializer에서 수행
      // @MX:SPEC: SPEC-JELLY-003
      onRehydrateStorage: () => {
        return () => {
          // 하이드레이션 완료 후 최초 실행 시 lastAccessDate 설정
          const { lastAccessDate } = jellyStore.getState();
          if (!lastAccessDate) {
            const today = new Date().toISOString().split('T')[0];
            jellyStore.setState({ lastAccessDate: today });
          }
        };
      },
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown> | undefined;
        // 버전 0 (기존) → 1 마이그레이션
        if (version === 0 && state) {
          return {
            ...state,
            currentState: state.currentState || 'idle',
          };
        }
        // 버전 1 → 2: 젤리 모양 마이그레이션 (기하학적 형태 → 유기적 형태)
        if (version <= 1 && state) {
          const validShapes: JellyShape[] = ['ppung', 'mallang', 'jjit', 'banggeul', 'sillung', 'kkul'];
          const shape = state.jellyShape as string | undefined;
          if (shape && !validShapes.includes(shape as JellyShape)) {
            return {
              ...state,
              jellyShape: 'ppung',
            };
          }
        }
        // 버전 2 → 3: beadCount 제거, lastAccessDate 추가 (SPEC-JELLY-003)
        if (version <= 2 && state) {
          const migrated = { ...state };
          delete (migrated as Record<string, unknown>).beadCount;
          return {
            ...migrated,
            lastAccessDate: '',
          };
        }
        // 버전 3 → 4: currentState 제거 (일시적 애니메이션 상태 persist 방지)
        if (version <= 3 && state) {
          const migrated = { ...state };
          delete (migrated as Record<string, unknown>).currentState;
          return migrated;
        }
        // @MX:NOTE: [AUTO] SPEC-SETTINGS-001 REQ-PERSIST-006: persistEmotion 필드 마이그레이션
        // @MX:SPEC: SPEC-SETTINGS-001
        // 버전 4 → 5: persistEmotion 필드 추가 (기존 사용자는 기본값 false)
        if (version <= 4 && state) {
          return {
            ...state,
            persistEmotion: false,
          };
        }
        return state;
      },
    },
    ),
    {
      name: 'jellyStore',
    },
  ),
);
