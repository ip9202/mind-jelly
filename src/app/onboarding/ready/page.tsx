'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jellyStore } from '@/stores/jellyStore';

export default function ReadyPage() {
  const [jellyName, setJellyName] = useState('');
  const router = useRouter();

  const handleStart = () => {
    const name = jellyName.trim() || '내 젤리';
    jellyStore.getState().setJellyName(name);
    router.push('/home');
  };

  return (
    <div className="bg-welcome-gradient min-h-screen flex flex-col font-body-md text-on-background overflow-hidden">
      {/* Header (Suppressed Navigation as per Destination Rule) */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-[20px] h-16 backdrop-blur-md bg-white/10">
        <div className="text-primary tracking-tight">
          <div className="flex items-center gap-[4px]">
            <span className="material-symbols-outlined text-3xl">pill</span>
            <span className="font-dongle text-4xl">Mind Jelly</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold font-caption text-[13px]">3/3</span>
          <div className="flex gap-1">
            <div className="h-1.5 w-4 rounded-full bg-primary"></div>
            <div className="h-1.5 w-4 rounded-full bg-primary"></div>
            <div className="h-1.5 w-4 rounded-full bg-primary"></div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center px-[20px] pb-32 relative pt-32">
        {/* Celebration Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-10 w-4 h-4 rounded-full bg-jelly-base"></div>
          <div className="absolute top-1/3 right-12 w-6 h-6 rounded-lg rotate-12 bg-jelly-sad"></div>
          <div className="absolute bottom-1/4 left-16 w-3 h-3 rounded-sm rotate-45 bg-jelly-anger"></div>
          <div className="absolute top-1/2 right-20 w-5 h-5 rounded-full bg-jelly-tired"></div>
        </div>

        {/* Character Focus */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary-container/30 blur-3xl rounded-full scale-150"></div>

          {/* Jelly Character: Party State */}
          <div className="jelly-float relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-jelly-base rounded-full opacity-80 backdrop-blur-sm border-4 border-white/40 shadow-[inset_0_4px_12px_rgba(255,255,255,0.8)]"></div>

            {/* Simple SVG Face */}
            <svg className="w-24 h-24 relative z-10" viewBox="0 0 100 100">
              <path d="M30 45 Q35 40 40 45" fill="none" stroke="#78555e" strokeLinecap="round" strokeWidth="4"></path>
              <path d="M60 45 Q65 40 70 45" fill="none" stroke="#78555e" strokeLinecap="round" strokeWidth="4"></path>
              <path d="M40 65 Q50 75 60 65" fill="none" stroke="#78555e" strokeLinecap="round" strokeWidth="4"></path>
              <circle cx="25" cy="55" fill="#FFB3A7" opacity="0.6" r="5"></circle>
              <circle cx="75" cy="55" fill="#FFB3A7" opacity="0.6" r="5"></circle>
            </svg>

            {/* Party Hat Accessory */}
            <div className="absolute -top-4 right-10 rotate-12">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                celebration
              </span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="font-dongle text-primary leading-none text-5xl whitespace-nowrap tracking-tight">
            준비 완료! 시작해볼까?
          </h1>
        </div>

        {/* Naming Input Section */}
        <div className="w-full max-w-sm space-y-[16px]">
          <div className="glass-panel p-1 rounded-xl shadow-sm border border-white/40 focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-300">
            <input
              className="w-full bg-transparent border-none focus:ring-0 px-[16px] py-4 font-gamja text-lg text-on-surface placeholder:text-outline-variant text-center"
              placeholder="젤리 이름 지어주기"
              type="text"
              value={jellyName}
              onChange={(e) => setJellyName(e.target.value)}
            />
          </div>
          <p className="text-center text-outline font-gamja text-[13px]">
            나만의 소중한 젤리에게 이름을 선물해줘.
          </p>
        </div>
      </main>

      {/* Bottom Action Area */}
      <footer className="fixed bottom-0 left-0 w-full p-[20px] flex flex-col items-center">
        <button
          onClick={handleStart}
          className="w-full max-w-sm h-14 bg-primary text-white rounded-full font-gowun text-base font-semibold shadow-lg hover:scale-[0.98] active:scale-95 transition-all duration-300 flex items-center justify-center"
        >
          시작!
        </button>

        {/* Subtle Background Glow behind button */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-3xl -z-10"></div>
      </footer>

      {/* Illustrative Celebration Elements (CSS-only, no external images) */}
      <div className="fixed left-4 md:left-20 w-32 h-32 pointer-events-none -rotate-12 opacity-60 top-28">
        <div className="w-full h-full rounded-full bg-primary/20 blur-2xl"></div>
      </div>
      <div className="fixed right-4 md:right-24 w-36 h-36 pointer-events-none rotate-12 opacity-60 top-32">
        <div className="w-full h-full rounded-full bg-jelly-joy/20 blur-2xl"></div>
      </div>
    </div>
  );
}
