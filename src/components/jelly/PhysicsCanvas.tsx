'use client';

// T-010: PhysicsCanvas 컴포넌트 (REQ-UBI-001)
import React, { useEffect, useRef, useState } from 'react';
import * as Matter from 'matter-js';

interface PhysicsCanvasProps {
  width: number;
  height: number;
  children?: React.ReactNode | ((engine: Matter.Engine | null) => React.ReactNode);
}

/**
 * Matter.js 물리 엔진을 호스팅하는 캔버스 컴포넌트
 * requestAnimationFrame 루프로 애니메이션 실행
 * CSS transform 스케일링으로 모바일 대응
 */
// @MX:ANCHOR: PhysicsCanvas 컴포넌트
// @MX:REASON: 앱의 진입점이자 물리 시뮬레이션의 핵심 컨테이너
// @MX:SPEC: REQ-UBI-001
export function PhysicsCanvas({ width, height, children }: PhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [engine, setEngine] = useState<Matter.Engine | null>(null);
  const [scale, setScale] = useState(1);

  // 컨테이너 크기 변화 감지 → 스케일 팩터 계산
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const containerWidth = entries[0].contentRect.width;
      setScale(containerWidth / width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Matter.js 엔진 생성
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 }, // 중력 설정
    });

    engineRef.current = engine;

    // Runner 생성 및 시작
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // 상태 업데이트 (다음 틱으로 지연)
    const timerId = setTimeout(() => {
      setEngine(engine);
    }, 0);

    // 정리 함수
    return () => {
      clearTimeout(timerId);
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, []);

  // children 렌더링
  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(engine);
    }
    return children;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[800px] mx-auto overflow-visible bg-transparent"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block bg-transparent border-0 outline-none"
        />
        {renderChildren()}
      </div>
    </div>
  );
}
