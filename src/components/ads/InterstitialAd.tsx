/**
 * Interstitial Ad Component
 *
 * 전면형 광고를 표시합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-002)
 */

'use client';

import { useEffect, useRef } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { INTERSTITIAL_AD_GROUP_ID } from '@/lib/ad/adConfig';
import { recordAdShown } from '@/lib/ad/adFrequencyControl';

interface InterstitialAdProps {
  onClosed: () => void;
  onLoadError?: () => void;
}

export function InterstitialAd({ onClosed, onLoadError }: InterstitialAdProps) {
  const onClosedRef = useRef(onClosed);
  const onLoadErrorRef = useRef(onLoadError);

  // ref 동기화는 useEffect 내에서 처리 (react-hooks/refs 규칙 준수)
  useEffect(() => {
    onClosedRef.current = onClosed;
    onLoadErrorRef.current = onLoadError;
  });

  // 마운트 시 1회만 카운트 기록
  useEffect(() => {
    if (!loadFullScreenAd.isSupported?.()) {
      onClosedRef.current();
      return;
    }
    recordAdShown();
  }, []);

  // 광고 로드/표시는 ref 기반으로 안정적으로 관리
  useEffect(() => {
    if (!loadFullScreenAd.isSupported?.()) return;

    let showUnregister: (() => void) | undefined;

    const loadUnregister = loadFullScreenAd({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded' && showFullScreenAd.isSupported?.()) {
          showUnregister = showFullScreenAd({
            options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
            onEvent: (e) => {
              if (e.type === 'failedToShow') {
                onLoadErrorRef.current?.();
                onClosedRef.current();
              } else if (e.type === 'dismissed') {
                onClosedRef.current();
              }
            },
            onError: () => {
              onLoadErrorRef.current?.();
              onClosedRef.current();
            },
          });
        }
      },
      onError: () => {
        onLoadErrorRef.current?.();
        onClosedRef.current();
      },
    });

    return () => {
      loadUnregister?.();
      showUnregister?.();
    };
  }, []);

  return null;
}
