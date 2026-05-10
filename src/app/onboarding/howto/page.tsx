'use client';

import Link from 'next/link';

export default function HowtoPage() {
  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">
      {/* Top AppBar */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 flex justify-between items-center px-[20px] bg-surface/85 backdrop-blur-[8px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">bubble_chart</span>
          <h1 className="font-dongle text-[24px] text-primary tracking-tight">Mind Jelly</h1>
        </div>
        <button className="p-2 hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined text-on-surface-variant">settings</span>
        </button>
      </header>

      <main className="min-h-screen pt-24 pb-32 px-[20px] bg-welcome-gradient">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold font-caption text-[13px]">2/3</span>
            <div className="flex gap-1">
              <div className="h-1.5 w-4 rounded-full bg-primary"></div>
              <div className="h-1.5 w-4 rounded-full bg-primary"></div>
              <div className="h-1.5 w-4 rounded-full bg-primary/20"></div>
            </div>
          </div>
        </div>

        {/* Heading Section */}
        <div className="text-center mb-12">
          <h2 className="font-dongle text-[48px] text-on-surface mb-0 leading-none">어떻게 하지?</h2>
          <p className="font-gowun text-[16px] text-on-surface-variant">네 감정을 젤리에게 선물해줘.</p>
        </div>

        {/* Visual Onboarding Steps */}
        <div className="flex flex-col gap-10 items-center max-w-md mx-auto">
          {/* Step 1: Illustration Cluster */}
          <div className="relative w-full aspect-square flex items-center justify-center">
            {/* Main Jelly Character */}
            <div className="relative z-10 w-48 h-48 rounded-[45%_55%_50%_50%/50%_50%_50%_50%] bg-jelly-base jelly-float jelly-inner-glow flex items-center justify-center border-4 border-white/40 shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-on-primary-container/60"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-on-primary-container/60"></div>
                </div>
                <div className="w-6 h-2 border-b-2 border-on-primary-container/40 rounded-full"></div>
              </div>
            </div>

            {/* Floating Emotion Beads with Arrows */}
            {/* Joy Bead (Yellow Tone) */}
            <div className="absolute top-0 right-4 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFE5B4] shadow-lg border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[#7A5761] text-[18px]">mood</span>
              </div>
              <span className="material-symbols-outlined text-primary opacity-40 rotate-[135deg]">arrow_downward</span>
            </div>

            {/* Sad Bead (Blue Tone) */}
            <div className="absolute left-4 bottom-10 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary opacity-40 rotate-[-45deg]">arrow_upward</span>
              <div className="w-10 h-10 rounded-full bg-jelly-sad shadow-lg border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[22px]">water_drop</span>
              </div>
            </div>

            {/* Anger Bead (Red Tone) */}
            <div className="absolute top-10 left-8 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-jelly-anger shadow-lg border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]">bolt</span>
              </div>
              <span className="material-symbols-outlined text-primary opacity-40 rotate-[160deg]">arrow_downward</span>
            </div>
          </div>

          {/* Step Details (Bento Grid Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Step 1 Card */}
            <div className="glass-card p-6 rounded-lg text-center shadow-sm border border-white/20">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-dongle flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <p className="font-gowun text-[16px] text-on-surface">
                오늘 기분을<br />적어봐
              </p>
            </div>

            {/* Step 2 Card */}
            <div className="glass-card p-6 rounded-lg text-center shadow-sm border border-white/20">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-dongle flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <p className="font-gowun text-[16px] text-on-surface">
                젤리가 맛있게<br />먹어줄 거예요
              </p>
            </div>

            {/* Step 3 Card */}
            <div className="glass-card p-6 rounded-lg text-center shadow-sm border border-white/20">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-dongle flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <p className="font-gowun text-[16px] text-on-surface">
                마음이 한결<br />가벼워져요
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Button Navigation */}
      <footer className="fixed bottom-0 left-0 w-full p-[20px] bg-surface/85 backdrop-blur-[8px] z-50">
        <div className="max-w-md mx-auto">
          <Link
            href="/onboarding/ready"
            className="w-full h-14 bg-primary text-on-primary rounded-full font-gowun text-xl shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>다음</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </footer>

      {/* Decorative Elements (Blobs) */}
      <div className="fixed top-20 -left-20 w-64 h-64 bg-primary-container/20 rounded-full blur-[60px] -z-10"></div>
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-tertiary-container/20 rounded-full blur-[80px] -z-10"></div>
    </div>
  );
}
