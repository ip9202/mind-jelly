/**
 * Ad Frequency Controller
 *
 * 광고 노출 빈도를 제어하여 사용자 경험을 보호합니다.
 * 세션 메모리 캐시 + Supabase로 광고 노출 이력을 관리합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-004), SPEC-SYNC-001 (REQ-SYNC-006)
 */

import { loadTodayAdImpressions, incrementAdImpression } from '@/lib/supabase/db';
import type { AdImpressions } from '@/lib/supabase/db';

// ─── 상수 ───

// @MX:NOTE: [AUTO] 일일 최대 전면형 광고 노출 횟수
const DAILY_INTERSTITIAL_LIMIT = 2;
// @MX:NOTE: [AUTO] 전면형 광고 노출 후 최소 쿨다운 (2시간)
const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 60 * 1000;

// @MX:NOTE: [AUTO] 일일 최대 보상형 광고 시청 횟수
// @MX:SPEC: SPEC-AD-001 (REQ-AD-004)
const DAILY_REWARDED_LIMIT = 3;
// @MX:NOTE: [AUTO] 세션당 최대 보상형 광고 시청 횟수
// @MX:SPEC: SPEC-AD-001 (REQ-AD-004)
const SESSION_REWARDED_LIMIT = 1;

// ─── 캐시 데이터 구조 ───

/**
 * 세션 메모리 캐시 엔트리
 */
interface CacheEntry {
  interstitialCount: number;
  rewardedCount: number;
  // @MX:NOTE: [AUTO] 세션 내 보상형 광고 시청 횟수 (Supabase 미저장, 메모리 전용)
  sessionRewardedCount: number;
  // @MX:NOTE: [AUTO] 마지막 전면형 광고 노출 시각 (ms, 쿨다운 계산용, 메모리 전용)
  lastInterstitialAt: number;
}

// ─── 모듈 상태 ───

/**
 * 광고 노출 세션 캐시
 * 키: `${userId}:${date}`
 */
// @MX:WARN: [AUTO] 모듈 전역 상태 - 테스트 간 resetAdCache()로 초기화 필요
// @MX:REASON: Map이 세션 간 공유되므로 누락 시 테스트 오염 발생
const adImpressionsCache = new Map<string, CacheEntry>();

/**
 * 현재 초기화된 사용자 ID
 */
let currentUserId: string | null = null;

/**
 * 현재 초기화된 날짜
 */
let currentDate: string | null = null;

// ─── 내부 유틸리티 ───

/**
 * 캐시 키 생성
 */
function getCacheKey(userId: string, date: string): string {
  return `${userId}:${date}`;
}

/**
 * 현재 캐시 키 반환 (초기화된 상태에서만 유효)
 */
function getCurrentCacheKey(): string | null {
  if (!currentUserId || !currentDate) return null;
  return getCacheKey(currentUserId, currentDate);
}

/**
 * 현재 캐시 엔트리 반환
 */
function getCurrentEntry(): CacheEntry | null {
  const key = getCurrentCacheKey();
  if (!key) return null;
  return adImpressionsCache.get(key) ?? null;
}

// ─── 공개 API ───

// @MX:NOTE: [AUTO] SPEC-PERF-005 - Supabase RPC 실패 시 최대 3회 재시도
async function retryRpc(fn: () => Promise<void>, label: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      if (i === retries - 1) {
        console.error(`[AdFrequency] ${label} (${retries}회 재시도 실패):`, err);
        return;
      }
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

/**
 * 광고 노출 캐시를 Supabase 데이터로 초기화합니다.
 * 앱 시작 시 BridgeInitializer에서 호출합니다.
 *
 * @param userId - 사용자 ID
 * @param date - 날짜 문자열 (YYYY-MM-DD)
 */
// @MX:ANCHOR: [AUTO] 광고 캐시 초기화 - BridgeInitializer에서 앱 시작 시 호출
// @MX:REASON: 3개 이상 호출부(BridgeInitializer, 테스트, 리셋)에서 참조
export async function initAdImpressionCache(userId: string, date: string): Promise<void> {
  currentUserId = userId;
  currentDate = date;

  const data: AdImpressions = await loadTodayAdImpressions(userId, date);

  const key = getCacheKey(userId, date);
  adImpressionsCache.set(key, {
    interstitialCount: data.interstitialCount,
    rewardedCount: data.rewardedCount,
    sessionRewardedCount: 0,
    lastInterstitialAt: 0,
  });
}

/**
 * 전면형 광고 표시가 가능한지 확인합니다.
 * 일일 2회 한도 + 마지막 노출 후 2시간 쿨다운 적용.
 */
export function canShowInterstitial(): boolean {
  const entry = getCurrentEntry();
  if (!entry) return false;

  // 일일 한도 확인
  if (entry.interstitialCount >= DAILY_INTERSTITIAL_LIMIT) return false;

  // 쿨다운 확인 (첫 노출은 lastInterstitialAt = 0이므로 항상 통과)
  if (entry.lastInterstitialAt > 0 && Date.now() - entry.lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return false;

  return true;
}

/**
 * 보상형 광고 시청 가능 여부를 확인합니다.
 * 캐시 기반 동기 판단 - 일일 한도(3) + 세션 한도(1) 적용
 */
// @MX:ANCHOR: [AUTO] 보상형 광고 빈도 제한 판단 - rewardStore + home/page.tsx에서 호출
// @MX:REASON: 다수 컴포넌트에서 참조하며 비즈니스 로직의 핵심 불변식
export function canShowRewardedAd(): boolean {
  const entry = getCurrentEntry();
  // 캐시가 초기화되지 않았으면 false
  if (!entry) return false;

  // 일일 한도 확인
  if (entry.rewardedCount >= DAILY_REWARDED_LIMIT) return false;

  // 세션 한도 확인
  if (entry.sessionRewardedCount >= SESSION_REWARDED_LIMIT) return false;

  return true;
}

/**
 * 전면형 광고 시청을 기록합니다.
 * 캐시를 즉시 업데이트하고 Supabase RPC를 비동기로 호출합니다.
 */
export function recordAdShown(): void {
  const entry = getCurrentEntry();
  if (!entry || !currentUserId || !currentDate) return;

  // 캐시 즉시 업데이트
  entry.interstitialCount += 1;
  entry.lastInterstitialAt = Date.now();

  // Supabase RPC 비동기 호출 (재시도 포함)
  retryRpc(
    () => incrementAdImpression(currentUserId!, currentDate!, 'interstitial').then(() => {}),
    '전면형 광고 기록',
  );
}

/**
 * 보상형 광고 시청을 기록합니다.
 * 캐시를 즉시 업데이트하고 Supabase RPC를 비동기로 호출합니다.
 */
export function recordRewardedAdShown(): void {
  const entry = getCurrentEntry();
  if (!entry || !currentUserId || !currentDate) return;

  // 캐시 즉시 업데이트
  entry.rewardedCount += 1;
  entry.sessionRewardedCount += 1;

  // Supabase RPC 비동기 호출 (재시도 포함)
  retryRpc(
    () => incrementAdImpression(currentUserId!, currentDate!, 'rewarded').then(() => {}),
    '보상형 광고 기록',
  );
}

/**
 * 광고 캐시 전체 리셋 (테스트용)
 */
export function resetAdCache(): void {
  adImpressionsCache.clear();
  currentUserId = null;
  currentDate = null;
}

// ─── 세션/사용자 추적 (localStorage 미사용, 메모리 전용) ───

/**
 * 사용자 유형
 */
type UserType = 'new' | 'normal' | 'heavy';

let sessionCount = 0;
let todaySessionCount = 0;

/**
 * 세션을 기록합니다
 */
export function recordSession(): void {
  sessionCount += 1;
  todaySessionCount += 1;
}

/**
 * 사용자 유형을 판별합니다
 */
export function getUserType(): UserType {
  if (sessionCount < 1) {
    return 'new';
  }

  if (todaySessionCount >= 5) {
    return 'heavy';
  }

  return 'normal';
}

/**
 * 보상형 광고 세션 카운터 초기화 (테스트용)
 */
export function resetRewardedSessionCount(): void {
  const entry = getCurrentEntry();
  if (entry) {
    entry.sessionRewardedCount = 0;
  }
}
