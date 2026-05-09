'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';
import { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { jellyStore } from '@/stores/jellyStore';
import { tossStore } from '@/stores/tossStore';
import { usePhysicsInit } from './usePhysicsInit';

const PhysicsCanvas = dynamic(
  () => import('@/components/jelly/PhysicsCanvas').then((m) => m.PhysicsCanvas),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center text-on-surface-variant">로딩중...</div> }
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

const emptySubscribe = () => () => {};

export default function HomePage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [matterReady, setMatterReady] = useState(false);
  const [jellyPos, setJellyPos] = useState({ x: 400, y: 200 });
  const matterRef = useRef<typeof import('matter-js') | null>(null);

  const currentState = jellyStore((s) => s.currentState);
  const beadCount = jellyStore((s) => s.beadCount);
  const lastEmotion = jellyStore((s) => s.lastEmotion);
  const emotionColor = jellyStore((s) => s.emotionColor);

  // M4-T5: Toss WebView 분기 처리
  const isWebView = tossStore((s) => s.isWebView);
  const userInfo = tossStore((s) => s.userInfo);

  // 물리 엔진 초기화 훅
  const { engineRef, initPhysics } = usePhysicsInit({
    matterReady,
    matterRef,
    setJellyPos,
  });

  useEffect(() => {
    import('matter-js').then((M) => {
      matterRef.current = M;
      setMatterReady(true);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#E6E6FA] via-[#fbf9f6] to-[#ffd9e2]">
        <div className="text-on-surface-variant font-body-md">로딩중...</div>
      </div>
    );
  }

  const bodies = [{ position: jellyPos, circleRadius: 40 }];

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-[#E6E6FA] via-[#fbf9f6] to-[#ffd9e2] font-dodum text-on-surface">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-[20px] h-16 backdrop-blur-md bg-white/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bubble_chart</span>
          <h1 className="font-dongle text-4xl leading-none text-primary tracking-tight">Mind Jelly</h1>
          {/* M4-T5: WebView 인사말 */}
          {isWebView && userInfo && (
            <span className="font-gowun text-sm text-on-surface-variant ml-2">
              {userInfo.name}님, 반가워요!
            </span>
          )}
        </div>
        {!isWebView && (
          <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity active:scale-95 duration-200">
            <span className="material-symbols-outlined text-primary text-2xl">settings</span>
          </Link>
        )}
      </header>

      {/* Main Canvas Area */}
      <main className="relative w-full flex-1 flex items-center justify-center overflow-hidden pt-16 pb-32">
        {/* Decorative Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Clouds */}
          <div className="absolute top-[15%] left-[10%] opacity-40">
            <span className="material-symbols-outlined text-6xl text-white">cloud</span>
          </div>
          <div className="absolute top-[25%] right-[15%] opacity-30">
            <span className="material-symbols-outlined text-5xl text-white">cloud</span>
          </div>
          {/* Twinkles */}
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

        {/* Emotion Beads Canvas (decorative, actual beads rendered by physics engine) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bead: Joy */}
          <div className="absolute top-[30%] left-[25%] w-6 h-6 rounded-full bg-yellow-200 border-2 border-yellow-300 shadow-sm flex items-center justify-center animate-pulse pointer-events-auto cursor-pointer hover:scale-110 transition-transform">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-on-surface-variant rounded-full"></div>
              <div className="w-1 h-1 bg-on-surface-variant rounded-full"></div>
            </div>
          </div>
          {/* Bead: Sadness */}
          <div className="absolute top-[45%] right-[20%] w-4 h-4 rounded-full bg-jelly-sad border-2 border-blue-200 shadow-sm flex items-center justify-center pointer-events-auto cursor-pointer hover:scale-110 transition-transform">
            <div className="w-1 h-0.5 bg-on-surface-variant rounded-full"></div>
          </div>
          {/* Bead: Anger */}
          <div className="absolute bottom-[45%] left-[30%] w-5 h-5 rounded-full bg-jelly-anger border-2 border-red-200 shadow-sm flex items-center justify-center pointer-events-auto cursor-pointer hover:scale-110 transition-transform">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
          {/* Bead: Disgust */}
          <div className="absolute top-[20%] right-[40%] w-4 h-4 rounded-full bg-green-200 border-2 border-green-300 shadow-sm flex items-center justify-center pointer-events-auto cursor-pointer hover:scale-110 transition-transform">
            <div className="w-1.5 h-1.5 border-t border-on-surface-variant rounded-full"></div>
          </div>
        </div>

        {/* Physics Engine Canvas */}
        <PhysicsCanvas width={800} height={600}>
          {(engine) => {
            initPhysics(engine);

            return (
              <>
                <JellyRenderer
                  bodies={bodies}
                  face={currentState}
                  animation={0}
                  emotionColor={emotionColor}
                />
                {engineRef.current && (
                  <BeadGroup count={beadCount} engine={engineRef.current} emotion={lastEmotion} />
                )}
              </>
            );
          }}
        </PhysicsCanvas>
      </main>

      {/* Bottom Sheet (Collapsed) - Emotion Input */}
      <section className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-md z-40">
        <EmotionInput />
      </section>

      {/* Bottom Navigation */}
      <BottomNav activeTab="jelly" />
    </div>
  );
}
