/**
 * AppIntos AdMob SDK Initializer
 *
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용하여
 * 광고를 미리 로드합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

import { loadFullScreenAd } from '@apps-in-toss/web-framework';
import { INTERSTITIAL_AD_GROUP_ID, REWARDED_AD_GROUP_ID } from './adConfig';

/**
 * AdMob 초기화 상태
 * @MX:NOTE: [AUTO] 모듈 수준 상태, 재시도 방지용 플래그
 */
let isInitialized = false;

/**
 * 광고 환경 지원 여부 캐시
 */
let supportChecked = false;
let isSupported = false;

/**
 * AppIntos GoogleAdMob 환경 지원 여부를 확인합니다
 */
function checkSupport(): boolean {
  if (supportChecked) return isSupported;

  try {
    isSupported = loadFullScreenAd.isSupported?.() === true;
    supportChecked = true;
    return isSupported;
  } catch {
    supportChecked = true;
    isSupported = false;
    return false;
  }
}

/**
 * AdMob 광고를 미리 로드합니다 (배너, 전면형, 보상형)
 *
 * @MX:ANCHOR: [AUTO] 외부 시스템(AppIntos AdMob SDK) 연결 지점, fan_in >= 2
 * @MX:REASON: InterstitialAd, BannerAd 컴포넌트에서 호출
 */
export async function initializeAdMob(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    if (!checkSupport()) {
      // WebView 외 환경에서는 초기화 성공으로 처리 (광고 없이 동작)
      isInitialized = true;
      return;
    }

    // 전면형 + 보상형 미리 로드 (앱 시작 시 캐시 → show 즉시 호출 가능)
    loadFullScreenAd({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          console.log('[AdMob] 전면형 광고 로드 완료');
        }
      },
      onError: (error: unknown) => {
        console.error('[AdMob] 전면형 광고 로드 실패:', error);
      },
    });

    loadFullScreenAd({
      options: { adGroupId: REWARDED_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          console.log('[AdMob] 보상형 광고 로드 완료');
        }
      },
      onError: (error: unknown) => {
        console.error('[AdMob] 보상형 광고 로드 실패:', error);
      },
    });

    isInitialized = true;
    console.log('[AdMob] SDK 초기화 완료');
  } catch (error) {
    console.error('[AdMob] 초기화 실패:', error);
    // 폴백: 초기화 실패 시에도 isInitialized를 true로 설정하여 재시도 방지
    // 앱은 광고 없이 정상 동작해야 합니다
    isInitialized = true;
  }
}

/**
 * AdMob 초기화 상태를 확인합니다
 * @MX:NOTE: [AUTO] 초기화 상태 조회 헬퍼 함수
 */
export function isAdMobReady(): boolean {
  return isInitialized;
}

/**
 * GoogleAdMob 객체를 직접 반환 (컴포넌트에서 사용)
 * @MX:NOTE: [AUTO] 컴포넌트에서 GoogleAdMob API 직접 접근용
 */
export { loadFullScreenAd, checkSupport as isAdMobSupported };
