/**
 * Banner Ad Component
 *
 * 배너 광고를 표시합니다. report 상태일 때만 하단에 표시됩니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-003)
 */

'use client';

import { useEffect, useState } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import { BANNER_AD_GROUP_ID, BANNER_CONFIG } from '@/lib/ad/adConfig';

interface BannerAdProps {
  /**
   * 배너 표시 여부
   */
  show: boolean;
}

/**
 * 배너 광고 컴포넌트
 */
export function BannerAd({ show }: BannerAdProps) {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (!show) {
      return;
    }

    try {
      // WebView 환경 지원 여부 확인 (isSupported 접근 자체가 에러 발생 가능)
      let isSupported = false;
      try {
        isSupported = GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === true;
      } catch {
        isSupported = false;
      }
      if (!isSupported) {
        return;
      }

      // 배너 광고 로드
      cleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: BANNER_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            setAdLoaded(true);
          }
        },
        onError: (error: unknown) => {
          console.error('[BannerAd] 광고 로드 실패:', error);
          setAdLoaded(false);
        },
      });
    } catch (error) {
      console.error('[BannerAd] 광고 초기화 실패:', error);
    }

    return () => {
      cleanup?.();
    };
  }, [show]);

  // show prop이 false면 즉시 숨김, 로드 전까지도 숨김
  const visible = show && adLoaded;
  if (!visible) {
    return null;
  }

  return (
    <div className="w-full h-[50px] bg-gray-100 flex items-center justify-center">
      {/* 배너 광고 컨테이너 */}
      <div
        className="bg-white border border-gray-200 flex items-center justify-center"
        style={{ width: BANNER_CONFIG.size.width, height: BANNER_CONFIG.size.height }}
      >
        {/* 실제 광고는 AppIntos GoogleAdMob SDK에 의해 렌더링됩니다 */}
        <p className="text-gray-400 text-xs">배너 광고 ({BANNER_CONFIG.size.width}x{BANNER_CONFIG.size.height})</p>
      </div>
    </div>
  );
}
