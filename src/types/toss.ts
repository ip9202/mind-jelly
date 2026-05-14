/**
 * AppIntos WebView 타입 정의
 * 실제 @apps-in-toss/web-framework SDK 기반 타입
 */

// @MX:ANCHOR: AppIntos SDK 타입 (다수 모듈에서 참조)
// @MX:REASON: tossStore, bridge, BridgeInitializer 등에서 사용
// @MX:SPEC: SPEC-JELLY-002 M4

/** AppIntos WebView 사용자 식별 정보 (익명) */
export interface TossUserIdentity {
  /** 익명 사용자 해시 키 (getAnonymousKey 결과) */
  anonymousKey: string;
  /** 기기 고유 식별자 (getDeviceId 결과) */
  deviceId: string;
}

/** 토스 로그인 후 수집된 실명 사용자 정보 */
export interface TossLoginUser {
  /** 이름 (user_name) */
  name: string;
  /** 이메일 (user_email) */
  email: string;
}
