/**
 * AppIntos AdMob Configuration
 *
 * 앱인토스 GoogleAdMob SDK 설정 상수를 정의합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

// ─── 광고 그룹 ID ─────────────────────────────────────────────────────────────
// @MX:NOTE: 환경변수에서 광고 ID를 읽음 — 개발/배포 환경 자동 분리
// .env.local       → 테스트 ID (개발 중 사용)
// .env.production  → 실제 운영 ID (ait build/deploy 시 자동 적용)

// 배너 광고용 광고 그룹 ID (리스트형)
export const BANNER_AD_GROUP_ID = process.env.NEXT_PUBLIC_BANNER_AD_GROUP_ID ?? 'ait-ad-test-banner-id';

// 피드형 배너 광고용 광고 그룹 ID (현재 미사용)
export const NATIVE_AD_GROUP_ID = 'ait-ad-test-native-image-id' as const;

// 전면형 광고용 광고 그룹 ID
export const INTERSTITIAL_AD_GROUP_ID = process.env.NEXT_PUBLIC_INTERSTITIAL_AD_GROUP_ID ?? 'ait-ad-test-interstitial-id';

// 보상형 광고용 광고 그룹 ID
export const REWARDED_AD_GROUP_ID = process.env.NEXT_PUBLIC_REWARDED_AD_GROUP_ID ?? 'ait-ad-test-rewarded-id';

// 전면형 광고 설정
// @MX:ANCHOR: [AUTO] 외부 시스템(AppIntos AdMob SDK) 연결 지점, fan_in >= 3
// @MX:REASON: InterstitialAd, BannerAd, RewardedAdModal에서 사용
export const INTERSTITIAL_CONFIG = Object.freeze({
  skipDelay: 5000, // 5초 후 스킵 버튼 표시
});

// 배너 광고 설정
export const BANNER_CONFIG = Object.freeze({
  size: {
    width: 320,
    height: 50,
  },
});

// 고정형 배너 권장 높이 (TossAds 공식 문서: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/BannerAd.md)
export const BANNER_HEIGHT_PX = 96;
