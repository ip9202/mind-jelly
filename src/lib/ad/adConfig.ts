/**
 * AppIntos AdMob Configuration
 *
 * 앱인토스 GoogleAdMob SDK 설정 상수를 정의합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

// ─── 광고 그룹 ID ─────────────────────────────────────────────────────────────
// @MX:NOTE: 실제 운영 광고 ID 적용 완료 (2026-05-18, hotfix/real-ad-ids)
// 개발 환경 복귀 시 테스트 ID로 교체 필요:
//   BANNER_AD_GROUP_ID      → 'ait-ad-test-banner-id'
//   INTERSTITIAL_AD_GROUP_ID → 'ait-ad-test-interstitial-id'
//   REWARDED_AD_GROUP_ID    → 'ait-ad-test-rewarded-id'

// 배너 광고용 광고 그룹 ID (리스트형)
export const BANNER_AD_GROUP_ID = 'ait.v2.live.d219bdc9c20d477d' as const;

// 피드형 배너 광고용 광고 그룹 ID (현재 미사용 — 교체 불필요)
export const NATIVE_AD_GROUP_ID = 'ait-ad-test-native-image-id' as const;

// 전면형 광고용 광고 그룹 ID
export const INTERSTITIAL_AD_GROUP_ID = 'ait.v2.live.07e208f269914407' as const;

// 보상형 광고용 광고 그룹 ID
export const REWARDED_AD_GROUP_ID = 'ait.v2.live.07e7441f22524f3f' as const;

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
