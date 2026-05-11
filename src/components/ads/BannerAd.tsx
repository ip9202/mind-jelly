/**
 * Banner Ad Component
 *
 * 배너 광고를 표시합니다. report 상태일 때만 하단에 표시됩니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-003)
 */

'use client';

import { useEffect, useState } from 'react';
import { ADMOB_CONFIG } from '@/lib/ad/adConfig';

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
    let isMounted = true;

    async function loadBanner() {
      if (!show) {
        setAdLoaded(false);
        return;
      }

      try {
        // @apps-in-toss/web-framework의 AdMob API를 통해 배너 광고 로드
        if (typeof window !== 'undefined' && window.AdMob) {
          await window.AdMob.loadBanner();
        }

        if (isMounted) {
          setAdLoaded(true);
        }
      } catch (error) {
        console.error('[BannerAd] Failed to load ad:', error);
        // 배너 로드 실패 시 빈 공간으로 처리 (레이아웃에 영향 없음)
        if (isMounted) {
          setAdLoaded(false);
        }
      }
    }

    loadBanner();

    return () => {
      isMounted = false;
    };
  }, [show]);

  // show가 false이거나 광고가 로드되지 않았으면 아무것도 렌더링하지 않음
  if (!show || !adLoaded) {
    return null;
  }

  return (
    <div className="w-full h-[50px] bg-gray-100 flex items-center justify-center">
      {/* 배너 광고 컨테이너 */}
      <div
        className="w-[320px] h-[50px] bg-white border border-gray-200 flex items-center justify-center"
        style={{ width: ADMOB_CONFIG.banner.size.width, height: ADMOB_CONFIG.banner.size.height }}
      >
        {/* Note: 실제 광고는 AdMob SDK에 의해 렌더링됩니다 */}
        <p className="text-gray-400 text-xs">배너 광고 (320x50)</p>
      </div>
    </div>
  );
}
