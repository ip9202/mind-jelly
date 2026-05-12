/**
 * 차트 애니메이션 유틸리티
 * REQ-VIS-005: 차트 애니메이션 시스템
 * draw-in, reveal, fade-in 애니메이션 + prefers-reduced-motion 대응
 * @MX:SPEC: SPEC-UI-001
 */

// @MX:NOTE: 애니메이션 지속 시간 상수 (ms)
export const animationDuration = {
  /** 리포트 카드 fade-in */
  fadeIn: 1000,
  /** 트렌드 차트 draw-in (순차 등장) */
  drawIn: 1500,
  /** 도넛 차트 reveal (중심 확장) */
  reveal: 1200,
  /** 인사이트 텍스트 지연 fade-in */
  delayedFadeIn: 800,
} as const;

// @MX:NOTE: 애니메이션 시작 지연 시간 (ms)
export const animationDelay = {
  /** 지연 fade-in 시작 오프셋 */
  delayedFadeIn: 600,
  /** 도넛 차트 애니메이션 시작 오프셋 */
  revealBegin: 0,
} as const;

/**
 * CSS 애니메이션 클래스 매핑 반환
 * @MX:NOTE: 컴포넌트에서 className 조합에 사용
 * @MX:SPEC: SPEC-UI-001
 */
export function getAnimationClasses() {
  return {
    /** 리포트 카드 fade-in 1000ms ease-out */
    reportCard: 'animate-fade-in',
    /** 트렌드 차트 draw-in 1500ms ease-out */
    trendChart: 'animate-draw-in',
    /** 도넛 차트 reveal 1200ms spring */
    donutChart: 'animate-reveal',
    /** 인사이트 텍스트 지연 fade-in 800ms (600ms 딜레이) */
    insightText: 'animate-fade-in-delayed',
  } as const;
}

/**
 * Recharts 라인 차트 애니메이션 설정
 * draw-in 효과: 데이터 포인트가 순차적으로 나타남
 * @MX:SPEC: SPEC-UI-001
 */
export function getLineChartAnimationProps() {
  return {
    isAnimationActive: true,
    animationDuration: animationDuration.drawIn,
    animationEasing: 'ease-out' as const,
  };
}

/**
 * Recharts 파이 차트 애니메이션 설정
 * reveal 효과: 중심에서 외곽으로 확장
 * @MX:SPEC: SPEC-UI-001
 */
export function getPieChartAnimationProps() {
  return {
    isAnimationActive: true,
    animationBegin: animationDelay.revealBegin,
    animationDuration: animationDuration.reveal,
    animationEasing: 'ease-out' as const,
  };
}
