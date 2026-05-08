'use client';

interface JellyRendererProps {
  bodies: Array<{ position: { x: number; y: number }; circleRadius?: number }>;
  face: 'idle' | 'anticipation' | 'eating' | 'satisfied';
  animation: number;
}

export function JellyRenderer({ bodies, face }: JellyRendererProps) {
  if (bodies.length === 0) return null;

  const jelly = bodies[0];
  const cx = jelly.position.x;
  const cy = jelly.position.y;
  const r = jelly.circleRadius || 40;

  return (
    <div
      data-testid="jelly-renderer"
      className="absolute pointer-events-none"
      style={{
        left: cx - r * 2.5,
        top: cy - r * 2.5,
        width: r * 5,
        height: r * 5,
      }}
    >
      {/* 글로우 효과 */}
      <div
        className="absolute inset-0 rounded-full scale-125 blur-3xl"
        style={{ backgroundColor: 'rgba(255, 209, 220, 0.3)' }}
      />
      {/* 젤리 바디 */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          backgroundColor: '#FFD1DC',
          boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.05), inset 8px 8px 20px rgba(255,255,255,0.6)',
          border: '4px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* 표정 */}
        <div className="flex flex-col items-center gap-2" style={{ marginTop: r * 0.15 }}>
          {/* 눈 */}
          <div className="flex gap-8">
            <div className="rounded-full" style={{ width: r * 0.12, height: r * 0.12, backgroundColor: '#7a5761' }} />
            <div className="rounded-full" style={{ width: r * 0.12, height: r * 0.12, backgroundColor: '#7a5761' }} />
          </div>
          {/* 입 */}
          {face === 'idle' && (
            <div
              className="rounded-full border-2"
              style={{ width: r * 0.2, height: r * 0.2, borderColor: 'rgba(122, 87, 97, 0.6)', backgroundColor: 'transparent' }}
            />
          )}
          {face === 'eating' && (
            <div
              className="rounded-full"
              style={{ width: r * 0.4, height: r * 0.3, backgroundColor: '#FF6B6B' }}
            />
          )}
          {face === 'satisfied' && (
            <svg width={r * 0.4} height={r * 0.2} viewBox="0 0 40 20">
              <path d="M 4 4 Q 20 18 36 4" stroke="#7a5761" strokeWidth="3" fill="none" />
            </svg>
          )}
          {face === 'anticipation' && (
            <div
              className="rounded-full"
              style={{ width: r * 0.25, height: r * 0.15, backgroundColor: '#7a5761' }}
            />
          )}
        </div>
        {/* 내부 하이라이트 */}
        <div
          className="absolute rounded-full blur-md"
          style={{
            top: r * 0.3,
            left: r * 0.5,
            width: r * 0.6,
            height: r * 0.3,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            transform: 'rotate(-30deg)',
          }}
        />
      </div>
    </div>
  );
}
