'use client';

/**
 * AppIntos Bridge 초기화 클라이언트 컴포넌트
 *
 * 서버 컴포넌트인 layout.tsx에서 사용하기 위한
 * 클라이언트 측 브릿지 초기화 래퍼.
 * Non-blocking: 앱 렌더를 지연시키지 않는다.
 *
 * @MX:SPEC: SPEC-SESSION-RECOVER-001 M2 — 부팅 순서 재정렬
 * 새 순서:
 *   1. getUserIdentity() (WebView에서만 유효)  ← 먼저 호출
 *   2. initSupabaseSession({ tossHash }) — 해시 있으면 recover 우선
 *   3. tossStore.setUserIdentity(identity) — 멱등 가드 적용 (M3)
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

      // @MX:NOTE: [AUTO] SPEC-SESSION-RECOVER-001 — getUserIdentity()를 가장 먼저 호출하여
      // 토스 해시를 확보한 뒤 initSupabaseSession에 전달한다. WebView가 아니면 null이 반환되어
      // 기존 익명 인증 fallback 으로 자연스럽게 흐른다 (REQ-SESSION-020).
      const isWebView = detectWebView();
      tossStore.getState().setWebView(isWebView);

      let identity: Awaited<ReturnType<typeof getUserIdentity>> = null;
      let identityErrored = false;
      if (isWebView) {
        try {
          identity = await getUserIdentity();
        } catch {
          identity = null;
          identityErrored = true;
        }
      }

      // Supabase 세션 초기화 (해시 있으면 recover-session 우선)
      const supabaseUserId = await initSupabaseSession(
        identity?.anonymousKey ? { tossHash: identity.anonymousKey } : undefined,
      );

      if (supabaseUserId && !cancelled) {
        // 일기 데이터 로드
        await diaryStore.getState().setUserId(supabaseUserId);

        // @MX:NOTE: [AUTO] 다이어리 존재 여부에 따른 젤리 상태 초기화
        // 오늘 작성한 다이어리가 없으면 감정 상태를 기본값으로 리셋
        if (!cancelled) {
          await jellyStore.getState().checkDiaryAndReset(supabaseUserId);
        }

        // @MX:NOTE: [AUTO] SPEC-SYNC-001 M7: 병렬 하이드레이션 (REQ-SYNC-002)
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

        // 초기화 완료: 닉네임 포함 모든 프로필 로드 후 스켈레톤 해제
        // @MX:WARN: setInitialized는 반드시 setJellyName 이후에 호출해야 함
        // @MX:REASON: 온보딩 버튼 클릭 시 jellyName race condition 방지
        if (!cancelled) {
          jellyStore.getState().setInitialized(true);
        }

        // @MX:NOTE: [AUTO] 닉네임 미설정 시 /welcome으로 리다이렉트
        if (!cancelled) {
          const currentPath = window.location.pathname;

          if (!profile?.nickname && currentPath !== '/welcome' && currentPath !== '/onboarding') {
            window.location.href = '/welcome';
            return;
          }

          if (profile?.nickname && currentPath === '/welcome') {
            window.location.href = '/home';
            return;
          }

          // 기존 유저가 /onboarding 진입 시 자동 이동 안 함 — 버튼 클릭에서 분기
        }
      }

      if (!isWebView) {
        return;
      }

      // getUserIdentity가 예외를 던졌을 때는 WebView 비활성 상태로 되돌린다
      if (identityErrored) {
        tossStore.getState().setWebView(false);
        tossStore.getState().setUserIdentity(null);
        return;
      }

      // WebView일 때 identity를 tossStore에 반영 (멱등 가드는 setUserIdentity 내부에서)
      if (cancelled) return;
      if (identity) {
        tossStore.getState().setUserIdentity(identity);
      }
      tossStore.getState().setBridgeReady(true);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // 렌더링하지 않음 - 초기화만 수행
  return null;
}
