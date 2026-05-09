/**
 * Toss WebView 상태 관리 Store
 * M4-T2: isWebView, userInfo, isBridgeReady, bridgeError
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { TossUserInfo } from '@/types/toss';

// @MX:ANCHOR: Toss WebView 상태의 단일 소스 오브 트루스
// @MX:REASON: BridgeInitializer, home/page 등 여러 컴포넌트에서 접근
// @MX:SPEC: SPEC-JELLY-002 M4

export interface TossStoreState {
  /** Toss WebView 환경인지 여부 */
  isWebView: boolean;

  /** Toss 사용자 정보 (null이면 비로그인 또는 WebView 아님) */
  userInfo: TossUserInfo | null;

  /** 브릿지 연결 준비 완료 여부 */
  isBridgeReady: boolean;

  /** 브릿지 에러 메시지 (null이면 정상) */
  bridgeError: string | null;

  // Actions
  /** WebView 여부 설정 */
  setWebView: (value: boolean) => void;

  /** 사용자 정보 설정 */
  setUserInfo: (info: TossUserInfo | null) => void;

  /** 브릿지 준비 상태 설정 */
  setBridgeReady: (ready: boolean) => void;

  /** 브릿지 에러 설정 */
  setBridgeError: (error: string | null) => void;

  /** 모든 상태를 초기값으로 리셋 */
  reset: () => void;
}

/**
 * Toss WebView 환경 상태 관리 Zustand Store
 * 브릿지 연결 상태, 사용자 정보, 에러를 관리한다.
 */
export const tossStore = create<TossStoreState>()(
  devtools(
    (set) => ({
      // 초기 상태
      isWebView: false,
      userInfo: null,
      isBridgeReady: false,
      bridgeError: null,

      // Actions
      setWebView: (value: boolean) => {
        set({ isWebView: value });
      },

      setUserInfo: (info: TossUserInfo | null) => {
        set({ userInfo: info });
      },

      setBridgeReady: (ready: boolean) => {
        set({ isBridgeReady: ready });
      },

      setBridgeError: (error: string | null) => {
        set({ bridgeError: error });
      },

      reset: () => {
        set({
          isWebView: false,
          userInfo: null,
          isBridgeReady: false,
          bridgeError: null,
        });
      },
    }),
    {
      name: 'tossStore',
    },
  ),
);
