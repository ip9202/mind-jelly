'use client';

import { useState, useSyncExternalStore } from 'react';
import { setNickname } from '@/lib/supabase/db';
import { diaryStore } from '@/stores/diaryStore';
import { jellyStore } from '@/stores/jellyStore';
import { JELLY_SHAPE_CONFIGS } from '@/lib/constants/jellyShapes';
import type { JellyShape } from '@/types/physics';

const emptySubscribe = () => () => {};

// @MX:NOTE: 웰컴 페이지 환영 비즈 - 감정 색상 기반 부유 장식
const WELCOME_BEADS = [
  { color: '#FFB7C5', top: '12%', left: '8%', size: 48, delay: '0s' },
  { color: '#FF6B8A', top: '8%', left: '78%', size: 40, delay: '1.2s' },
  { color: '#5BC0EB', top: '72%', left: '86%', size: 36, delay: '2s' },
  { color: '#FFD93D', top: '78%', left: '10%', size: 44, delay: '0.8s' },
  { color: '#FFB347', top: '45%', left: '90%', size: 38, delay: '1.5s' },
  { color: '#C5A3FF', top: '65%', left: '5%', size: 32, delay: '2.5s' },
];

// 스파클 장식 위치
const SPARKLES = [
  { top: '8%', left: '55%', delay: '0s', size: 14 },
  { top: '18%', left: '30%', delay: '0.7s', size: 12 },
  { top: '5%', left: '68%', delay: '1.4s', size: 10 },
];

// 행복한 표정 경로 (눈 + 입)
function getHappyFacePath(eyeY: number, mouthY: number): string {
  return `
    M 0.34 ${eyeY + 0.02} Q 0.38 ${eyeY - 0.04} 0.42 ${eyeY + 0.02}
    M 0.58 ${eyeY + 0.02} Q 0.62 ${eyeY - 0.04} 0.66 ${eyeY + 0.02}
    M 0.30 ${mouthY - 0.02} Q 0.50 ${mouthY + 0.18} 0.70 ${mouthY - 0.02}
  `;
}

// 인라인 SVG 젤리 캐릭터 (모양 동적 변경 지원)
function WelcomeJelly({ shape, bounceKey }: { shape: JellyShape; bounceKey: number }) {
  const config = JELLY_SHAPE_CONFIGS[shape];
  const jellyPath = config.path;
  const { eyeY, mouthY } = config.faceOffset;

  return (
    <div
      key={bounceKey}
      className="pointer-events-none"
      style={{
        animation: bounceKey > 0
          ? 'jelly-shape-bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'jelly-float 4s ease-in-out infinite',
      }}
    >
      <svg
        viewBox="0 0 1 1"
        width={160}
        height={160}
        style={{ overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <radialGradient id="wj-grad" cx="0.35" cy="0.28" r="0.72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.85" />
            <stop offset="22%" stopColor="#fff0f4" />
            <stop offset="62%" stopColor="#FFB7C5" />
            <stop offset="100%" stopColor="#FF8FA3" />
          </radialGradient>
          <filter id="wj-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.055" result="blur" />
          </filter>
          <filter id="wj-shadow" x="-20%" y="-10%" width="140%" height="145%">
            <feDropShadow dx="0" dy="0.040" stdDeviation="0.045" floodColor="#FFB7C5" floodOpacity="0.42" />
          </filter>
          <mask id="wj-mask">
            <path d={jellyPath} fill="white" />
          </mask>
        </defs>

        {/* 외곽 글로우 */}
        <path
          d={jellyPath}
          fill="rgba(255, 183, 197, 0.40)"
          filter="url(#wj-glow)"
          opacity="0.75"
          transform="translate(0.5 0.5) scale(1.22) translate(-0.5 -0.5)"
        />

        {/* 3D 그라디언트 메인 바디 */}
        <path
          d={jellyPath}
          fill="url(#wj-grad)"
          filter="url(#wj-shadow)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.016"
          opacity="0.93"
        />

        {/* 하이라이트 그룹 */}
        <g mask="url(#wj-mask)">
          <ellipse cx="0.33" cy="0.26" rx="0.17" ry="0.10" fill="white" opacity="0.52" style={{ filter: 'blur(2px)' }} />
          <ellipse cx="0.26" cy="0.21" rx="0.055" ry="0.036" fill="white" opacity="0.88" transform="rotate(-22 0.26 0.21)" />
          <circle cx="0.35" cy="0.18" r="0.020" fill="white" opacity="0.70" />
        </g>

        {/* 행복한 표정 */}
        <g mask="url(#wj-mask)">
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

// 미니 젤리 모양 미리보기 (설정 페이지 패턴과 동일)
function MiniJellyPreview({ shape }: { shape: JellyShape }) {
  const config = JELLY_SHAPE_CONFIGS[shape];
  const gradId = `sg-${shape}`;
  const maskId = `sm-${shape}`;
  const filterId = `sf-${shape}`;

  return (
    <svg width="72" height="72" viewBox="0 0 1 1" aria-hidden>
      <defs>
        <radialGradient id={gradId} cx="0.35" cy="0.28" r="0.70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.85" />
          <stop offset="20%" stopColor="#fff0f4" />
          <stop offset="60%" stopColor="#FFD1DC" />
          <stop offset="100%" stopColor="#FFB3A7" />
        </radialGradient>
        <mask id={maskId}>
          <path d={config.path} fill="white" />
        </mask>
        <filter id={filterId} x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="0.03" stdDeviation="0.035" floodColor="#FFB3A7" floodOpacity="0.35" />
        </filter>
      </defs>
      <path
        d={config.path}
        fill={`url(#${gradId})`}
        filter={`url(#${filterId})`}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.018"
      />
      <g mask={`url(#${maskId})`}>
        <ellipse cx="0.32" cy="0.25" rx="0.16" ry="0.09" fill="white" opacity="0.55" style={{ filter: 'blur(1.5px)' }} />
        <circle cx="0.26" cy="0.20" r="0.042" fill="white" opacity="0.88" />
      </g>
      <g mask={`url(#${maskId})`}>
        <circle cx="0.40" cy={config.faceOffset.eyeY} r="0.040" fill="#7a5761" />
        <circle cx="0.60" cy={config.faceOffset.eyeY} r="0.040" fill="#7a5761" />
        <path
          d={`M 0.36 ${config.faceOffset.mouthY + 0.02} Q 0.50 ${config.faceOffset.mouthY + 0.12} 0.64 ${config.faceOffset.mouthY + 0.02}`}
          stroke="#7a5761"
          strokeWidth="0.030"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// 모양 선택 옵션 (처음 4개만: ppung, mallang, jjit, banggeul)
const SHAPE_OPTIONS = Object.keys(JELLY_SHAPE_CONFIGS) as JellyShape[];

export default function WelcomePage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [step, setStep] = useState<1 | 2>(1);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [nickname, setNicknameInput] = useState('');
  const [selectedShape, setSelectedShape] = useState<JellyShape>('ppung');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shapeBounceKey, setShapeBounceKey] = useState(0);

  function handleNext() {
    const trimmed = nickname.trim();
    if (!trimmed || trimmed.length < 2) {
      setError(trimmed ? '2자 이상 입력해주세요' : '닉네임을 입력해주세요');
      return;
    }
    setError('');
    setStepDirection('forward');
    setStep(2);
  }

  function handleBack() {
    setStepDirection('backward');
    setStep(1);
  }

  function handleShapeSelect(shape: JellyShape) {
    if (shape !== selectedShape) {
      setSelectedShape(shape);
      setShapeBounceKey((prev) => prev + 1);
    }
  }

  async function handleStart() {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const supabaseUserId = diaryStore.getState().supabaseUserId;
      if (!supabaseUserId) {
        setError('로그인 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
        return;
      }

      await setNickname(supabaseUserId, trimmed);
      jellyStore.getState().setJellyName(trimmed);
      jellyStore.getState().setJellyShape(selectedShape);

      window.location.href = '/home';
    } catch {
      setError('이미 사용 중인 닉네임입니다');
    } finally {
      setSaving(false);
    }
  }

  // 스텝 전환 애니메이션 클래스
  const stepAnimClass = stepDirection === 'forward'
    ? 'animate-step-in-right'
    : 'animate-step-in-left';

  // SSR/CSR hydration mismatch 방지: 마운트 전까지 플레이스홀더
  if (!mounted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #FFF0F3 0%, #FFB7C5 60%, #FF9EB5 100%)',
        }}
      />
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

        {/* 프로그레스 인디케이터 */}
        <div className="flex gap-2 mb-[20px]">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              step === 1 ? 'w-6 bg-[#FFB7C5]' : 'w-2 bg-[#FFB7C5]/30'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              step === 2 ? 'w-6 bg-[#FFB7C5]' : 'w-2 bg-[#FFB7C5]/30'
            }`}
          />
        </div>

        {/* 젤리 캐릭터 + 스파클 장식 */}
        <div className="relative mb-[12px] animate-jelly-entrance">
          {/* 스파클 장식 */}
          {SPARKLES.map((sparkle, i) => (
            <span
              key={i}
              className="material-symbols-outlined absolute pointer-events-none"
              style={{
                color: '#FFD93D',
                fontSize: `${sparkle.size}px`,
                animation: `sparkle-pulse 2s ease-in-out ${sparkle.delay} infinite`,
                top: sparkle.top,
                left: sparkle.left,
              }}
            >
              auto_awesome
            </span>
          ))}
          <WelcomeJelly shape={selectedShape} bounceKey={shapeBounceKey} />
        </div>

        {/* 스텝 콘텐츠 (전환 애니메이션) */}
        <div key={step} className={`w-full flex flex-col items-center ${stepAnimClass}`}>

          {step === 1 && (
            <>
              {/* Step 1: 환영 텍스트 */}
              <div className="text-center mb-[8px]">
                <h1 className="font-gowun text-[22px] font-bold leading-snug" style={{ color: '#78555e' }}>
                  마음젤리에 오신 걸
                  <br />
                  환영해요!
                </h1>
              </div>
              <p className="font-gowun text-[14px] leading-relaxed text-center mb-[20px]" style={{ color: '#9a7a85' }}>
                나만의 젤리에게 이름을 지어주세요.
                <br />
                이 이름으로 친구들이 나를 알게 돼요.
              </p>

              {/* 글래스 카드 */}
              <div
                className="glass-card w-full rounded-2xl p-[28px] space-y-[20px]"
                style={{
                  boxShadow: '0 4px 24px 0 rgba(120, 85, 94, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <div className="space-y-[8px]">
                  <label htmlFor="nickname-input" className="font-gowun text-[13px]" style={{ color: '#9a7a85' }}>
                    닉네임
                  </label>
                  <input
                    id="nickname-input"
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNicknameInput(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !saving) handleNext();
                    }}
                    maxLength={12}
                    placeholder="2~12자 입력"
                    className="w-full bg-white/60 border rounded-lg px-[16px] py-[12px] font-gowun text-[16px] outline-none transition-all placeholder:opacity-50 focus:ring-2 focus:ring-[#FFB7C5]/40 focus:border-[#FFB7C5]"
                    style={{
                      color: '#5a3e47',
                      borderColor: 'rgba(255, 183, 197, 0.5)',
                    }}
                  />
                  {error && (
                    <p className="font-gowun text-[13px] text-red-400">{error}</p>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  disabled={saving || !nickname.trim() || nickname.trim().length < 2}
                  className="w-full font-gowun text-[16px] font-semibold py-[14px] rounded-xl disabled:opacity-50 active:scale-[0.97] transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #FF9ECD 0%, #FFD1DC 100%)',
                    boxShadow: '0 2px 8px rgba(255, 158, 205, 0.35)',
                    color: '#78555e',
                  }}
                >
                  다음
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* 뒤로 가기 버튼 */}
              <button
                onClick={handleBack}
                className="absolute top-[-280px] left-[-4px] w-10 h-10 rounded-full bg-white/40 flex items-center justify-center active:scale-95 transition-transform z-10"
                aria-label="이전 단계로"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#78555e' }}>
                  arrow_back
                </span>
              </button>

              {/* Step 2: 모양 선택 텍스트 */}
              <div className="text-center mb-[8px]">
                <h1 className="font-gowun text-[22px] font-bold leading-snug" style={{ color: '#78555e' }}>
                  나만의 젤리를 선택해보세요!
                </h1>
              </div>
              <p className="font-gowun text-[13px] leading-relaxed text-center mb-[20px]" style={{ color: '#9a7a85' }}>
                젤리의 기본 모양을 정해봐요
              </p>

              {/* 글래스 카드: 모양 그리드 */}
              <div
                className="glass-card w-full rounded-2xl p-[24px]"
                style={{
                  boxShadow: '0 4px 24px 0 rgba(120, 85, 94, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <div className="grid grid-cols-2 gap-[14px]">
                  {SHAPE_OPTIONS.map((shape) => {
                    const config = JELLY_SHAPE_CONFIGS[shape];
                    const isSelected = selectedShape === shape;

                    return (
                      <button
                        key={shape}
                        onClick={() => handleShapeSelect(shape)}
                        aria-label={`젤리 모양: ${config.label}`}
                        aria-pressed={isSelected}
                        className={`flex flex-col items-center gap-[8px] p-[14px] rounded-2xl transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-primary-container/60 border-2 border-[#FFB3A7]'
                            : 'bg-white/30 border-2 border-transparent hover:bg-white/50'
                        }`}
                      >
                        <MiniJellyPreview shape={shape} />
                        <span
                          className={`font-gowun text-[14px] ${
                            isSelected ? 'text-[#78555e] font-bold' : 'text-[#9a7a85]'
                          }`}
                        >
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 시작하기 버튼 */}
                <button
                  onClick={handleStart}
                  disabled={saving}
                  className="w-full font-gowun text-[16px] font-semibold py-[14px] rounded-xl disabled:opacity-50 active:scale-[0.97] transition-transform mt-[20px]"
                  style={{
                    background: 'linear-gradient(135deg, #FF9ECD 0%, #FFD1DC 100%)',
                    boxShadow: '0 2px 8px rgba(255, 158, 205, 0.35)',
                    color: '#78555e',
                  }}
                >
                  {saving ? '저장 중...' : '시작하기'}
                </button>

                {error && (
                  <p className="font-gowun text-[13px] text-red-400 text-center mt-[8px]">{error}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 하단 브랜딩 */}
      <p
        className="font-gamja text-[14px] mt-[32px]"
        style={{
          color: '#78555e',
          opacity: 0.6,
        }}
      >
        마음젤리
      </p>
    </div>
  );
}
