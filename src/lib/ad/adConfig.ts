/**
 * AppIntos AdMob Configuration
 *
 * 앱인토스 GoogleAdMob SDK 설정 상수를 정의합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

// 광고 그룹 ID (앱인토스 테스트 ID — QR 코드 테스트 환경에서 확인 가능)
// @MX:NOTE: [AUTO] 테스트 ID 사용 중 — 출시 전 앱인토스 콘솔 실 ID로 교체 필요
// 배너 광고용 광고 그룹 ID (리스트형)
export const BANNER_AD_GROUP_ID = 'ait-ad-test-banner-id' as const;

// 피드형 배너 광고용 광고 그룹 ID
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
