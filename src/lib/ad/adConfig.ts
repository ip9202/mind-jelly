/**
 * AppIntos AdMob Configuration
 *
 * 앱인토스 GoogleAdMob SDK 설정 상수를 정의합니다.
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

// 광고 그룹 ID (앱인토스 콘솔에서 발급)
// @MX:NOTE: [AUTO] PLACEHOLDER_AD_GROUP_ID — 앱인토스 심사 후 실제 ID로 교체 필요
// 배너 광고용 광고 그룹 ID
export const BANNER_AD_GROUP_ID = 'PLACEHOLDER_AD_GROUP_ID' as const;

// 전면형 광고용 광고 그룹 ID
export const INTERSTITIAL_AD_GROUP_ID = 'PLACEHOLDER_AD_GROUP_ID' as const;

// 보상형 광고용 광고 그룹 ID
export const REWARDED_AD_GROUP_ID = 'PLACEHOLDER_AD_GROUP_ID' as const;

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
