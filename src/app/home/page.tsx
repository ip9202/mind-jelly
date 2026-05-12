'use client';

import dynamic from 'next/dynamic';
import NavMenu from '@/components/layout/NavMenu';
import { JellySkeleton } from '@/components/jelly/JellySkeleton';
import { useEffect, useState, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import { jellyStore } from '@/stores/jellyStore';
import { tossStore } from '@/stores/tossStore';
import { usePhysicsInit } from './usePhysicsInit';
import { EMOTION_THEME, EMOTION_COLORS, JELLY_COLOR } from '@/lib/constants/emotion';
import { isTouchOnJelly, shouldHandleTouch } from '@/lib/utils/touchHandler';
import { createHeartParticles } from '@/components/jelly/HeartParticle';
import { EmotionFace } from '@/components/jelly/EmotionFace';
import { InterstitialAd } from '@/components/ads/InterstitialAd';
import { BannerAd } from '@/components/ads/BannerAd';
import { canShowInterstitial } from '@/lib/ad/adFrequencyControl';
import type { EmotionType } from '@/types/emotion';

const PhysicsCanvas = dynamic(
  () => import('@/components/jelly/PhysicsCanvas').then((m) => m.PhysicsCanvas),
  { ssr: false, loading: () => <JellySkeleton /> }
);

const JellyRenderer = dynamic(
  () => import('@/components/jelly/JellyRenderer').then((m) => m.JellyRenderer),
  { ssr: false }
);

const BeadGroup = dynamic(
  () => import('@/components/beads/BeadGroup').then((m) => m.BeadGroup),
  { ssr: false }
);

const EmotionInput = dynamic(
  () => import('@/components/input/EmotionInput').then((m) => m.EmotionInput),
  { ssr: false }
);

const HeartParticle = dynamic(
  () => import('@/components/jelly/HeartParticle').then((m) => m.HeartParticle),
  { ssr: false }
);

const emptySubscribe = () => () => {};

// @MX:NOTE: [AUTO] 감정 표현 UI 상태머신 (idle→input→restoring→beads→report→idle)
type UiState = 'idle' | 'input' | 'restoring' | 'beads' | 'report';

// @MX:NOTE: 플로우 전환 타이밍 상수
const RESTORE_DURATION_MS = 500;
const SATISFIED_DISPLAY_MS = 3000;
const REPORT_DISPLAY_MS = 4000;

// @MX:NOTE: 배경 장식용 9개 감정 비드 (SPEC-BEAD-AMBIENT-001)
const AMBIENT_BEADS: Array<{
  emotion: EmotionType;
  top: string;
  left: string;
  size: number;
  delay: string;
}> = [
  { emotion: 'joy',        top: '18%', left: '8%',  size: 48, delay: '0s'   },
  { emotion: 'sadness',    top: '12%', left: '55%', size: 40, delay: '1.2s' },
  { emotion: 'anger',      top: '65%', left: '72%', size: 44, delay: '2.5s' },
  { emotion: 'fear',       top: '42%', left: '5%',  size: 36, delay: '0.8s' },
  { emotion: 'disgust',    top: '72%', left: '15%', size: 40, delay: '3s'   },
  { emotion: 'surprise',   top: '8%',  left: '78%', size: 44, delay: '1.8s' },
  { emotion: 'love',       top: '38%', left: '82%', size: 48, delay: '0.4s' },
  { emotion: 'gratitude',  top: '78%', left: '55%', size: 36, delay: '2s'   },
  { emotion: 'hope',       top: '78%', left: '85%', size: 40, delay: '1.5s' },
];

export default function HomePage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [matterReady, setMatterReady] = useState(false);
  const [matterError, setMatterError] = useState<string | null>(null);
  const [jellyPos, setJellyPos] = useState({ x: 400, y: 240 });
  const matterRef = useRef<typeof import('matter-js') | null>(null);
  const [uiState, setUiState] = useState<UiState>('idle');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // SPEC-TOUCH-001: 하트 파티클 상태
  const [heartParticles, setHeartParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    delay: number;
    offsetX: number;
  }>>([]);



  // 젤리 시각적 감정 상태 (persist된 store에서 복원)
  // @MX:NOTE: [AUTO] lastEmotion 직접 참조 (emotionHistory는 persist되지 않음)
  // @MX:REASON: 리프레시 후 마지막 감정 상태 유지를 위해 저장된 lastEmotion 사용
  const [jellyVisualEmotion, setJellyVisualEmotion] = useState<EmotionType>(() => {
    const { lastEmotion } = jellyStore.getState();
    return lastEmotion || 'joy'; // 저장된 감정 없으면 기본값 joy
  });
  const [jellyVisualColor, setJellyVisualColor] = useState<string>(() => {
    const { lastEmotion } = jellyStore.getState();
    // lastEmotion 기반 색상 사용
    return EMOTION_COLORS[lastEmotion || JELLY_COLOR];
  });

  const currentState = jellyStore((s) => s.currentState);
  const beadCount = jellyStore((s) => s.beadCount);
  const lastEmotion = jellyStore((s) => s.lastEmotion);
  const emotionHistory = jellyStore((s) => s.emotionHistory);
  const isAnalyzing = jellyStore((s) => s.isAnalyzing);
  const jellyName = jellyStore((s) => s.jellyName);
  const jellyShape = jellyStore((s) => s.jellyShape);

  // M4-T5: Toss WebView 사용자 정보 (감정 리포트 개인화)
  const userInfo = tossStore((s) => s.userInfo);

  // 감정 리포트에 표시할 사용자 이름 (WebView > 온보딩 jellyName)
  const userName = userInfo?.name || (jellyName && jellyName !== '내 젤리' ? jellyName : null);

  // 물리 엔진 초기화 훅
  const { engineRef, initPhysics } = usePhysicsInit({
    matterReady,
    matterRef,
    setJellyPos,
  });

  // @MX:NOTE: [AUTO] SPEC-TOUCH-001: 젤리 터치 핸들러
  // @MX:REASON: idle 상태에서만 반응, 1초 쿨다운, hit-test 후 happy 전이 + 바운스 + 파티클
  const handleJellyTouch = useCallback(
    (pointerX: number, pointerY: number) => {
      const st = jellyStore.getState();

      // PhysicsCanvas 내부 좌표로 변환 (캔버스 800x600 기준)
      const canvasX = (pointerX / (typeof window !== 'undefined' ? window.innerWidth : 375)) * 800;
      const canvasY = (pointerY / (typeof window !== 'undefined' ? window.innerHeight : 667)) * 600;

      const onJelly = isTouchOnJelly(canvasX, canvasY, jellyPos, 60);

      if (!shouldHandleTouch({
        currentState: st.currentState,
        canTouch: st.canTouch(),
        isOnJelly: onJelly,
      })) return;

      // happy 상태 전이
      st.triggerHappy();

      // 물리 임펄스 (위쪽 바운스)
      if (engineRef.current && matterRef.current) {
        const Matter = matterRef.current;
        const allBodies = Matter.Composite.allBodies(engineRef.current.world);
        const jelly = allBodies.find((b: Matter.Body) => b.label === 'jelly');
        if (jelly) {
          Matter.Body.applyForce(jelly, jelly.position, { x: 0, y: -0.015 });
        }
      }

      // 하트 파티클 생성
      const particles = createHeartParticles(pointerX, pointerY);
      setHeartParticles(particles);

      // 1.5초 후 파티클 제거
      setTimeout(() => {
        setHeartParticles([]);
      }, 1500);
    },
    [jellyPos, engineRef, matterRef],
  );

  useEffect(() => {
    import('matter-js')
      .then((M) => {
        matterRef.current = M;
        setMatterReady(true);
      })
      .catch((err) => {
        console.error('Matter.js 로드 실패:', err);
        setMatterError('물리 엔진을 불러올 수 없습니다.');
      });
  }, []);

  // restoring 애니메이션(500ms) 완료 후 beads 상태로 전환 + 구슬 생성
  useEffect(() => {
    if (uiState === 'restoring') {
      const timer = setTimeout(() => {
        // 새 사이클: currentState가 satisfied에 머물면 eating 전이가 불가하므로 idle로 리셋
        const st = jellyStore.getState();
        if (st.currentState === 'satisfied') {
          st.transitionState('idle');
        }
        setUiState('beads');
        // 젤리가 원래 크기로 복원된 후 구슬 생성
        jellyStore.getState().incrementBeadCount(5);
      }, RESTORE_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [uiState]);

  // 모든 구슬이 먹히면(satisfied) 젤리 변형 적용 + report 상태로 전환
  // @MX:WARN: [AUTO] satisfiedTimerRef(usePhysicsInit) 500ms 지연 → 총 3.5초 대기
  // @MX:REASON: usePhysicsInit에서 마지막 구슬 충돌 후 500ms 뒤 satisfied 전이, 이후 3초 지속
  useEffect(() => {
    if (uiState === 'beads' && currentState === 'satisfied') {
      // 구슬을 모두 먹은 후 젤리 감정 변형 적용
      // setState를 effect 본문에서 직접 호출하지 않도록 타이머로 딜스패 적용
      setTimeout(() => {
        setJellyVisualEmotion(lastEmotion);
        setJellyVisualColor(EMOTION_COLORS[lastEmotion]);
        jellyStore.getState().setEmotionColor(EMOTION_COLORS[lastEmotion]);
      }, 0);

      // 전면형 광고 타이머 설정
      // uiState가 'beads'일 때만 실행되므로 별도 조건 체크 불필요
      const adTimer = setTimeout(() => {
        if (canShowInterstitial()) {
          setShowInterstitial(true);
        }
      }, 0);

      const reportTimer = setTimeout(() => {
        setUiState('report');
      }, SATISFIED_DISPLAY_MS);

      return () => {
        clearTimeout(adTimer);
        clearTimeout(reportTimer);
      };
    }
  }, [uiState, currentState, lastEmotion]);

  // 리포트 표시 후 idle로 복귀
  useEffect(() => {
    if (uiState === 'report') {
      const timer = setTimeout(() => {
        setUiState('idle');
      }, REPORT_DISPLAY_MS);
      return () => clearTimeout(timer);
    }
  }, [uiState]);

  // 모바일 키보드 높이 추적 (입력 모드)
  useEffect(() => {
    if (uiState !== 'input') return;

    const vv = window.visualViewport;
    if (!vv) return;

    const updateKeyboard = () => {
      const kbHeight = Math.max(0, window.innerHeight - vv.height);
      setKeyboardHeight(kbHeight);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    vv.addEventListener('resize', updateKeyboard);
    vv.addEventListener('scroll', updateKeyboard);
    return () => {
      vv.removeEventListener('resize', updateKeyboard);
      vv.removeEventListener('scroll', updateKeyboard);
    };
  }, [uiState]);

  // 감정 분포 계산 (최근 분석 기록 기준)

  // 마지막 분석 신뢰도
  const lastConfidence = emotionHistory.length > 0 ? emotionHistory[emotionHistory.length - 1].confidence : null;

  // 감정 테마 (동적 배경용)
  const currentTheme = EMOTION_THEME[lastEmotion];

  // 감정이 바뀔 때마다 조언 1개 랜덤 선택
  const adviceIndex = useMemo(
    // eslint-disable-next-line react-hooks/purity
    () => Math.floor(Math.random() * EMOTION_THEME[lastEmotion].advice.length),
    [lastEmotion],
  );

  // 모바일 hydration 차단 방지: SSR에서도 전체 렌더링 (로딩 UI는 CSS로 처리)
  if (!mounted) {
    return (
      <div
        className="h-screen w-full flex flex-col overflow-hidden font-dongum text-on-surface"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.bgGradientStart} 0%, #fbf9f6 40%, ${currentTheme.bgGradientEnd} 100%)`,
          transition: 'background 800ms linear',
        }}
      >
        <header className="sticky top-0 z-50 flex justify-between items-center px-[20px] h-16 backdrop-blur-md bg-white/70 border-b border-white/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bubble_chart</span>
            <h1 className="font-dongle text-4xl leading-none text-primary tracking-tight">Mind Jelly</h1>
          </div>
          <NavMenu activeTab="jelly" />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <JellySkeleton />
        </main>
      </div>
    );
  }

  const bodies = [{ position: jellyPos, circleRadius: 60 }];

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden font-dodum text-on-surface"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.bgGradientStart} 0%, #fbf9f6 40%, ${currentTheme.bgGradientEnd} 100%)`,
        transition: 'background 800ms linear',
      }}
    >
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-[20px] h-16 backdrop-blur-md bg-white/70 border-b border-white/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bubble_chart</span>
          <h1 className="font-dongle text-4xl leading-none text-primary tracking-tight">Mind Jelly</h1>
        </div>
        {uiState === 'input' && !isAnalyzing ? (
          <button
            onClick={() => setUiState('idle')}
            className="font-gowun text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            취소
          </button>
        ) : (
          <NavMenu activeTab="jelly" />
        )}
      </header>

      {/* Emotion Status Header */}
      {uiState === 'idle' && (
        <div className="fixed top-16 left-0 w-full z-40 px-[20px] py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: EMOTION_COLORS[lastEmotion], transition: 'background-color 800ms linear' }}
              />
              <span className="font-jakarta text-sm font-semibold text-text-primary">
                {currentTheme.label}
              </span>
              {lastConfidence !== null && (
                <span className="font-gamja text-sm text-on-surface-variant">
                  {lastConfidence >= 0.8 ? '많이' : lastConfidence >= 0.5 ? '어느정도' : '살짝'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <main id="main-content" role="main" className="relative w-full flex-1 flex flex-col items-center overflow-hidden transition-all duration-500">

        {/* Decorative Atmosphere */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[15%] left-[10%] opacity-40">
            <span className="material-symbols-outlined text-6xl text-white">cloud</span>
          </div>
          <div className="absolute top-[25%] right-[15%] opacity-30">
            <span className="material-symbols-outlined text-5xl text-white">cloud</span>
          </div>
          <div className="absolute top-[20%] left-[40%] star-sparkle">
            <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
          </div>
          <div className="absolute bottom-[40%] left-[20%] star-sparkle" style={{ animationDelay: '1s' }}>
            <span className="material-symbols-outlined text-white text-md">auto_awesome</span>
          </div>
          <div className="absolute top-[50%] right-[30%] star-sparkle" style={{ animationDelay: '2s' }}>
            <span className="material-symbols-outlined text-white text-xs">auto_awesome</span>
          </div>
        </div>

        {/* Emotion Beads Canvas (decorative) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {mounted && AMBIENT_BEADS.map(({ emotion, top, left, size, delay }) => (
            <div
              key={emotion}
              className="absolute rounded-full flex items-center justify-center jelly-float shadow-sm border-2 border-white/40"
              style={{
                top,
                left,
                width: size,
                height: size,
                backgroundColor: EMOTION_COLORS[emotion] + 'CC',
                animationDelay: delay,
              }}
            >
              <EmotionFace emotion={emotion} size={Math.round(size * 0.45)} />
            </div>
          ))}
        </div>

        {/* Jelly Container - takes remaining space, jelly centered within */}
        <div
          aria-busy={uiState === 'restoring' || uiState === 'beads'}
          className={`flex-1 flex items-center justify-center ${uiState === 'idle' ? 'pt-28' : 'pt-16'}`}
          style={{
            minHeight: uiState === 'idle' ? '280px' : '160px',
            transform: uiState === 'input' ? 'scale(0.65)' : 'scale(1)',
            transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center top',
          }}
          onPointerDown={(e) => {
            // SPEC-TOUCH-001: 젤리 터치 감지
            const rect = e.currentTarget.getBoundingClientRect();
            handleJellyTouch(e.clientX - rect.left, e.clientY - rect.top);
          }}
        >
          {matterError ? (
            <div className="flex items-center justify-center p-4">
              <p className="text-on-surface-variant text-center text-sm">{matterError}</p>
            </div>
          ) : (
            <>
              <PhysicsCanvas width={800} height={600}>
                {(engine) => {
                  initPhysics(engine);
                  return (
                    <>
                      <JellyRenderer
                        bodies={bodies}
                        face={currentState}
                        animation={0}
                        emotionColor={jellyVisualColor}
                        emotion={jellyVisualEmotion}
                        jellyShape={jellyShape}
                      />
                      {engineRef.current && (
                        <BeadGroup count={beadCount} engine={engineRef.current} emotion={lastEmotion} />
                      )}
                    </>
                  );
                }}
              </PhysicsCanvas>
              {(uiState === 'restoring' || uiState === 'beads') && (
                <span className="sr-only" aria-live="polite">젤리가 감정을 반영하고 있습니다</span>
              )}
            </>
          )}
        </div>

        {/* 전면형 광고 - satisfied→report 전환 시점에 표시 */}
        {showInterstitial && (
          <InterstitialAd
            onClosed={() => {
              setShowInterstitial(false);
            }}
          />
        )}

        {/* 배너 광고 - report 상태일 때만 표시 (REQ-AD-003) */}
        {uiState === 'report' && <BannerAd show={true} />}

        {/* Bottom Content Area (idle: message card + CTA, report: fade-in card) */}
        {(uiState === 'idle' || uiState === 'report') && (
          <div className="w-full flex flex-col items-center gap-3 px-[20px] pb-6">
            {/* Emotional Message Card */}
            <div
              role={uiState === 'report' ? 'status' : undefined}
              aria-live={uiState === 'report' ? 'polite' : undefined}
              className={`w-full max-w-md ${uiState === 'report' ? 'animate-fade-in' : ''}`}
            >
              <div
                className="glass-card rounded-3xl px-5 py-4"
                style={{ transition: 'all 800ms linear' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="font-jakarta text-xs font-semibold text-text-primary">오늘의 감정 리포트</span>
                </div>
                <p className="font-gamja text-base text-text-primary leading-relaxed">
                  {userName
                    ? `${userName}님, ${currentTheme.message}`
                    : currentTheme.message}
                </p>
                <p
                  className="font-gamja text-sm mt-2 leading-relaxed"
                  style={{ color: EMOTION_COLORS[lastEmotion], transition: 'color 800ms linear' }}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1", color: EMOTION_COLORS[lastEmotion] }} aria-hidden="true">tips_and_updates</span>
                  {currentTheme.advice[adviceIndex]}
                </p>
              </div>
            </div>

            {/* CTA Button (report에서는 fade-in 지연 등장, idle에서는 항상 표시) */}
            <div className={`w-full max-w-md ${uiState === 'report' ? 'animate-fade-in-delayed' : ''}`}>
              <button
                onClick={() => setUiState('input')}
                disabled={uiState === 'report'}
                aria-label="감정 표현하기"
                className="w-full h-14 rounded-full bg-primary text-white font-gowun text-base font-semibold shadow-lg hover:scale-[0.98] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-default"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">edit_note</span>
                감정 표현하기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* SPEC-TOUCH-001: 하트 파티클 오버레이 */}
      {heartParticles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
          {heartParticles.map((p) => (
            <HeartParticle
              key={p.id}
              x={p.x}
              y={p.y}
              delay={p.delay}
              offsetX={p.offsetX}
            />
          ))}
        </div>
      )}

      {/* EmotionInput Bottom Sheet (input mode only) */}
      {uiState === 'input' && (
        <section
          className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-md z-40"
          style={{ bottom: (uiState === 'input' ? keyboardHeight : 0) + 24 }}
        >
          <div className="animate-slide-up">
            <EmotionInput onCompleteAction={() => setUiState('restoring')} />
          </div>
        </section>
      )}
    </div>
  );
}
