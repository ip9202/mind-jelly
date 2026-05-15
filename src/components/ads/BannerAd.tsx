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
import { loadFullScreenAd } from '@apps-in-toss/web-framework';
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
    if (!show) {
      return;
    }

    if (!loadFullScreenAd.isSupported?.()) return;

    const cleanup = loadFullScreenAd({
      options: { adGroupId: BANNER_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') setAdLoaded(true);
      },
      onError: () => { setAdLoaded(false); },
    });

    return () => {
      cleanup?.();
    };
  }, [show]);

  // show가 false면 렌더링하지 않음 (adLoaded 여부와 무관하게 항상 표시)
  // SDK가 실제 광고 콘텐츠를 주입. SDK 실패 시에도 플레이스홀더 표시로 위치 확인 가능
  if (!show) {
    return null;
  }

  return (
    <div className="w-full h-[50px] bg-gray-100 flex items-center justify-center">
      <div
        className="bg-white border border-gray-200 flex items-center justify-center"
        style={{ width: BANNER_CONFIG.size.width, height: BANNER_CONFIG.size.height }}
      >
        <p className="text-gray-400 text-xs">
          {adLoaded ? '배너 광고' : '광고 로딩 중...'}
        </p>
      </div>
    </div>
  );
}
