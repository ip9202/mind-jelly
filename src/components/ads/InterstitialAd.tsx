/**
 * Interstitial Ad Component
 *
 * 전면형 광고를 표시합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-002)
 */

'use client';

import { useEffect } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { INTERSTITIAL_AD_GROUP_ID } from '@/lib/ad/adConfig';
import { recordAdShown } from '@/lib/ad/adFrequencyControl';

interface InterstitialAdProps {
  /**
   * 광고가 닫힐 때 호출될 콜백
   */
  onClosed: () => void;

  /**
   * 광고 로드 실패 시 호출될 콜백
   */
  onLoadError?: () => void;
}

/**
 * 전면형 광고 컴포넌트
 * SDK가 자체 전체화면 UI를 처리하므로 커스텀 오버레이 없이 side-effect만 담당.
 */
export function InterstitialAd({ onClosed, onLoadError }: InterstitialAdProps) {
  useEffect(() => {
    recordAdShown();

    // SDK 미지원 환경 (브라우저 등)은 즉시 닫기
    if (!loadFullScreenAd.isSupported?.()) {
      onClosed();
      return;
    }

    let loadUnregister: (() => void) | undefined;
    let showUnregister: (() => void) | undefined;

    loadUnregister = loadFullScreenAd({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded' && showFullScreenAd.isSupported?.()) {
          showUnregister = showFullScreenAd({
            options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
            onEvent: (e) => {
              if (e.type === 'dismissed' || e.type === 'failedToShow') onClosed();
            },
            onError: () => onClosed(),
          });
        }
      },
      onError: () => {
        onLoadError?.();
        onClosed();
      },
    });

    return () => {
      loadUnregister?.();
      showUnregister?.();
    };
  }, [onClosed, onLoadError]);

  // SDK가 전체화면 UI를 직접 렌더링 — 컴포넌트는 아무것도 출력하지 않음
  return null;
}
