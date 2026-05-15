/**
 * Banner Ad Component
 *
 * 배너 광고를 표시합니다. report 상태일 때만 하단에 표시됩니다.
 * TossAds.attachBanner API 사용 (전면/보상형의 loadFullScreenAd와 별개).
 * TossAds.initialize는 adInitializer.ts에서 앱 시작 시 1회 호출됨.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-003)
 */

'use client';

import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import { BANNER_AD_GROUP_ID, BANNER_HEIGHT_PX } from '@/lib/ad/adConfig';

interface BannerAdProps {
  show: boolean;
}

export function BannerAd({ show }: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !containerRef.current) return;
    if (!TossAds.attachBanner.isSupported?.()) return;

    const attached = TossAds.attachBanner(BANNER_AD_GROUP_ID, containerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: {
        onAdFailedToRender: (payload) => console.error('[BannerAd] 렌더링 실패:', payload.error.message),
        onNoFill: () => console.warn('[BannerAd] 표시할 광고 없음'),
      },
    });

    return () => {
      attached?.destroy();
    };
  }, [show]);

  if (!show) return null;

  return <div ref={containerRef} style={{ width: '100%', height: `${BANNER_HEIGHT_PX}px` }} />;
}
