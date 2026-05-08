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
 */
// @MX:ANCHOR: PhysicsCanvas 컴포넌트
// @MX:REASON: 앱의 진입점이자 물리 시뮬레이션의 핵심 컨테이너
// @MX:SPEC: REQ-UBI-001
export function PhysicsCanvas({ width, height, children }: PhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [engine, setEngine] = useState<Matter.Engine | null>(null);

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
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
      />
      {renderChildren()}
    </div>
  );
}
