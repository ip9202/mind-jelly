'use client';

/**
 * Toss Bridge 초기화 클라이언트 컴포넌트
 * M4-T4: App Init Bridge Connection
 *
 * 서버 컴포넌트인 layout.tsx에서 사용하기 위한
 * 클라이언트 측 브릿지 초기화 래퍼.
 * Non-blocking: 앱 렌더를 지연시키지 않는다.
 */

import { useEffect } from 'react';

import { tossStore } from '@/stores/tossStore';
import { detectWebView, connectBridge } from '@/lib/toss/bridge';

export default function BridgeInitializer() {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // WebView 감지
      const isWebView = detectWebView();
      tossStore.getState().setWebView(isWebView);

      if (!isWebView) {
        return;
      }

      // 브릿지 연결 시도 (non-blocking)
      try {
        const userInfo = await connectBridge();
        if (cancelled) return;

        if (userInfo) {
          tossStore.getState().setUserInfo(userInfo);
        }
        tossStore.getState().setBridgeReady(true);
      } catch {
        // M4-T6: silent fallback
        tossStore.getState().setWebView(false);
        tossStore.getState().setUserInfo(null);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // 렌더링하지 않음 - 초기화만 수행
  return null;
}
