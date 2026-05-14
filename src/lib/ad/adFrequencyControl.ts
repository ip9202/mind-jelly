/**
 * Ad Frequency Controller
 *
 * 광고 노출 빈도를 제어하여 사용자 경험을 보호합니다.
 * localStorage에 세션 카운트와 광고 시청 이력을 영속화합니다.
 *
 * SPEC: SPEC-AD-001 (REQ-AD-004)
 */

/**
 * 사용자 유형
 */
type UserType = 'new' | 'normal' | 'heavy';

/**
 * 광고 시청 이력
 */
interface AdHistory {
  lastSessionDate: string; // ISO 8601 date string
  sessionCount: number; // 총 세션 수
  todaySessionCount: number; // 오늘 세션 수
  todayAdsWatched: number; // 오늘 시청한 광고 수
}

/**
 * Storage keys
 */
const STORAGE_KEY = 'ad_frequency_history';

/**
 * 기본값
 */
const DEFAULT_HISTORY: AdHistory = {
  lastSessionDate: new Date().toISOString().split('T')[0],
  sessionCount: 0,
  todaySessionCount: 0,
  todayAdsWatched: 0,
};

/**
 * localStorage에서 광고 이력을 읽습니다
 */
function getAdHistory(): AdHistory {
  if (typeof window === 'undefined') {
    return DEFAULT_HISTORY;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AdHistory;
    }
  } catch (error) {
    console.error('[AdFrequency] Failed to read history:', error);
  }

  return DEFAULT_HISTORY;
}

/**
 * localStorage에 광고 이력을 저장합니다
 */
function saveAdHistory(history: AdHistory): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('[AdFrequency] Failed to save history:', error);
  }
}

/**
 * 날짜가 변경되었는지 확인합니다
 */
function isDateChanged(history: AdHistory): boolean {
  const today = new Date().toISOString().split('T')[0];
  return history.lastSessionDate !== today;
}

/**
 * 날짜가 변경되면 일일 카운터를 리셋합니다
 */
function resetDailyCounters(history: AdHistory): AdHistory {
  const today = new Date().toISOString().split('T')[0];

  return {
    ...history,
    lastSessionDate: today,
    todaySessionCount: 0,
    todayAdsWatched: 0,
  };
}

/**
 * 세션을 기록합니다
 */
export function recordSession(): void {
  const history = getAdHistory();

  // 날짜 변경 확인 및 리셋
  const updatedHistory = isDateChanged(history)
    ? resetDailyCounters(history)
    : history;

  // 세션 카운트 증가
  updatedHistory.sessionCount += 1;
  updatedHistory.todaySessionCount += 1;

  saveAdHistory(updatedHistory);
}

/**
 * 사용자 유형을 판별합니다
 */
export function getUserType(): UserType {
  const history = getAdHistory();

  // 날짜 변경 확인 및 리셋
  const updatedHistory = isDateChanged(history)
    ? resetDailyCounters(history)
    : history;

  if (updatedHistory.sessionCount < 3) {
    return 'new';
  }

  if (updatedHistory.todaySessionCount >= 5) {
    return 'heavy';
  }

  return 'normal';
}

/**
 * 전면형 광고 표시가 가능한지 확인합니다
 */
export function canShowInterstitial(): boolean {
  const userType = getUserType();
  const history = getAdHistory();

  // 신규 사용자: 모든 광고 차단
  if (userType === 'new') {
    return false;
  }

  // 일반 사용자: 세션당 첫 번째 광고만 허용
  if (userType === 'normal' && history.todayAdsWatched >= 1) {
    return false;
  }

  // 헤비 사용자: 세션당 두 번째 광고까지 허용
  if (userType === 'heavy' && history.todayAdsWatched >= 2) {
    return false;
  }

  return true;
}

/**
 * 광고 시청을 기록합니다
 */
export function recordAdShown(): void {
  const history = getAdHistory();

  // 날짜 변경 확인 및 리셋
  const updatedHistory = isDateChanged(history)
    ? resetDailyCounters(history)
    : history;

  updatedHistory.todayAdsWatched += 1;

  saveAdHistory(updatedHistory);
}

// ─── 보상형 광고 빈도 제어 (SPEC-AD-003 REQ-RWD-007) ───

/**
 * 보상형 광고 빈도 이력
 */
interface RewardedAdFrequency {
  lastDate: string; // YYYY-MM-DD
  dailyCount: number;
}

const REWARDED_STORAGE_KEY = 'rewarded_ad_frequency';

// 세션 내 보상형 광고 시청 횟수 (인메모리, 앱 로드 시 0으로 초기화)
let rewardedSessionCount = 0;

// 일일 최대 보상형 광고 시청 횟수
const DAILY_REWARDED_LIMIT = 3;
// 세션당 최대 보상형 광고 시청 횟수
const SESSION_REWARDED_LIMIT = 1;

/**
 * 보상형 광고 빈도 이력을 localStorage에서 읽습니다
 */
function getRewardedFrequency(): RewardedAdFrequency {
  const today = new Date().toISOString().split('T')[0];

  if (typeof window === 'undefined') {
    return { lastDate: today, dailyCount: 0 };
  }

  try {
    const stored = localStorage.getItem(REWARDED_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as RewardedAdFrequency;
      // 날짜가 변경되면 일일 카운터 리셋
      if (data.lastDate !== today) {
        return { lastDate: today, dailyCount: 0 };
      }
      return data;
    }
  } catch (error) {
    console.error('[AdFrequency] 보상형 광고 이력 읽기 실패:', error);
  }

  return { lastDate: today, dailyCount: 0 };
}

/**
 * 보상형 광고 빈도 이력을 localStorage에 저장합니다
 */
function saveRewardedFrequency(data: RewardedAdFrequency): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(REWARDED_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[AdFrequency] 보상형 광고 이력 저장 실패:', error);
  }
}

/**
 * 보상형 광고 시청 가능 여부 확인
 * 일일 최대 3회, 세션당 최대 1회
 */
export function canShowRewardedAd(): boolean {
  const frequency = getRewardedFrequency();

  // 일일 한도 체크
  if (frequency.dailyCount >= DAILY_REWARDED_LIMIT) {
    return false;
  }

  // 세션 한도 체크
  if (rewardedSessionCount >= SESSION_REWARDED_LIMIT) {
    return false;
  }

  return true;
}

/**
 * 보상형 광고 시청 기록
 * dailyCount와 sessionCount를 모두 증가시킵니다
 */
export function recordRewardedAdShown(): void {
  const frequency = getRewardedFrequency();

  frequency.dailyCount += 1;
  rewardedSessionCount += 1;

  saveRewardedFrequency(frequency);
}

/**
 * 보상형 광고 세션 카운터 초기화 (테스트용)
 */
export function resetRewardedSessionCount(): void {
  rewardedSessionCount = 0;
}
