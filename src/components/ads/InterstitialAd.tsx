/**
 * Interstitial Ad Component
 *
 * 전면형 광고를 표시합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-002)
 */

'use client';

import { useEffect, useState } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { INTERSTITIAL_AD_GROUP_ID, INTERSTITIAL_CONFIG } from '@/lib/ad/adConfig';
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
 */
export function InterstitialAd({ onClosed, onLoadError }: InterstitialAdProps) {
  const [showSkip, setShowSkip] = useState(false);

  // 마운트 즉시 오버레이 표시 + SDK show 호출
  // 보상형과 동일: initializeAdMob()에서 미리 load됐으므로 show만 호출
  useEffect(() => {
    recordAdShown();
    const skipTimer = setTimeout(() => setShowSkip(true), INTERSTITIAL_CONFIG.skipDelay);

    let loadUnregister: (() => void) | undefined;
    let showUnregister: (() => void) | undefined;

    // 문서 기준: loadFullScreenAd → 'loaded' → showFullScreenAd
    if (loadFullScreenAd.isSupported?.()) {
      loadUnregister = loadFullScreenAd({
        options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded' && showFullScreenAd.isSupported?.()) {
            showUnregister = showFullScreenAd({
              options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
              onEvent: (e) => {
                if (e.type === 'dismissed') onClosed();
                if (e.type === 'failedToShow') onClosed();
              },
              onError: () => { /* 오버레이 유지, 스킵으로 닫음 */ },
            });
          }
        },
        onError: () => { /* 오버레이 유지, 스킵으로 닫음 */ },
      });
    }

    return () => {
      clearTimeout(skipTimer);
      loadUnregister?.();
      showUnregister?.();
    };
  }, [onClosed, onLoadError]);

  function handleSkip() {
    onClosed();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full h-full max-w-md max-h-[80vh] bg-white rounded-lg overflow-hidden">
        <div className="aspect-[9/16] bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400">광고 영역</p>
        </div>

        {showSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            건너뛰기
          </button>
        )}

        <button
          onClick={handleSkip}
          className="absolute bottom-4 right-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
