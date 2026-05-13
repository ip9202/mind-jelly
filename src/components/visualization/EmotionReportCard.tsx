/**
 * 감정 리포트 카드 컴포넌트
 * SPEC-UI-003: 카드 간소화 (EmotionFace + summary + advice만 표시)
 * 개인화 인사이트는 EmotionStatsBottomSheet 인사이트 탭으로 이동
 * @MX:ANCHOR: [AUTO] 홈 화면 감정 리포트 영역 핵심 컴포넌트
 * @MX:REASON: 사용자가 자신의 감정 패턴을 직관적으로 이해하는 진입점
 * @MX:SPEC: SPEC-UI-003
 */

'use client';

import { EmotionFace } from '@/components/jelly/EmotionFace';
import { useEmotionChartData } from '@/hooks/useEmotionChartData';
import { useEmotionInsights } from '@/hooks/useEmotionInsights';
import { EMOTION_COLORS } from '@/lib/constants/emotion';
import type { EmotionType } from '@/types/emotion';

interface EmotionReportCardProps {
  userName?: string | null;
}

// @MX:NOTE: 모든 유효한 감정 키 집합 (불변 참조)
const VALID_EMOTION_KEYS: ReadonlySet<string> = new Set<EmotionType>([
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope',
]);

// @MX:NOTE: 빈 데이터 상태의 기본 감정값
const DEFAULT_EMOTION: EmotionType = 'joy';

/**
 * 감정 키가 유효한 EmotionType인지 검증
 * @MX:NOTE: 런타임 타입 가드 - 알 수 없는 소스의 emotionKey 방어
 */
function isValidEmotionKey(value: string): value is EmotionType {
  return VALID_EMOTION_KEYS.has(value);
}

/**
 * 안전한 감정 키 반환
 * 유효하지 않은 키는 기본값으로 대체
 */
function safeEmotionKey(key: string | undefined | null): EmotionType {
  if (key && isValidEmotionKey(key)) {
    return key;
  }

  if (key) {
    // @MX:WARN: 유효하지 않은 emotionKey 감지 - 개발 모드에서 경고
    // @MX:REASON: 데이터 무결성 문제의 조기 발견을 위해 콘솔 경고 출력
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[EmotionReportCard] 유효하지 않은 emotionKey: "${key}". "${DEFAULT_EMOTION}"(으)로 대체합니다.`
      );
    }
  }

  return DEFAULT_EMOTION;
}

/**
 * 감정 리포트 카드 컴포넌트
 * 요약 + 인사이트 계층 구조 (시각화 레이어는 EmotionStatsBottomSheet로 이동)
 */
export function EmotionReportCard({ userName }: EmotionReportCardProps) {
  // SPEC-UI-003: userName은 인터페이스 호환성을 위해 유지 (개인화 메시지는 바텀시트로 이동)
  void userName;
  const { distribution } = useEmotionChartData();
  // @MX:NOTE: [AUTO] SPEC-UI-003 - currentInsight만 사용 (topEmotions, streak, patternChange는 바텀시트 인사이트 탭으로 이동)
  const { currentInsight } = useEmotionInsights();

  // @MX:NOTE: 빈 distribution 처리 - 데이터가 없으면 기본값 사용
  const hasData = distribution.length > 0;

  // @MX:NOTE: 가장 빈번한 감정 계산 (요약 레이어 표시용)
  // 빈 distribution 처리를 위한 기본값 제공
  const mostFrequentEmotion = hasData
    ? distribution.reduce((prev, current) =>
        current.count > prev.count ? current : prev,
      distribution[0],
    )
    : null;

  // @MX:NOTE: 표시할 감정 키 결정 - 유효성 검증 포함
  const displayEmotion: EmotionType = mostFrequentEmotion
    ? safeEmotionKey(mostFrequentEmotion.emotionKey)
    : DEFAULT_EMOTION;

  return (
    <div className="glass-card animate-fade-in rounded-3xl px-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-white/10">
      {/* 1단계: 요약 레이어 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
          auto_awesome
        </span>
        <span className="font-jakarta text-xs font-semibold text-text-primary">
          오늘의 감정 리포트
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <EmotionFace emotion={displayEmotion} size={32} />
        <p className="font-gamja text-base text-text-primary leading-relaxed">
          {currentInsight.summary}
        </p>
      </div>

      {/* SPEC-UI-002: 2단계(시각화 레이어)는 바텀시트로 이동 */}
      {/* SPEC-UI-003: 개인화 인사이트(REQ-VIS-006)는 바텀시트 인사이트 탭으로 이동 */}
      {/* 빈 데이터 안내 메시지만 인라인에 유지 */}
      {!hasData && (
        <div className="flex items-center justify-center py-4 mb-2 text-text-secondary/50 dark:text-gray-400 font-gamja text-sm">
          아직 기록된 감정이 없어요. 일기를 써보세요!
        </div>
      )}

      {/* 3단계: 인사이트 레이어 */}
      <div
        className="animate-fade-in-delayed font-gamja text-sm leading-relaxed p-3 rounded-xl bg-white/5 dark:bg-white/5"
        style={{ color: EMOTION_COLORS[displayEmotion] }}
      >
        <span className="material-symbols-outlined text-sm align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1", color: EMOTION_COLORS[displayEmotion] }} aria-hidden="true">
          tips_and_updates
        </span>
        {currentInsight.advice}
      </div>
    </div>
  );
}
