/**
 * 일기 엔트리 타입 정의
 * 감정 분석 결과를 포함한 일기 기록
 */

import type { EmotionType } from './emotion';

// @MX:NOTE: 일기 엔트리 타입 (localStorage 영속화 대상)
export interface DiaryEntry {
  // 고유 식별자 (crypto.randomUUID())
  id: string;

  // 사용자 입력 텍스트
  text: string;

  // 감정 타입
  emotion: EmotionType;

  // 감정 신뢰도 (0~1)
  confidence: number;

  // 한국어 감정명
  emotionKo: string;

  // 생성 시각 (ISO 8601)
  createdAt: string;

  // 친구 공유 여부 (기본 false)
  isShared: boolean;
}

// @MX:NOTE: 일기 엔트리 생성 시 입력값 (id, createdAt, isShared 자동 생성/기본값)
export type DiaryEntryInput = Omit<DiaryEntry, 'id' | 'createdAt' | 'isShared'>;
