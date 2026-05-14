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
import { GoogleAdMob } from '@apps-in-toss/web-framework';
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
  const [adLoaded, setAdLoaded] = useState(false);
  const [adShown, setAdShown] = useState(false);

  // 광고 미리 로드
  useEffect(() => {
    let loadCleanup: (() => void) | undefined;

    try {
      // WebView 환경 지원 여부 확인
      if (GoogleAdMob.loadAppsInTossAdMob.isSupported?.() !== true) {
        // WebView 외 환경에서는 광고 없이 바로 닫기
        onLoadError?.();
        return;
      }

      // 전면형 광고 미리 로드
      loadCleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            setAdLoaded(true);
          }
        },
        onError: (error: unknown) => {
          console.error('[InterstitialAd] 광고 로드 실패:', error);
          onLoadError?.();
        },
      });
    } catch (error) {
      console.error('[InterstitialAd] 광고 초기화 실패:', error);
      onLoadError?.();
    }

    return () => {
      loadCleanup?.();
    };
  }, [onLoadError]);

  // 광고가 로드되면 show API 호출
  useEffect(() => {
    if (!adLoaded || adShown) return;

    let showCleanup: (() => void) | undefined;
    let skipTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      if (GoogleAdMob.showAppsInTossAdMob.isSupported?.() !== true) {
        return;
      }

      showCleanup = GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
        onEvent: (event) => {
          switch (event.type) {
            case 'requested':
              // 광고 노출 요청 완료
              setAdShown(true);
              // 5초 후 스킵 버튼 표시
              skipTimer = setTimeout(() => {
                setShowSkip(true);
              }, INTERSTITIAL_CONFIG.skipDelay);
              // 광고 시청 기록
              recordAdShown();
              break;
            case 'dismissed':
              // 사용자가 광고를 닫음
              onClosed();
              break;
            case 'failedToShow':
              console.error('[InterstitialAd] 광고 표시 실패');
              onClosed();
              break;
            case 'impression':
              // 광고 노출 — analytics용
              break;
          }
        },
        onError: (error: unknown) => {
          console.error('[InterstitialAd] 광고 표시 에러:', error);
          onClosed();
        },
      });
    } catch (error) {
      console.error('[InterstitialAd] 광고 표시 실패:', error);
      onClosed();
    }

    return () => {
      showCleanup?.();
      if (skipTimer) {
        clearTimeout(skipTimer);
      }
    };
  }, [adLoaded, adShown, onClosed]);

  /**
   * 광고를 건너뜁니다 (스킵 버튼)
   */
  function handleSkip() {
    onClosed();
  }

  // 광고가 표시되지 않았으면 아무것도 렌더링하지 않음
  if (!adShown) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 전면형 광고 컨테이너 */}
      <div className="relative w-full h-full max-w-md max-h-[80vh] bg-white rounded-lg overflow-hidden">
        {/* 실제 광고는 AppIntos GoogleAdMob SDK에 의해 렌더링됩니다 */}
        <div className="aspect-[9/16] bg-gray-100 flex items-center justify-center">
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
          onClick={handleSkip}
          className="absolute bottom-4 right-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
