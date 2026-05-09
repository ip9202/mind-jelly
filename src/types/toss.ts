/**
 * Toss WebView Bridge 타입 정의
 * M4-T1: TossUserInfo, TossBridgeAPI, Window 확장
 */

// @MX:ANCHOR: Toss Bridge 타입 (다수 모듈에서 참조)
// @MX:REASON: tossStore, bridge, BridgeInitializer, home/page 등에서 사용
// @MX:SPEC: SPEC-JELLY-002 M4

/** Toss 사용자 정보 */
export interface TossUserInfo {
  name: string;
  userId: string;
}

/** Toss WebView 디바이스 정보 */
export interface TossDeviceInfo {
  darkMode: boolean;
  screenWidth: number;
}

/** Toss Bridge API 인터페이스 */
export interface TossBridgeAPI {
  getUserInfo(): Promise<TossUserInfo>;
  getDeviceInfo?: () => Promise<TossDeviceInfo>;
}

/** Window 확장: 전역 브릿지 객체 */
declare global {
  interface Window {
    __TOSS_BRIDGE__?: TossBridgeAPI;
  }
}

export {};
