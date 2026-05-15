'use client';

import { useSyncExternalStore, useState } from 'react';
import { JELLY_SHAPE_CONFIGS } from '@/lib/constants/jellyShapes';
import { jellyStore } from '@/stores/jellyStore';
import type { JellyShape } from '@/types/physics';

// @MX:NOTE: 온보딩 페이지 부유 비즈 - welcome 페이지와 동일한 감정 색상 장식
const WELCOME_BEADS = [
  { color: '#FFB7C5', top: '12%', left: '8%', size: 48, delay: '0s' },
  { color: '#FF6B8A', top: '8%', left: '78%', size: 40, delay: '1.2s' },
  { color: '#5BC0EB', top: '72%', left: '86%', size: 36, delay: '2s' },
  { color: '#FFD93D', top: '78%', left: '10%', size: 44, delay: '0.8s' },
  { color: '#FFB347', top: '45%', left: '90%', size: 38, delay: '1.5s' },
  { color: '#C5A3FF', top: '65%', left: '5%', size: 32, delay: '2.5s' },
];

// 행복한 표정 경로 (눈 + 입)
function getHappyFacePath(eyeY: number, mouthY: number): string {
  return `
    M 0.34 ${eyeY + 0.02} Q 0.38 ${eyeY - 0.04} 0.42 ${eyeY + 0.02}
    M 0.58 ${eyeY + 0.02} Q 0.62 ${eyeY - 0.04} 0.66 ${eyeY + 0.02}
    M 0.30 ${mouthY - 0.02} Q 0.50 ${mouthY + 0.18} 0.70 ${mouthY - 0.02}
  `;
}

// 인라인 SVG 젤리 캐릭터 (ppung 고정)
function WelcomeJelly({ shape }: { shape: JellyShape }) {
  const config = JELLY_SHAPE_CONFIGS[shape];
  const jellyPath = config.path;
  const { eyeY, mouthY } = config.faceOffset;

  return (
    <div
      className="pointer-events-none"
      style={{
        animation: 'jelly-float 4s ease-in-out infinite',
      }}
    >
      <svg
        viewBox="0 0 1 1"
        width={120}
        height={120}
        style={{ overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <radialGradient id="ob-grad" cx="0.35" cy="0.28" r="0.72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.85" />
            <stop offset="22%" stopColor="#fff0f4" />
            <stop offset="62%" stopColor="#FFB7C5" />
            <stop offset="100%" stopColor="#FF8FA3" />
          </radialGradient>
          <filter id="ob-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.055" result="blur" />
          </filter>
          <filter id="ob-shadow" x="-20%" y="-10%" width="140%" height="145%">
            <feDropShadow dx="0" dy="0.040" stdDeviation="0.045" floodColor="#FFB7C5" floodOpacity="0.42" />
          </filter>
          <mask id="ob-mask">
            <path d={jellyPath} fill="white" />
          </mask>
        </defs>

        {/* 외곽 글로우 */}
        <path
          d={jellyPath}
          fill="rgba(255, 183, 197, 0.40)"
          filter="url(#ob-glow)"
          opacity="0.75"
          transform="translate(0.5 0.5) scale(1.22) translate(-0.5 -0.5)"
        />

        {/* 3D 그라디언트 메인 바디 */}
        <path
          d={jellyPath}
          fill="url(#ob-grad)"
          filter="url(#ob-shadow)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.016"
          opacity="0.93"
        />

        {/* 하이라이트 그룹 */}
        <g mask="url(#ob-mask)">
          <ellipse cx="0.33" cy="0.26" rx="0.17" ry="0.10" fill="white" opacity="0.52" style={{ filter: 'blur(2px)' }} />
          <ellipse cx="0.26" cy="0.21" rx="0.055" ry="0.036" fill="white" opacity="0.88" transform="rotate(-22 0.26 0.21)" />
          <circle cx="0.35" cy="0.18" r="0.020" fill="white" opacity="0.70" />
        </g>

        {/* 행복한 표정 */}
        <g mask="url(#ob-mask)">
          <path
            d={getHappyFacePath(eyeY, mouthY)}
            stroke="#7a5761"
            strokeWidth="0.008"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

// 기능 카드 데이터
const FEATURES = [
  {
    emoji: '🫧',
    title: '힘든 말을 털어놔',
    desc: '오늘 있었던 일을 그냥 적어봐',
  },
  {
    emoji: '🍬',
    title: '젤리가 냠냠 먹어',
    desc: '감정 구슬이 생기면 쏙쏙 먹어줄게',
  },
  {
    emoji: '💕',
    title: '조금 가벼워져',
    desc: '먹고 나면 마음이 몽글몽글해',
  },
];

export default function OnboardingPage() {
  const isInitialized = useSyncExternalStore(
    (listener) => jellyStore.subscribe(listener),
    () => jellyStore.getState().isInitialized,
    () => false,
  );
  const [isNavigating, setIsNavigating] = useState(false);

  function handleStart() {
    if (isNavigating) return;
    setIsNavigating(true);
    const hasNickname = !!jellyStore.getState().jellyName;
    window.location.href = hasNickname ? '/home' : '/welcome';
  }

  if (!isInitialized) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{
          background: 'linear-gradient(180deg, #FFF0F3 0%, #FFB7C5 60%, #FF9EB5 100%)',
        }}
      >
        <div
          className="w-20 h-20 rounded-full animate-pulse"
          style={{ background: 'rgba(255,183,197,0.5)' }}
        />
        <p className="font-gowun text-[13px]" style={{ color: '#9a7a85' }}>
          마음젤리를 준비하고 있어요...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-[24px] relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFF0F3 0%, #FFB7C5 60%, #FF9EB5 100%)',
      }}
    >
      {/* 부유하는 감정 비즈 */}
      {WELCOME_BEADS.map((bead, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: bead.top,
            left: bead.left,
            width: bead.size,
            height: bead.size,
            backgroundColor: bead.color,
            filter: 'blur(1px)',
            opacity: 0.55,
            animation: `jelly-float 4s ease-in-out ${bead.delay} infinite`,
          }}
        />
      ))}

      {/* 상단 장식 블러 원 */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[5%] right-[15%] w-64 h-64 bg-white/30 rounded-full blur-[80px]" />
        <div className="absolute bottom-[15%] left-[10%] w-48 h-48 bg-pink-200/30 rounded-full blur-[70px]" />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="w-full max-w-[380px] flex flex-col items-center">
        {/* 헤드라인 */}
        <div className="text-center mb-[6px]">
          <h1
            className="font-gowun text-[26px] font-bold leading-snug"
            style={{ color: '#78555e' }}
          >
            오늘 힘든 일을
            <br />
            젤리에게 줘봐
          </h1>
        </div>
        <p
          className="font-gowun text-[14px] text-center mb-[16px]"
          style={{ color: '#9a7a85' }}
        >
          마음젤리가 냠냠 다 먹어줄게
        </p>

        {/* 젤리 캐릭터 */}
        <div className="relative mb-[20px] animate-jelly-entrance">
          <WelcomeJelly shape="ppung" />
        </div>

        {/* 기능 카드 3개 */}
        <div className="w-full flex flex-col gap-[10px] mb-[24px]">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="glass-card w-full rounded-2xl px-[16px] py-[12px] flex items-center gap-[14px]"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 16px 0 rgba(120, 85, 94, 0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              {/* 이모지 원형 배경 */}
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background: 'rgba(255, 255, 255, 0.4)',
                  fontSize: 22,
                }}
              >
                {feature.emoji}
              </div>

              {/* 텍스트 */}
              <div className="flex flex-col gap-[2px] min-w-0">
                <h3
                  className="font-gowun text-[15px] font-bold leading-tight"
                  style={{ color: '#78555e' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="font-gowun text-[12px] leading-tight"
                  style={{ color: '#9a7a85' }}
                >
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={handleStart}
          disabled={isNavigating}
          className={`w-full font-gowun text-[16px] font-semibold py-[14px] rounded-xl transition-all ${
            isNavigating ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.97]'
          }`}
          style={{
            background: 'linear-gradient(135deg, #FF9ECD 0%, #FFD1DC 100%)',
            boxShadow: '0 2px 8px rgba(255, 158, 205, 0.35)',
            color: '#78555e',
          }}
        >
          {isNavigating ? '이동 중...' : '마음젤리 시작하기'}
        </button>
      </div>
    </div>
  );
}
