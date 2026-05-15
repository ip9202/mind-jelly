'use client';

/**
 * AppIntos Bridge 초기화 클라이언트 컴포넌트
 *
 * 서버 컴포넌트인 layout.tsx에서 사용하기 위한
 * 클라이언트 측 브릿지 초기화 래퍼.
 * Non-blocking: 앱 렌더를 지연시키지 않는다.
 */

import { useEffect } from 'react';

import { initSupabaseSession } from '@/lib/supabase/auth';
import { getMyProfile } from '@/lib/supabase/db';
import { tossStore } from '@/stores/tossStore';
import { diaryStore } from '@/stores/diaryStore';
import { jellyStore } from '@/stores/jellyStore';
import { rewardStore } from '@/stores/rewardStore';
import { detectWebView, getUserIdentity } from '@/lib/toss/bridge';
import { initializeAdMob } from '@/lib/ad/adInitializer';
import { recordSession, initAdImpressionCache } from '@/lib/ad/adFrequencyControl';

export default function BridgeInitializer() {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 세션 기록 + 광고 SDK 초기화 (항상 실행)
      recordSession();
      initializeAdMob();

      // Supabase 익명 세션 초기화 (WebView 여부와 무관하게 항상 실행)
      const supabaseUserId = await initSupabaseSession();
      if (supabaseUserId && !cancelled) {
        // 일기 데이터 로드
        await diaryStore.getState().setUserId(supabaseUserId);

        // @MX:NOTE: [AUTO] 다이어리 존재 여부에 따른 젤리 상태 초기화
        // 오늘 작성한 다이어리가 없으면 감정 상태를 기본값으로 리셋
        if (!cancelled) {
          await jellyStore.getState().checkDiaryAndReset(supabaseUserId);
        }

        // 초기화 완료: 깜빡임 방지를 위해 스켈레톤 해제
        if (!cancelled) {
          jellyStore.getState().setInitialized(true);
        }

        // @MX:NOTE: [AUTO] SPEC-SYNC-001 M7: 병렬 하이드레이션 (REQ-SYNC-002)
        // Supabase에서 프로필/스킨/광고데이터를 병렬로 로드
        // @MX:SPEC: SPEC-SYNC-001 REQ-SYNC-002
        const today = new Date().toISOString().split('T')[0];
        await Promise.all([
          jellyStore.getState().hydrateFromSupabase(supabaseUserId).catch(() => {}),
          rewardStore.getState().hydrateFromSupabase().catch(() => {}),
          initAdImpressionCache(supabaseUserId, today).catch(() => {}),
        ]);

        // Supabase nickname → jellyStore 동기화 (서버가 단일 소스)
        const profile = await getMyProfile(supabaseUserId);
        if (profile?.nickname && !cancelled) {
          jellyStore.getState().setJellyName(profile.nickname);
        }

        // @MX:NOTE: [AUTO] 닉네임 미설정 시 /welcome으로 리다이렉트
        // 데이터 초기화 후 새 익명 사용자는 닉네임이 없으므로 온보딩 페이지로 유도
        if (!cancelled) {
          const currentPath = window.location.pathname;

          // 닉네임 없고 /welcome이 아니면 → 온보딩으로
          if (!profile?.nickname && currentPath !== '/welcome') {
            window.location.href = '/welcome';
            return;
          }

          // 닉네임 있는데 /welcome에 있으면 → 홈으로
          if (profile?.nickname && currentPath === '/welcome') {
            window.location.href = '/home';
            return;
          }
        }
      }

      // WebView 감지
      const isWebView = detectWebView();
      tossStore.getState().setWebView(isWebView);

      if (!isWebView) {
        return;
      }

      // SDK 사용자 식별 정보 조회 (non-blocking)
      try {
        const identity = await getUserIdentity();
        if (cancelled) return;

        if (identity) {
          tossStore.getState().setUserIdentity(identity);
        }
        tossStore.getState().setBridgeReady(true);
      } catch {
        // silent fallback
        tossStore.getState().setWebView(false);
        tossStore.getState().setUserIdentity(null);
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
