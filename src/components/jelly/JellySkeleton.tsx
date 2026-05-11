// @MX:NOTE: [AUTO] 젤리 로딩 스켈레톤 — PhysicsCanvas/SSR 대기 시 "로딩중..." 텍스트 대체
// @MX:SPEC: SPEC-SKELETON-001

export function JellySkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative w-[120px] h-[120px] overflow-hidden">
        {/* 젤리 실루엣 SVG (ppung 모양, 정규화 좌표 × 120) */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="jelly-skeleton-clip">
              <path d="M 60 18 C 36 18 18 36 18 60 C 18 84 36 102 60 102 C 84 102 102 84 102 60 C 102 36 84 18 60 18 Z" />
            </clipPath>
            <linearGradient id="jelly-skeleton-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(180,180,200,0.3)" />
              <stop offset="40%" stopColor="rgba(220,220,240,0.6)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(180,180,200,0.3)" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="-1 0"
                to="1 0"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
          {/* 베이스 실루엣 */}
          <path
            d="M 60 18 C 36 18 18 36 18 60 C 18 84 36 102 60 102 C 84 102 102 84 102 60 C 102 36 84 18 60 18 Z"
            fill="rgba(180,180,200,0.25)"
          />
          {/* shimmer 오버레이 */}
          <rect
            x="0"
            y="0"
            width="120"
            height="120"
            fill="url(#jelly-skeleton-shimmer)"
            clipPath="url(#jelly-skeleton-clip)"
          />
        </svg>
      </div>
    </div>
  );
}
