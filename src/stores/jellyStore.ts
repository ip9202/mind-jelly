import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { JellyState, JellyFace } from '@/types/physics';
import type { EmotionType, AnalysisResponse } from '@/types/emotion';
import { EMOTION_COLORS, JELLY_COLOR } from '@/lib/constants/emotion';
import { diaryStore } from '@/stores/diaryStore';

// 상태 전이 맵 (유효한 전이만 정의)
const TRANSITION_MAP: Record<string, string[]> = {
  idle: ['anticipation'],
  anticipation: ['eating'],
  eating: ['anticipation', 'satisfied'],
  satisfied: ['idle'],
};

// 상태별 기본 표정
const STATE_FACES: Record<string, JellyFace> = {
  idle: { eyes: '• •', mouth: 'o' },
  anticipation: { eyes: '• •', mouth: 'o' },
  eating: { eyes: 'u u', mouth: 'o' },
  satisfied: { eyes: '^ ^', mouth: '-' },
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
  addEmotionResult: (result: AnalysisResponse) => void;

  // 마지막 입력 텍스트 설정
  setLastInputText: (text: string) => void;

  // M2 액션: 감정 색상
  setEmotionColor: (color: string) => void;
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
      // M2: emotionColor도 감정에 맞게 자동 업데이트
      // diaryStore에도 일기 엔트리로 자동 저장
      addEmotionResult: (result: AnalysisResponse) => {
        set((state) => ({
          emotionHistory: [...state.emotionHistory, result],
          emotionColor: EMOTION_COLORS[result.emotion],
        }));

        // diaryStore에 일기 엔트리로 저장
        const inputText = get().lastInputText;
        if (inputText) {
          diaryStore.getState().addEntry({
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
    }),
    {
      name: 'jellyStore',
    },
  ),
);
