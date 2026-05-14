/**
 * AppIntos WebView Bridge 유틸리티
 * @apps-in-toss/web-framework SDK 기반 WebView 감지 및 사용자 식별
 */

import { getAnonymousKey, getDeviceId, appLogin, getIsTossLoginIntegratedService } from '@apps-in-toss/web-framework';

import type { TossLoginUser, TossUserIdentity } from '@/types/toss';

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

/**
 * 토스 로그인 실행 → authorizationCode 획득 → Edge Function으로 전달.
 * 성공 시 TossLoginUser(name, email)를 반환한다.
 * WebView가 아니거나 실패 시 null 반환.
 */
export async function signInWithToss(supabaseUserId: string): Promise<TossLoginUser | null> {
  try {
    if (!detectWebView()) return null;

    const { authorizationCode } = await appLogin();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const edgeFnUrl = `${supabaseUrl}/functions/v1/toss-login`;

    const res = await fetch(edgeFnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode, supabaseUserId }),
    });

    if (!res.ok) return null;

    const data = await res.json() as { ok: boolean; name?: string; email?: string };
    if (!data.ok) return null;

    return {
      name: data.name ?? '',
      email: data.email ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * 현재 유저가 토스 로그인을 연동했는지 확인한다.
 * WebView가 아니거나 지원하지 않는 앱 버전이면 false 반환.
 */
export async function checkTossLoginLinked(): Promise<boolean> {
  try {
    if (!detectWebView()) return false;
    const result = await getIsTossLoginIntegratedService();
    return result === true;
  } catch {
    return false;
  }
}

export type { TossLoginUser };
