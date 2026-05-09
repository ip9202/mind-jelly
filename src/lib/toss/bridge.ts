/**
 * Toss WebView Bridge 유틸리티
 * M4-T3: detectWebView, connectBridge, getDeviceInfo
 * M4-T6: Bridge Fallback (try/catch + timeout)
 */

import type { TossUserInfo, TossDeviceInfo } from '@/types/toss';

/** 기본 브릿지 연결 타임아웃 (ms) */
const BRIDGE_TIMEOUT_MS = 5000;

/**
 * 현재 환경이 Toss WebView인지 감지한다.
 * window.__TOSS_BRIDGE__ 존재 + User-Agent에 'Toss' 포함 여부를 확인한다.
 */
export function detectWebView(): boolean {
  const hasBridge = typeof window !== 'undefined' && !!window.__TOSS_BRIDGE__;
  const hasTossUA =
    typeof navigator !== 'undefined' && navigator.userAgent.includes('Toss');
  return hasBridge && hasTossUA;
}

/**
 * Toss Bridge에 연결하여 사용자 정보를 가져온다.
 * WebView가 아니거나 오류 발생 시 null을 반환한다 (silent fallback).
 *
 * @param timeoutMs - 타임아웃 (기본값: 5000ms)
 */
export async function connectBridge(
  timeoutMs: number = BRIDGE_TIMEOUT_MS,
): Promise<TossUserInfo | null> {
  try {
    if (!detectWebView()) {
      return null;
    }

    const bridge = window.__TOSS_BRIDGE__;
    if (!bridge?.getUserInfo) {
      return null;
    }

    // 타임아웃과 함께 사용자 정보 요청
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });

    const userInfo = await Promise.race([
      bridge.getUserInfo(),
      timeoutPromise,
    ]);

    return userInfo;
  } catch {
    // M4-T6: silent fallback - 에러 메시지 표시하지 않음
    return null;
  }
}

/**
 * Toss Bridge에서 디바이스 정보를 가져온다.
 * getDeviceInfo는 optional이므로 없으면 null을 반환한다.
 */
export async function getDeviceInfo(): Promise<TossDeviceInfo | null> {
  try {
    if (!detectWebView()) {
      return null;
    }

    const bridge = window.__TOSS_BRIDGE__;
    if (!bridge?.getDeviceInfo) {
      return null;
    }

    return await bridge.getDeviceInfo();
  } catch {
    // silent fallback
    return null;
  }
}
