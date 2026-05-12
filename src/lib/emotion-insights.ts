/**
 * 감정 인사이트 계산 유틸리티
 * 개인화된 감정 패턴 분석 로직
 * @MX:SPEC: SPEC-UI-001
 */

import type { EmotionType } from '@/types/emotion';
import type { DiaryEntry } from '@/types/diary';

// @MX:NOTE: 모든 감정 키 배열
const ALL_EMOTIONS: EmotionType[] = [
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope',
];

// @MX:NOTE: 상위 감정 결과 타입
export interface TopEmotionResult {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

// @MX:NOTE: 패턴 변화 결과 타입
export interface PatternChangeResult {
  emotion: EmotionType;
  trend: 'up' | 'down' | 'same';
  message: string;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 감정별 한국어 라벨 매핑
 * @MX:NOTE: 힐링 톤 메시지 생성에 사용
 */
const EMOTION_LABELS: Record<EmotionType, string> = {
  joy: '평온',
  sadness: '우울',
  anger: '분노',
  fear: '불안',
  disgust: '불쾌',
  surprise: '놀람',
  love: '사랑',
  gratitude: '감사',
  hope: '희망',
};

/**
 * 최근 N일간 감정 빈도 집계
 * @MX:ANCHOR: 다수 훅/컴포넌트에서 참조하는 핵심 집계 함수
 * @MX:REASON: topEmotions, patternChange 계산의 기반이 되는 공통 로직
 */
export function calculateTopEmotions(
  entries: DiaryEntry[],
  days: number = 7,
): TopEmotionResult[] {
  if (entries.length === 0) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);

  // 최근 N일 엔트리 필터링
  const recentEntries = entries.filter(
    (entry) => new Date(entry.createdAt) >= cutoff,
  );

  if (recentEntries.length === 0) return [];

  // 감정별 카운트
  const countMap: Record<EmotionType, number> = {
    joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0,
    surprise: 0, love: 0, gratitude: 0, hope: 0,
  };

  recentEntries.forEach((entry) => {
    countMap[entry.emotion] += 1;
  });

  const total = recentEntries.length;

  // 빈도순 정렬 후 상위 3개 추출
  const sorted = ALL_EMOTIONS
    .filter((e) => countMap[e] > 0)
    .sort((a, b) => countMap[b] - countMap[a]);

  const top3 = sorted.slice(0, 3);

  // 퍼센트 계산 (마지막 항목에 남은 퍼센트 할당)
  let remainingPercentage = 100;
  const results: TopEmotionResult[] = top3.map((emotion, index) => {
    const count = countMap[emotion];
    let percentage: number;

    if (index === top3.length - 1) {
      percentage = remainingPercentage;
    } else {
      percentage = Math.round((count / total) * 100);
      remainingPercentage -= percentage;
    }

    return { emotion, count, percentage };
  });

  return results;
}

/**
 * 감정 패턴 변화 감지
 * 최근 3일 vs 이전 3~4일 비교
 * @MX:NOTE: 변화가 의미 있는 경우만 반환, 없으면 null
 */
export function detectPatternChange(
  entries: DiaryEntry[],
): PatternChangeResult | null {
  if (entries.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 최근 3일 (오늘 포함)
  const recentStart = new Date(today);
  recentStart.setDate(recentStart.getDate() - 2);

  // 이전 3일 (최근 3일 이전)
  const prevStart = new Date(today);
  prevStart.setDate(prevStart.getDate() - 5);
  const prevEnd = new Date(recentStart);

  // 각 기간별 감정 분포 계산
  const recentDist = getEmotionDistribution(entries, recentStart, 3);
  const prevDist = getEmotionDistribution(entries, prevStart, 3);

  const recentTotal = Object.values(recentDist).reduce((a, b) => a + b, 0);
  const prevTotal = Object.values(prevDist).reduce((a, b) => a + b, 0);

  // 데이터가 부족하면 null 반환
  if (recentTotal === 0 || prevTotal === 0) return null;

  // 가장 큰 변화를 보인 감정 찾기
  let maxChange = 0;
  let changeEmotion: EmotionType | null = null;
  let changeDirection: 'up' | 'down' | 'same' = 'same';

  ALL_EMOTIONS.forEach((emotion) => {
    const recentRatio = recentDist[emotion] / recentTotal;
    const prevRatio = prevDist[emotion] / prevTotal;
    const change = recentRatio - prevRatio;

    if (Math.abs(change) > Math.abs(maxChange) ||
        (Math.abs(change) === Math.abs(maxChange) && change > maxChange)) {
      maxChange = change;
      changeEmotion = emotion;
      changeDirection = change > 0 ? 'up' : 'down';
    }
  });

  // 변화가 미미하면 null 반환 (10%p 미만)
  const threshold = 0.1;
  if (Math.abs(maxChange) < threshold || !changeEmotion) return null;

  const label = EMOTION_LABELS[changeEmotion];
  // @MX:NOTE: changeDirection은 항상 'up' 또는 'down'이 보장됨
  // (maxChange !== 0일 때만 이 경로에 도달하므로)
  const resolvedDirection: 'up' | 'down' = changeDirection === 'same' ? 'up' : changeDirection === 'down' ? 'down' : 'up';
  const message = resolvedDirection === 'down'
    ? `이번 주 ${label}이 줄었어!`
    : `이번 주 ${label}이 늘었어!`;

  return {
    emotion: changeEmotion,
    trend: resolvedDirection,
    message,
  };
}

/**
 * 연속 일기 작성 일수(스트릭) 계산
 * 오늘부터 거꾸로 연속된 날짜 카운트
 * @MX:NOTE: gap이 1일인 경우 연속으로 계산
 */
export function calculateStreak(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;

  // 고유 날짜 집합 생성 (YYYY-MM-DD)
  const uniqueDates = new Set<string>();
  entries.forEach((entry) => {
    uniqueDates.add(formatDateKey(new Date(entry.createdAt)));
  });

  // 오늘부터 거꾸로 연속 일수 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const checkDate = new Date(today);

  while (uniqueDates.has(formatDateKey(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

/**
 * 특정 기간의 감정별 빈도 분포 계산 (내부 유틸)
 */
function getEmotionDistribution(
  entries: DiaryEntry[],
  start: Date,
  days: number,
): Record<EmotionType, number> {
  const dist: Record<EmotionType, number> = {
    joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0,
    surprise: 0, love: 0, gratitude: 0, hope: 0,
  };

  const end = new Date(start);
  end.setDate(end.getDate() + days);

  entries
    .filter((entry) => {
      const d = new Date(entry.createdAt);
      return d >= start && d < end;
    })
    .forEach((entry) => {
      dist[entry.emotion] += 1;
    });

  return dist;
}
