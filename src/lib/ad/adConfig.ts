/**
 * AdMob Configuration
 *
 * AdMob 광고 설정 상수를 정의합니다.
 * 개발 환경에서는 테스트 광고 ID를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

// AdMob API 타입 정의
// @apps-in-toss/web-framework의 AdMob API 타입
export interface AdMobInterstitialConfig {
  adUnitId: string;
  skipDelay: number;
}

interface AdMobBannerConfig {
  adUnitId: string;
  size: {
    width: number;
    height: number;
  };
}

interface AdMobConfig {
  interstitial: AdMobInterstitialConfig;
  banner: AdMobBannerConfig;
}

export interface AdMobAPI {
  initialize: (config: AdMobConfig) => Promise<void>;
  loadInterstitial: () => Promise<void>;
  loadBanner: () => Promise<void>;
}

// Window 인터페이스 확장
declare global {
  interface Window {
    AdMob?: AdMobAPI;
  }
}

// 테스트 광고 ID (개발 환경)
// @MX:NOTE: [AUTO] Google 공식 테스트 광고 Unit ID
export const TEST_AD_IDS = {
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  banner: 'ca-app-pub-3940256099942544/2934735716',
} as const;

// 프로덕션 광고 ID (앱인토스 샌드박스 테스트 후 적용)
// @MX:NOTE: [AUTO] 앱인토스 심사 통과 후 실제 AdMob Unit ID로 교체 필요
export const PROD_AD_IDS = {
  interstitial: '',
  banner: '',
} as const;

// 현재 환경에 따른 광고 ID 선택
// Note: 테스트 실행 시 NODE_ENV가 'test'로 설정되므로 테스트 환경에서도 테스트 ID를 사용
const getAdIds = () => {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    return PROD_AD_IDS;
  }
  return TEST_AD_IDS;
};

export const AD_IDS = getAdIds();

// AdMob 초기화 설정
const ADMOB_CONFIG_BASE = {
  // 전면형 광고 설정
  interstitial: {
    adUnitId: AD_IDS.interstitial,
    skipDelay: 5000, // 5초 후 스킵 버튼 표시
  },

  // 배너 광고 설정
  banner: {
    adUnitId: AD_IDS.banner,
    size: {
      width: 320,
      height: 50,
    },
  },
} as const;

// 불변 객체로 export (deep freeze)
// @MX:ANCHOR: [AUTO] 외부 시스템(AdMob SDK) 연결 지점, fan_in >= 3
// @MX:REASON: InterstitialAd, BannerAd, adInitializer에서 사용
export const ADMOB_CONFIG = Object.freeze(ADMOB_CONFIG_BASE);
