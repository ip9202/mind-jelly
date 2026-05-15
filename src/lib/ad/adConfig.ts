/**
 * AppIntos AdMob Configuration
 *
 * 앱인토스 GoogleAdMob SDK 설정 상수를 정의합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

// ─── 광고 그룹 ID ─────────────────────────────────────────────────────────────
// @MX:WARN: 검토 요청 직전 테스트 ID → 실제 ID 교체 필수
// @MX:REASON: 개발 중 실제 ID 사용은 앱인토스 정책 위반. 심사관이 광고 동작을 직접 확인하므로 검토 요청 시 실제 ID 필요.
//
// 교체 방법: 아래 3개 상수를 주석의 실제 ID로 교체 후 검토 요청
//   BANNER_AD_GROUP_ID      → 'ait.v2.live.d219bdc9c20d477d'
//   INTERSTITIAL_AD_GROUP_ID → 'ait.v2.live.07e208f269914407'
//   REWARDED_AD_GROUP_ID    → 'ait.v2.live.07e7441f22524f3f'

// 배너 광고용 광고 그룹 ID (리스트형)
export const BANNER_AD_GROUP_ID = 'ait-ad-test-banner-id' as const;

// 피드형 배너 광고용 광고 그룹 ID (현재 미사용 — 교체 불필요)
export const NATIVE_AD_GROUP_ID = 'ait-ad-test-native-image-id' as const;

// 전면형 광고용 광고 그룹 ID
export const INTERSTITIAL_AD_GROUP_ID = 'ait-ad-test-interstitial-id' as const;

// 보상형 광고용 광고 그룹 ID
export const REWARDED_AD_GROUP_ID = 'ait-ad-test-rewarded-id' as const;

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
