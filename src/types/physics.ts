/**
 * 물리 관련 타입 정의
 * REQ-UBI-002, REQ-STA-006
 */

// @MX:ANCHOR: 젤리 상태 타입 (다수 컴포넌트에서 사용)
// @MX:REASON: jellyStore, JellyRenderer, usePhysics 등 5개 이상의 모듈에서 참조
// @MX:SPEC: REQ-STA-001~004, REQ-UNW-004, REQ-TOUCH-002
export type JellyState = 'idle' | 'anticipation' | 'eating' | 'satisfied' | 'happy';

// @MX:ANCHOR: 상태 전이 맵 (무효 전이 방지)
// @MX:REASON: jellyStore에서 상태 전이 유효성 검증에 사용
// @MX:SPEC: REQ-UNW-004, REQ-TOUCH-002
export type TransitionMap = {
  idle: ['anticipation', 'happy'];
  anticipation: ['eating'];
  eating: ['anticipation', 'satisfied'];
  satisfied: ['idle'];
  happy: ['idle'];
};

// @MX:NOTE: 물리 설정 인터페이스
// @MX:SPEC: REQ-UBI-002, REQ-STA-006
export interface PhysicsConfig {
  elasticity: 0.7;
  damping: 0.3;
  friction: 0.1;
  gravityScale: 0.5;
  magneticFieldRadius: 50;
}

// @MX:ANCHOR: 감정 구슬 타입 (다수 컴포넌트에서 사용)
// @MX:REASON: BeadGroup, beadFactory, collisions 등 3개 이상의 모듈에서 참조
// @MX:SPEC: REQ-EVT-005
export interface EmotionBead {
  id: string;
  body: Matter.Body; // Matter.js 물리 바디
  size: 12 | 18 | 24; // 구슬 크기: 소/중/대
  color: string; // 구슬 색상 (16진수)
  createdAt: number; // 생성 타임스탬프
}

// @MX:NOTE: 2D 벡터 타입
export interface Vector {
  x: number;
  y: number;
}

// @MX:NOTE: 젤리 페이스 표정 타입 (상태별 표정 한 쌍)
// @MX:SPEC: REQ-STA-001~004
export interface JellyFace {
  eyes: string;
  mouth: string;
}

// @MX:NOTE: 상태별 페이스 표현 맵
export type JellyFaceMap = Record<JellyState, JellyFace>;

// @MX:NOTE: 젤리 외형 모양 타입 (사용자 설정 가능, 불특정하고 유기체적인 형태)
// @MX:REASON: 설정 페이지에서 사용자가 젤리 기본 모양을 선택할 수 있도록 6종 형태 제공
export type JellyShape = 'ppung' | 'mallang' | 'jjit' | 'banggeul' | 'sillung' | 'kkul';
