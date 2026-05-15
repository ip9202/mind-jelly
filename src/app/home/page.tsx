'use client';

import dynamic from 'next/dynamic';
import { JellySkeleton } from '@/components/jelly/JellySkeleton';
import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from 'react';
import { jellyStore } from '@/stores/jellyStore';
import { rewardStore } from '@/stores/rewardStore';
import { usePhysicsInit } from './usePhysicsInit';
import { EMOTION_THEME, EMOTION_COLORS, JELLY_COLOR } from '@/lib/constants/emotion';
import { isTouchOnJelly, shouldHandleTouch } from '@/lib/utils/touchHandler';
import { createHeartParticles } from '@/components/jelly/HeartParticle';
import { EmotionFace } from '@/components/jelly/EmotionFace';
import { InterstitialAd } from '@/components/ads/InterstitialAd';
import { BannerAd } from '@/components/ads/BannerAd';
import { canShowInterstitial, recordRewardedAdShown } from '@/lib/ad/adFrequencyControl';
import { canShowRewardedAd } from '@/stores/rewardStore';
import type { EmotionType } from '@/types/emotion';
import type { RewardType } from '@/components/ads/RewardedAdModal';
import type { EmotionHistoryItem } from '@/lib/rewards/weeklyReport';
import BottomNav from '@/components/layout/BottomNav';

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

const EmotionReportCard = dynamic(
  () => import('@/components/visualization/EmotionReportCard').then((m) => m.EmotionReportCard),
  { ssr: false }
);

const EmotionStatsBottomSheet = dynamic(
  () => import('@/components/visualization/EmotionStatsBottomSheet').then((m) => m.EmotionStatsBottomSheet),
  { ssr: false }
);

const RewardedAdModal = dynamic(
  () => import('@/components/ads/RewardedAdModal').then((m) => m.RewardedAdModal),
  { ssr: false }
);

const emptySubscribe = () => () => {};

// @MX:NOTE: [AUTO] 감정 표현 UI 상태머신 (idle→input→restoring→beads→report→idle)
type UiState = 'idle' | 'input' | 'restoring' | 'beads' | 'report';

// @MX:NOTE: 플로우 전환 타이밍 상수
const RESTORE_DURATION_MS = 500;
const SATISFIED_DISPLAY_MS = 3000;

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
  // @MX:NOTE: 초기 placeholder — 물리 엔진 초기화 후 매 프레임 갱신됨 (usePhysicsInit cy=300과 동기화)
  const jellyPosRef = useRef({ x: 400, y: 300 });
  const matterRef = useRef<typeof import('matter-js') | null>(null);
  const [uiState, setUiState] = useState<UiState>('idle');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const statsButtonRef = useRef<HTMLButtonElement>(null);

  // SPEC-AD-003: 보상형 광고 모달 상태 (REQ-RWD-001)
  const [showRewardedModal, setShowRewardedModal] = useState(false);
  const [showRewardedCTA, setShowRewardedCTA] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardType | null>(null);

  // SPEC-TOUCH-001: 하트 파티클 상태
  const [heartParticles, setHeartParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    delay: number;
    offsetX: number;
  }>>([]);

  // SPEC-TOUCH-001: CSS keyframe 바운스 트리거 (key 변화로 애니메이션 재시작)
  const [bounceKey, setBounceKey] = useState(0);



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

  // Zustand store에서 필요한 값들을 구독
  const currentState = jellyStore((s) => s.currentState);
  const lastEmotion = jellyStore((s) => s.lastEmotion);
  const emotionHistoryRaw = jellyStore((s) => s.emotionHistory);
  const lastInputText = jellyStore((s) => s.lastInputText);
  const jellyName = jellyStore((s) => s.jellyName);
  const jellyShape = jellyStore((s) => s.jellyShape);
  const isInitialized = jellyStore((s) => s.isInitialized);
  const activeSkin = rewardStore((s) => s.activeSkin);
  const skinEnabled = rewardStore((s) => s.skinEnabled);
  const rewardedAdCount = rewardStore((s) => s.rewardedAdCount);

  // store의 lastEmotion 변경 시 로컬 시각 상태 동기화
  // idle 상태에서만 동기화 (분석 플로우 중에는 구슬을 다 먹은 후에 색이 변하도록 함)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (uiState !== 'idle') return;
    setJellyVisualEmotion(lastEmotion);
    setJellyVisualColor(EMOTION_COLORS[lastEmotion]);
  }, [lastEmotion, uiState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 감정 리포트에 표시할 사용자 이름 (온보딩에서 설정한 jellyName)
  const userName = jellyName && jellyName !== '내 젤리' ? jellyName : null;

  // 물리 엔진 초기화 훅
  // @MX:NOTE: activateBounce는 SPEC-TOUCH-001 CSS 전환 후 더 이상 사용하지 않음 (호환성 유지)
  const { engineRef, initPhysics } = usePhysicsInit({
    matterReady,
    matterRef,
    jellyPosRef,
  });

  // @MX:NOTE: [AUTO] SPEC-TOUCH-001: 젤리 터치 핸들러
  // @MX:REASON: idle 상태에서만 반응, 1초 쿨다운, hit-test 후 happy 전이 + 바운스 + 파티클
  const handleJellyTouch = useCallback(
    (screenX: number, screenY: number, canvasX: number, canvasY: number) => {
      // report 상태에서 탭하면 idle로 복귀
      if (uiState === 'report') {
        const st = jellyStore.getState();
        if (st.currentState === 'satisfied') {
          st.transitionState('idle');
        }
        setUiState('idle');
        return;
      }

      const st = jellyStore.getState();
      const onJelly = isTouchOnJelly(canvasX, canvasY, jellyPosRef.current, 60);

      const shouldHandle = shouldHandleTouch({
        currentState: st.currentState,
        canTouch: st.canTouch(),
        isOnJelly: onJelly,
      });

      if (!shouldHandle) {
        return;
      }

      // happy 상태 전이
      st.triggerHappy();

      // SPEC-TOUCH-001: CSS keyframe 바운스 트리거 (key 변화로 애니메이션 재시작)
      // @MX:NOTE: Matter.js 물리 임펄스 대신 CSS squash & stretch 애니메이션으로 부드러움 확보
      setBounceKey((k) => k + 1);

      // 하트 파티클 생성
      const particles = createHeartParticles(screenX, screenY);
      setHeartParticles(particles);

      // 1.5초 후 파티클 제거
      setTimeout(() => {
        setHeartParticles([]);
      }, 1500);
    },
    [uiState],
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
        // 젤리가 원래 크기로 복원된 후 구슬 생성 (BeadGroup에 상수 5 전달)
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


  // 리포트 상태 관리
  useEffect(() => {
    if (uiState !== 'report') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowInterstitial(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowRewardedCTA(false);
      return;
    }
    // report 진입 시 보상형 CTA 표시 → 4초 후 자동 숨김
    if (canShowRewardedAd()) {
      setShowRewardedCTA(true);
      const timer = setTimeout(() => setShowRewardedCTA(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [uiState]);

  // 안전망: uiState가 'idle'인데 jellyStore가 'satisfied'에 stuck된 경우 강제 복구
  // @MX:NOTE: 외부 경로(예: 페이지 리프레시, persist 복원 직후)로 idle 진입 시에도 정상화 보장
  useEffect(() => {
    if (uiState === 'idle' && currentState === 'satisfied') {
      jellyStore.getState().transitionState('idle');
    }
  }, [uiState, currentState]);

  // SPEC-AD-003 (REQ-RWD-008): 앱 로드 시 스킨 만료 체크
  useEffect(() => {
    rewardStore.getState().checkSkinExpiration();
  }, []);

  // @MX:NOTE: [AUTO] emotionHistory → EmotionHistoryItem 변환 (REQ-RWD-004)
  // @MX:REASON: jellyStore.emotionHistory는 AnalysisResponse[], weeklyReport는 EmotionHistoryItem[] 필요
  const emotionHistory: EmotionHistoryItem[] = emotionHistoryRaw.map((item, i) => ({
    emotion: item.emotion,
    confidence: item.confidence,
    // eslint-disable-next-line react-hooks/purity
    timestamp: new Date(Date.now() - (emotionHistoryRaw.length - 1 - i) * 86400000).toISOString(),
  }));

  // SPEC-AD-003: 보상형 광고 CTA 클릭 핸들러 (REQ-RWD-001)
  const handleCTAClick = useCallback(() => {
    setShowRewardedModal(true);
    setSelectedReward(null);
  }, []);

  // SPEC-AD-003: 보상 선택 핸들러 (REQ-RWD-002/003/006)
  const handleRewardSelect = useCallback((reward: RewardType) => {
    setSelectedReward(reward);
  }, []);

  // SPEC-AD-003: 보상 지급 콜백 (REQ-RWD-006/007)
  const handleRewardClaimed = useCallback((reward: RewardType) => {
    const store = rewardStore.getState();
    // REQ-RWD-006: 모든 보상에 대해 이력 기록
    store.addReward({ type: reward, claimedAt: new Date().toISOString() });
    store.incrementRewardedAdCount();
    // REQ-RWD-007: 빈도 제어 기록
    recordRewardedAdShown();
  }, []);


  // 감정 분포 계산 (최근 분석 기록 기준)

  // 감정 테마 (동적 배경용)
  const currentTheme = EMOTION_THEME[lastEmotion];

  // 모바일 hydration 차단 방지: SSR에서도 전체 렌더링 (로딩 UI는 CSS로 처리)
  // isInitialized: 비동기 초기화(checkDiaryAndReset) 완료 전까지 스켈레톤 유지
  if (!mounted || !isInitialized) {
    return (
      <div
        className="h-screen w-full flex flex-col overflow-hidden font-dongle text-on-surface"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.bgGradientStart} 0%, #fbf9f6 40%, ${currentTheme.bgGradientEnd} 100%)`,
          transition: 'background 800ms linear',
        }}
      >
        <main className="flex-1 flex items-center justify-center">
          <JellySkeleton />
        </main>
      </div>
    );
  }

  // @MX:NOTE: PhysicsCanvas의 render prop이 매 프레임 호출되어 최신 ref 값을 JSX로 전달
  // eslint-disable-next-line react-hooks/refs
  const bodies = [{ position: jellyPosRef.current, circleRadius: 60 }];

  return (
    <div
      className="h-screen w-full flex flex-col font-gowun text-on-surface"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.bgGradientStart} 0%, #fbf9f6 40%, ${currentTheme.bgGradientEnd} 100%)`,
        transition: 'background 800ms linear',
      }}
    >
      {/* Main Canvas Area */}
      <main id="main-content" role="main" className="relative w-full flex-1 flex flex-col items-center overflow-hidden pb-bottom-nav transition-all duration-500">

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
          className="flex-1 flex items-center justify-center"
          style={{
            minHeight: uiState === 'idle' ? '280px' : '160px',
            transform: 'scale(1)',
            transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center top',
          }}
          onPointerDown={(e) => {
            // SPEC-TOUCH-001: 젤리 터치 감지
            // PhysicsCanvas 컨테이너 rect 사용 (외부 컨테이너보다 작아 중앙 정렬됨)
            const canvasEl = e.currentTarget.querySelector('[data-canvas-container]') as HTMLElement;
            const rect = canvasEl?.getBoundingClientRect() ?? e.currentTarget.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            // 캔버스 좌표(800x600)로 변환
            const canvasX = (relX / rect.width) * 800;
            const canvasY = (relY / rect.height) * 600;

            // 화면 좌표(하트 파티클용)와 캔버스 좌표(hit-test용) 함께 전달
            handleJellyTouch(e.clientX, e.clientY, canvasX, canvasY);
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
                        bounceKey={bounceKey}
                        skinId={skinEnabled ? activeSkin?.id : undefined}
                      />
                      {/* 감정 분석 결과가 있을 때만 구슬 렌더링 */}
                      {engineRef.current && uiState === 'beads' && (
                        <BeadGroup count={5} engine={engineRef.current} emotion={lastEmotion} />
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



        {/* Bottom Content Area (idle: message card + CTA, report: fade-in card) */}
        {(uiState === 'idle' || uiState === 'report') && (
          <div className="w-full flex flex-col items-center px-[20px] pb-6">
            {/* SPEC-UI-002/003: EmotionReportCard 내부에 듀얼 CTA 통합 */}
            <div
              role={uiState === 'report' ? 'status' : undefined}
              aria-live={uiState === 'report' ? 'polite' : undefined}
              className={`w-full max-w-md ${uiState === 'report' ? 'animate-fade-in' : ''}`}
            >
              <EmotionReportCard
                userName={userName}
                currentEmotion={lastEmotion}
                actions={
                  <div className={`flex gap-2 ${uiState === 'report' ? 'animate-fade-in-delayed' : ''}`}>
                    {/* 좌측 primary: 감정 표현하기 */}
                    <button
                      onClick={() => {
                        if (showStatsSheet) setShowStatsSheet(false);
                        setUiState('input');
                      }}
                      disabled={uiState === 'report'}
                      aria-label="감정 표현하기"
                      className="flex-[2] h-11 rounded-xl text-on-primary font-gowun text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-default active:scale-[0.97] hover:shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #FF9ECD 0%, #FFD1DC 100%)',
                        boxShadow: '0 2px 8px rgba(255, 158, 205, 0.35)',
                      }}
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">edit_note</span>
                      감정 표현하기
                    </button>

                    {/* 우측 secondary: 통계 보기 (아이콘만, 정사각형) */}
                    <button
                      ref={statsButtonRef}
                      onClick={() => setShowStatsSheet(true)}
                      disabled={uiState !== 'idle' && uiState !== 'report'}
                      aria-label="감정 통계 보기"
                      className="w-11 h-11 rounded-xl bg-white/40 border border-accent/40 text-accent flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-default active:scale-[0.97] hover:bg-white/60 hover:shadow-md"
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">bar_chart</span>
                    </button>
                  </div>
                }
              />
            </div>

            {/* 배너 광고 - report 상태, 보상형 버튼 위에 표시 */}
            {uiState === 'report' && <BannerAd show={true} />}

            {/* SPEC-AD-003 (REQ-RWD-001): 보상형 광고 CTA 버튼 - report 진입 후 4초간 표시 */}
            {showRewardedCTA && (
              <button
                onClick={handleCTAClick}
                aria-label="광고 보고 보상 받기"
                className="w-full max-w-md mt-3 h-11 rounded-xl text-white font-gowun text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] hover:shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)',
                }}
                data-testid="rewarded-ad-cta"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">redeem</span>
                광고 보고 보상 받기
              </button>
            )}

          </div>
        )}
      </main>

      {/* 전면형 광고 — main 바깥에 위치 (overflow-hidden 부모에 갇히지 않도록) */}
      {showInterstitial && (
        <InterstitialAd
          onClosed={() => {
            setShowInterstitial(false);
          }}
        />
      )}

      {/* 전역 BottomNav (햄버거 메뉴 대체) — input 모드에서는 입력폼과 충돌하므로 숨김 */}
      {uiState !== 'input' && <BottomNav activeTab="jelly" />}

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

      {/* SPEC-UI-002: 감정 통계 바텀시트 */}
      <EmotionStatsBottomSheet
        isOpen={showStatsSheet}
        onClose={() => setShowStatsSheet(false)}
        triggerRef={statsButtonRef}
      />



      {/* EmotionInput: fixed bottom-0, 젤리 변화 없음 */}
      {/* interactiveWidget:resizes-visual 설정으로 키보드가 올라오면 자동으로 키보드 위에 붙음 */}
      {uiState === 'input' && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 z-40 animate-slide-up">
          <EmotionInput
            onCompleteAction={() => setUiState('restoring')}
            onCancelAction={() => setUiState('idle')}
          />
        </div>
      )}

      {/* SPEC-AD-003: 보상형 광고 모달 (REQ-RWD-001~008) */}
      <RewardedAdModal
        isOpen={showRewardedModal}
        onClose={() => {
          setShowRewardedModal(false);
          setSelectedReward(null);
        }}
        onSelectReward={handleRewardSelect}
        selectedReward={selectedReward ?? undefined}
        emotionHistory={emotionHistory}
        latestDiaryText={lastInputText}
        rewardedAdCount={rewardedAdCount}
        onRewardClaimed={handleRewardClaimed}
      />
    </div>
  );
}
