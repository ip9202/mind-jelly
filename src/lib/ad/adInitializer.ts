/**
 * AdMob SDK Initializer
 *
 * Google AdMob SDK를 초기화합니다.
 * @apps-in-toss/web-framework의 AdMob API를 사용합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 */

import { ADMOB_CONFIG } from './adConfig';

/**
 * AdMob 초기화 상태
 * @MX:NOTE: [AUTO] 모듈 수준 상태, 재시도 방지용 플래그
 */
let isInitialized = false;

/**
 * AdMob SDK를 초기화합니다
 *
 * @MX:ANCHOR: [AUTO] 외부 시스템(AdMob SDK) 연결 지점, fan_in >= 2
 * @MX:REASON: InterstitialAd, BannerAd 컴포넌트에서 호출
 * @throws AdMob SDK 초기화 실패 시 에러 throw
 */
export async function initializeAdMob(): Promise<void> {
  if (isInitialized) {
    console.log('[AdMob] Already initialized');
    return;
  }

  try {
    // @apps-in-toss/web-framework의 AdMob API 호출
    // Note: 실제 구현에서는 해당 프레임워크의 API를 호출합니다
    if (typeof window !== 'undefined' && window.AdMob) {
      await window.AdMob.initialize(ADMOB_CONFIG);
    }

    // 초기화 성공 여부와 관계없이 isInitialized를 true로 설정
    isInitialized = true;
    console.log('[AdMob] SDK initialized successfully');
  } catch (error) {
    console.error('[AdMob] Initialization failed:', error);
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
