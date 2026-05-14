/**
 * AppIntos WebView 상태 관리 Store
 * isWebView, userIdentity, isBridgeReady, bridgeError
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { linkTossUser } from '@/lib/supabase/auth';
import { diaryStore } from '@/stores/diaryStore';
import type { TossLoginUser, TossUserIdentity } from '@/types/toss';

// @MX:ANCHOR: AppIntos WebView 상태의 단일 소스 오브 트루스
// @MX:REASON: BridgeInitializer, home/page 등 여러 컴포넌트에서 접근
// @MX:SPEC: SPEC-JELLY-002 M4

export interface TossStoreState {
  /** AppIntos WebView 환경인지 여부 */
  isWebView: boolean;

  /** AppIntos 사용자 식별 정보 (null이면 비로그인 또는 WebView 아님) */
  userIdentity: TossUserIdentity | null;

  /** 토스 로그인 후 수집된 실명 정보 (null이면 미연동) */
  tossLoginUser: TossLoginUser | null;

  /** 브릿지 연결 준비 완료 여부 */
  isBridgeReady: boolean;

  /** 브릿지 에러 메시지 (null이면 정상) */
  bridgeError: string | null;

  // Actions
  /** WebView 여부 설정 */
  setWebView: (value: boolean) => void;

  /** 사용자 식별 정보 설정 */
  setUserIdentity: (identity: TossUserIdentity | null) => void;

  /** 토스 로그인 사용자 정보 설정 */
  setTossLoginUser: (user: TossLoginUser | null) => void;

  /** 브릿지 준비 상태 설정 */
  setBridgeReady: (ready: boolean) => void;

  /** 브릿지 에러 설정 */
  setBridgeError: (error: string | null) => void;

  /** 모든 상태를 초기값으로 리셋 */
  reset: () => void;
}

/**
 * AppIntos WebView 환경 상태 관리 Zustand Store
 * SDK 연결 상태, 사용자 식별 정보, 에러를 관리한다.
 */
export const tossStore = create<TossStoreState>()(
  devtools(
    (set) => ({
      // 초기 상태
      isWebView: false,
      userIdentity: null,
      tossLoginUser: null,
      isBridgeReady: false,
      bridgeError: null,

      // Actions
      setWebView: (value: boolean) => {
        set({ isWebView: value });
      },

      setTossLoginUser: (user: TossLoginUser | null) => {
        set({ tossLoginUser: user });
      },

      setUserIdentity: (identity: TossUserIdentity | null) => {
        set({ userIdentity: identity });
        if (identity?.anonymousKey) {
          // 현재 Supabase 익명 세션에 AppIntos 익명 키 연결
          const supabaseUserId = diaryStore.getState().supabaseUserId;
          if (supabaseUserId) {
            // @MX:NOTE: [AUTO] anonymousKey를 tossUserId로 전달하여 사용자 매핑
            linkTossUser(supabaseUserId, identity.anonymousKey).catch(() => {});
          }
        }
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
          userIdentity: null,
          tossLoginUser: null,
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
