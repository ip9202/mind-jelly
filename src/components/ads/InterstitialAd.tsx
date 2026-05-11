/**
 * Interstitial Ad Component
 *
 * 전면형 광고를 표시합니다.
 * 5초 후 스킵 버튼을 노출하여 사용자가 광고를 닫을 수 있습니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-002)
 */

'use client';

import { useEffect, useState } from 'react';
import { ADMOB_CONFIG } from '@/lib/ad/adConfig';

interface InterstitialAdProps {
  /**
   * 광고가 닫힐을 때 호출될 콜백
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
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    let skipTimer: NodeJS.Timeout | null = null;
    let isMounted = true;

    async function loadInterstitial() {
      try {
        // @apps-in-toss/web-framework의 AdMob API를 통해 전면형 광고 로드
        if (typeof window !== 'undefined' && window.AdMob) {
          await window.AdMob.loadInterstitial();
        }

        if (!isMounted) return;

        setAdLoaded(true);

        // 5초 후 스킵 버튼 표시
        skipTimer = setTimeout(() => {
          if (isMounted) {
            setShowSkip(true);
          }
        }, ADMOB_CONFIG.interstitial.skipDelay);
      } catch (error) {
        console.error('[InterstitialAd] Failed to load ad:', error);

        if (!isMounted) return;

        if (onLoadError) {
          onLoadError();
        }
      }
    }

    loadInterstitial();

    return () => {
      isMounted = false;
      if (skipTimer) {
        clearTimeout(skipTimer);
      }
    };
  }, [onLoadError]);

  /**
   * 광고를 닫고 report 상태로 전환
   */
  function handleClose() {
    // Note: 실제 구현에서는 AdMob API를 통해 광고를 닫습니다
    onClosed();
  }

  /**
   * 광고를 건너뜁니다 (스킵 버튼)
   */
  function handleSkip() {
    handleClose();
  }

  // 광고가 로드되지 않았으면 아무것도 렌더링하지 않음
  if (!adLoaded) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 전면형 광고 컨테이너 */}
      <div className="relative w-full h-full max-w-md max-h-[80vh] bg-white rounded-lg overflow-hidden">
        {/* Note: 실제 광고는 AdMob SDK에 의해 렌더링됩니다 */}
        <div className="aspect-[9/16] bg-gray-100 flex items-center justify-center">
          {/* Placeholder - 실제 광고가 표시될 영역 */}
          <p className="text-gray-400">광고 영역</p>
        </div>

        {/* 스킵 버튼 (5초 후 표시) */}
        {showSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            건너뛰기
          </button>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute bottom-4 right-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
