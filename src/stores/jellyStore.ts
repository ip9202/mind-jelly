import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { JellyState, JellyFace, JellyShape } from '@/types/physics';
import type { EmotionType, AnalysisResponse } from '@/types/emotion';
import { JELLY_COLOR } from '@/lib/constants/emotion';
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

  // 구슬 개수
  beadCount: number;

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

  // 액션: 상태 전이
  transitionState: (newState: JellyState) => boolean;

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

  // 액션: 구슬 개수 설정
  setBeadCount: (count: number) => void;

  // 액션: 구슬 개수 증가
  incrementBeadCount: (amount?: number) => void;

  // 액션: 구슬 개수 감소
  decrementBeadCount: (amount?: number) => void;

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

  // SPEC-TOUCH-001: 터치 가능 여부 확인 (1초 쿨다운 체크)
  canTouch: () => boolean;

  // SPEC-TOUCH-001: happy 상태 트리거 (2초 후 idle 자동 복귀)
  triggerHappy: () => void;
}

/**
 * 젤리 상태 관리를 위한 Zustand Store
 *
 * 상태 머신과 전이 가드를 포함하며,
 * 표정, 애니메이션 파라미터, 구슬 개수를 관리한다.
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

      beadCount: 0,

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

      // SPEC-TOUCH-001: 터치 쿨다운 타임스탬프
      touchCooldownAt: 0,

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

      // 구슬 개수 설정
      setBeadCount: (count) => {
        set({ beadCount: count });
      },

      // 구슬 개수 증가
      incrementBeadCount: (amount = 1) => {
        set((state) => ({
          beadCount: Math.max(0, state.beadCount + amount),
        }));
      },

      // 구슬 개수 감소 (음수 방지)
      decrementBeadCount: (amount = 1) => {
        set((state) => ({
          beadCount: Math.max(0, state.beadCount - amount),
        }));
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
    }),
    {
      name: 'jelly-storage',
      version: 2,
      // @MX:NOTE: 순수 UI 상태만 저장 (REQ-UBI-003)
      // @MX:REASON: jellyName→Supabase users.nickname, emotionHistory→Supabase diary_entries로 이전
      partialize: (state) => ({
        lastEmotion: state.lastEmotion,
        emotionColor: state.emotionColor,
        currentState: state.currentState,
        jellyShape: state.jellyShape as JellyShape,
      }),
      migrate: (persistedState: unknown, version: number) => {
        // 버전 0 (기존) → 1 마이그레이션
        const state = persistedState as JellyStoreState | undefined;
        if (version === 0 && state) {
          return {
            ...state,
            currentState: state.currentState || 'idle',
            beadCount: state.beadCount ?? 0,
          };
        }
        // 버전 1 → 2: 젤리 모양 마이그레이션 (기하학적 형태 → 유기적 형태)
        // 이전 모양 값(circle, star, square, triangle, pentagon, hexagon)을 기본값 'ppung'으로 변환
        if (version <= 1 && state) {
          const validShapes: JellyShape[] = ['ppung', 'mallang', 'jjit', 'banggeul', 'sillung', 'kkul'];
          if (state.jellyShape && !validShapes.includes(state.jellyShape)) {
            // 유효하지 않은 모양 값은 기본값으로 대체
            return {
              ...state,
              jellyShape: 'ppung',
            } as JellyStoreState;
          }
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
