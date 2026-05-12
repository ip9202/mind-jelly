/**
 * ChartAnimations 유틸리티 테스트
 * REQ-VIS-005: 차트 애니메이션 시스템
 * @MX:SPEC: SPEC-UI-001
 */

import { describe, it, expect } from '@jest/globals';
import {
  animationDuration,
  animationDelay,
  getAnimationClasses,
  getLineChartAnimationProps,
  getPieChartAnimationProps,
} from '../ChartAnimations';

describe('ChartAnimations - REQ-VIS-005', () => {
  describe('animationDuration 상수', () => {
    it('fade-in 지속 시간이 1000ms여야 함', () => {
      expect(animationDuration.fadeIn).toBe(1000);
    });

    it('draw-in 지속 시간이 1500ms여야 함', () => {
      expect(animationDuration.drawIn).toBe(1500);
    });

    it('reveal 지속 시간이 1200ms여야 함', () => {
      expect(animationDuration.reveal).toBe(1200);
    });

    it('delayed fade-in 지속 시간이 800ms여야 함', () => {
      expect(animationDuration.delayedFadeIn).toBe(800);
    });

    it('모든 값이 양수여야 함', () => {
      Object.values(animationDuration).forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('animationDelay 상수', () => {
    it('delayed fade-in 시작 지연이 600ms여야 함', () => {
      expect(animationDelay.delayedFadeIn).toBe(600);
    });

    it('reveal 시작 오프셋이 0ms여야 함', () => {
      expect(animationDelay.revealBegin).toBe(0);
    });
  });

  describe('getAnimationClasses', () => {
    it('4개의 애니메이션 클래스를 반환해야 함', () => {
      const classes = getAnimationClasses();
      expect(Object.keys(classes)).toHaveLength(4);
    });

    it('reportCard 클래스가 animate-fade-in이어야 함', () => {
      const classes = getAnimationClasses();
      expect(classes.reportCard).toBe('animate-fade-in');
    });

    it('trendChart 클래스가 animate-draw-in이어야 함', () => {
      const classes = getAnimationClasses();
      expect(classes.trendChart).toBe('animate-draw-in');
    });

    it('donutChart 클래스가 animate-reveal이어야 함', () => {
      const classes = getAnimationClasses();
      expect(classes.donutChart).toBe('animate-reveal');
    });

    it('insightText 클래스가 animate-fade-in-delayed여야 함', () => {
      const classes = getAnimationClasses();
      expect(classes.insightText).toBe('animate-fade-in-delayed');
    });

    it('반환값이 as const로 타입 고정되어야 함', () => {
      const classes = getAnimationClasses();
      // 값이 읽기 전용인지 확인 (런타임에서는 변경 가능하지만 타입 레벨에서 보장)
      expect(typeof classes.reportCard).toBe('string');
      expect(typeof classes.trendChart).toBe('string');
      expect(typeof classes.donutChart).toBe('string');
      expect(typeof classes.insightText).toBe('string');
    });
  });

  describe('getLineChartAnimationProps', () => {
    it('애니메이션이 활성화되어야 함', () => {
      const props = getLineChartAnimationProps();
      expect(props.isAnimationActive).toBe(true);
    });

    it('draw-in 지속 시간(1500ms)을 사용해야 함', () => {
      const props = getLineChartAnimationProps();
      expect(props.animationDuration).toBe(1500);
    });

    it('easing이 ease-out이어야 함', () => {
      const props = getLineChartAnimationProps();
      expect(props.animationEasing).toBe('ease-out');
    });
  });

  describe('getPieChartAnimationProps', () => {
    it('애니메이션이 활성화되어야 함', () => {
      const props = getPieChartAnimationProps();
      expect(props.isAnimationActive).toBe(true);
    });

    it('시작 지연이 0ms여야 함', () => {
      const props = getPieChartAnimationProps();
      expect(props.animationBegin).toBe(0);
    });

    it('reveal 지속 시간(1200ms)을 사용해야 함', () => {
      const props = getPieChartAnimationProps();
      expect(props.animationDuration).toBe(1200);
    });

    it('easing이 ease-out이어야 함', () => {
      const props = getPieChartAnimationProps();
      expect(props.animationEasing).toBe('ease-out');
    });
  });

  describe('애니메이션 일관성', () => {
    it('CSS 클래스와 Recharts props의 지속 시간이 동기화되어야 함', () => {
      const lineProps = getLineChartAnimationProps();
      const pieProps = getPieChartAnimationProps();
      const classes = getAnimationClasses();

      // Line 차트: draw-in 1500ms
      expect(lineProps.animationDuration).toBe(animationDuration.drawIn);
      expect(classes.trendChart).toBe('animate-draw-in');

      // Pie 차트: reveal 1200ms
      expect(pieProps.animationDuration).toBe(animationDuration.reveal);
      expect(classes.donutChart).toBe('animate-reveal');
    });
  });
});
