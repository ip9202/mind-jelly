'use client';

import { useEffect, useState } from 'react';

// @MX:NOTE: [AUTO] SPEC-TOUCH-001 REQ-TOUCH-003: 터치 시 하트 파티클 컴포넌트
// @MX:REASON: 3~5개 하트가 위로 날아가며 fade-out 애니메이션, 1초 후 자동 제거

interface HeartParticleProps {
  /** 파티클 시작 x 좌표 (픽셀) */
  x: number;
  /** 파티클 시작 y 좌표 (픽셀) */
  y: number;
  /** 등장 지연 (ms, 0~300 랜덤) */
  delay: number;
  /** x 오프셋 (px, -30~30 랜덤) */
  offsetX: number;
}

interface ParticleState {
  opacity: number;
  translateY: number;
}

/**
 * 개별 하트 파티클
 * 지정된 위치에서 위로 떠오르며 fade-out 애니메이션 재생
 */
export function HeartParticle({ x, y, delay, offsetX }: HeartParticleProps) {
  const [state, setState] = useState<ParticleState>({ opacity: 0, translateY: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let rafId: number | null = null;

    // 지연 후 애니메이션 시작
    const startTimer = setTimeout(() => {
      setState({ opacity: 1, translateY: 0 });

      // 다음 프레임에서 애니메이션 트리거
      rafId = requestAnimationFrame(() => {
        setState({ opacity: 0, translateY: -30 });
      });
    }, delay);

    // 1초 + 지연 후 제거
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 1000 + delay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(removeTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      data-testid="heart-particle"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `${x + offsetX}px`,
        top: `${y}px`,
        fontSize: '18px',
        lineHeight: 1,
        opacity: state.opacity,
        transform: `translateY(${state.translateY}px)`,
        transition: 'opacity 800ms ease-out, transform 800ms ease-out',
        pointerEvents: 'none',
        zIndex: 100,
        color: '#FF6B8A',
      }}
    >
      ♥
    </div>
  );
}

/**
 * 하트 파티클 그룹 생성 유틸리티
 * 3~5개 파티클을 랜덤 설정으로 생성
 */
export function createHeartParticles(x: number, y: number): Array<{
  id: string;
  x: number;
  y: number;
  delay: number;
  offsetX: number;
}> {
  const count = 3 + Math.floor(Math.random() * 3); // 3~5개
  return Array.from({ length: count }, (_, i) => ({
    id: `heart-${Date.now()}-${i}`,
    x,
    y,
    delay: Math.floor(Math.random() * 300), // 0~300ms 지연
    offsetX: Math.floor(Math.random() * 61) - 30, // -30~30px 오프셋
  }));
}
