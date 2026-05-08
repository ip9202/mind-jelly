'use client';

// T-014: JellyRenderer (REQ-UBI-002, AC-001, AC-002)
import React from 'react';

interface JellyRendererProps {
  bodies: Array<{ position: { x: number; y: number }; circleRadius?: number }>;
  face: 'idle' | 'anticipation' | 'eating' | 'satisfied';
  animation: number;
}

/**
 * 젤리 캐릭터 렌더링 컴포넌트
 */
// @MX:ANCHOR: JellyRenderer 컴포넌트
// @MX:REASON: 메인 뷰 컴포넌트로 PhysicsCanvas 내부에서 사용
// @MX:SPEC: REQ-UBI-002, AC-001, AC-002
export function JellyRenderer({ bodies, face, animation }: JellyRendererProps) {
  // 젤리 바디 렌더링
  const renderJellyBody = () => {
    return bodies.map((body, index) => (
      <circle
        key={index}
        cx={body.position.x}
        cy={body.position.y}
        r={body.circleRadius || 5}
        fill="#FFD1DC"
        stroke="#FFB6C1"
        strokeWidth="2"
      />
    ));
  };

  // 표정 렌더링
  const renderFace = () => {
    const centerX = bodies.length > 0 ? bodies[0].position.x : 0;
    const centerY = bodies.length > 0 ? bodies[0].position.y : 0;

    return (
      <g transform={`translate(${centerX}, ${centerY})`}>
        {/* 눈 */}
        <circle cx="-10" cy="-5" r="3" fill="#333" />
        <circle cx="10" cy="-5" r="3" fill="#333" />

        {/* 입 */}
        {face === 'eating' && (
          <ellipse
            cx="0"
            cy="10"
            rx="8"
            ry={6 + animation * 2}
            fill="#FF6B6B"
          />
        )}
        {face === 'satisfied' && (
          <path
            d="M -8 8 Q 0 14 8 8"
            stroke="#333"
            strokeWidth="2"
            fill="none"
          />
        )}
        {face === 'idle' && (
          <circle cx="0" cy="8" r="4" fill="#333" />
        )}
        {face === 'anticipation' && (
          <ellipse
            cx="0"
            cy="8"
            rx="5"
            ry={3 + animation}
            fill="#333"
          />
        )}
      </g>
    );
  };

  return (
    <g>
      {renderJellyBody()}
      {renderFace()}
    </g>
  );
}
