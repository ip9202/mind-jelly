'use client';

// T-016: TestInput 컴포넌트 (REQ-EVT-005)
import React from 'react';
import { jellyStore } from '@/stores/jellyStore';

/**
 * 테스트용 구슬 생성 버튼 컴포넌트
 */
// @MX:NOTE: 테스트 모드 전용 UI 컴포넌트
// @MX:TEST: T-016
export function TestInput() {
  const handleClick = () => {
    const { beadCount, setBeadCount } = jellyStore.getState();
    setBeadCount(beadCount + 1);
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      구슬 추가
    </button>
  );
}
