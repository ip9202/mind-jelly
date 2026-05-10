'use client';

import Link from 'next/link';

export default function WelcomePage() {
  return (
    <>
      {/* Full Screen Soft Pastel Gradient Canvas */}
      <main className="relative h-screen w-full flex flex-col items-center justify-between py-16 px-[20px] bg-welcome-gradient">
        {/* Header / Logo Placeholder (Hidden for focused onboarding flow) */}
        <div className="w-full flex justify-center">
          <span className="font-dongle text-5xl text-primary/40 select-none">Mind Jelly</span>
        </div>

        {/* Central Character Section */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-8">
          {/* The Jelly (Main Character) */}
          <div className="relative w-64 h-64 jelly-float">
            {/* Inner Glow / Soft Body */}
            <div className="absolute inset-0 bg-jelly-base rounded-full opacity-80 blur-xl"></div>
            <div className="relative w-full h-full bg-jelly-base rounded-[40%_60%_70%_30%/40%_50%_60%_50%] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.05),inset_10px_10px_30px_rgba(255,255,255,0.6)] flex items-center justify-center overflow-visible">
              {/* Jelly Face */}
              <div className="flex flex-col gap-2 items-center -mt-4">
                <div className="flex gap-8">
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full"></div>
                </div>
                <div className="w-6 h-3 border-b-2 border-primary/40 rounded-full"></div>
              </div>

              {/* Waving Hand Illustration Component */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                <div className="w-12 h-12 bg-jelly-base rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.05),inset_4px_4px_10px_rgba(255,255,255,0.8)] rotate-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/40 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    front_hand
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="text-center space-y-4">
            <h1 className="font-dongle leading-none text-primary text-[64px] whitespace-nowrap tracking-tight">
              안녕! 나는 마인드 젤리야
            </h1>
            <p className="font-gowun text-lg text-text-primary/70 tracking-tight">
              너의 감정을 먹고 커가는 젤리 친구
            </p>
          </div>
        </div>

        {/* Navigation & Progress */}
        <div className="w-full max-w-md flex flex-col items-center gap-10">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold font-caption text-[13px]">1/3</span>
            <div className="flex gap-1">
              <div className="h-1.5 w-4 rounded-full bg-primary"></div>
              <div className="h-1.5 w-4 rounded-full bg-primary/20"></div>
              <div className="h-1.5 w-4 rounded-full bg-primary/20"></div>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/onboarding/howto"
            className="w-full h-14 bg-primary text-on-primary rounded-full font-gowun text-xl shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>다음</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed -top-20 -left-20 w-80 h-80 bg-jelly-tired/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-primary-container/30 rounded-full blur-[120px] pointer-events-none"></div>
    </>
  );
}
