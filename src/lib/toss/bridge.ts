/**
 * AppIntos WebView Bridge 유틸리티
 * @apps-in-toss/web-framework SDK 기반 WebView 감지 및 사용자 식별
 */

import { getAnonymousKey, getDeviceId } from '@apps-in-toss/web-framework';

import type { TossUserIdentity } from '@/types/toss';

// @MX:NOTE: [AUTO] SDK import 방식 변경: 가짜 window.__TOSS_BRIDGE__ → 실제 @apps-in-toss/web-framework
// @MX:SPEC: SPEC-JELLY-002 M4

/**
 * 현재 환경이 AppIntos WebView인지 감지한다.
 * getDeviceId()는 WebView 환경에서만 정상 동작하므로,
 * 호출 성공 여부로 WebView를 판별한다.
 */
export function detectWebView(): boolean {
  try {
    // getDeviceId는 동기 함수, WebView에서만 유효한 문자열 반환
    const id = getDeviceId();
    return typeof id === 'string' && id.length > 0;
  } catch {
    return false;
  }
}

/**
 * AppIntos SDK에서 사용자 식별 정보를 가져온다.
 * WebView가 아니거나 오류 발생 시 null을 반환한다 (silent fallback).
 *
 * - getDeviceId(): 동기, 기기 고유 ID
 * - getAnonymousKey(): 비동기, 익명 사용자 해시
 */
export async function getUserIdentity(): Promise<TossUserIdentity | null> {
  try {
    if (!detectWebView()) {
      return null;
    }

    const deviceId = getDeviceId();
    const keyResult = await getAnonymousKey();

    // undefined = 지원하지 않는 앱 버전, 'ERROR' = 알 수 없는 오류
    if (!keyResult || keyResult === 'ERROR' || keyResult.type !== 'HASH') {
      return null;
    }

    return {
      anonymousKey: keyResult.hash,
      deviceId,
    };
  } catch {
    // silent fallback - WebView가 아니면 null
    return null;
  }
}
