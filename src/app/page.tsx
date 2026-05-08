'use client';

import Link from 'next/link';

export default function SplashPage() {
  return (
    <>
      {/* Splash Screen Container */}
      <main className="relative w-full h-screen flex flex-col items-center justify-between py-16 px-[20px] bg-gradient-splash">
        {/* Decorative Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="material-symbols-outlined absolute text-primary/30 text-[32px] top-[15%] left-[10%] opacity-60">favorite</span>
          <span className="material-symbols-outlined absolute text-secondary/30 text-[24px] top-[25%] right-[15%] opacity-50">star</span>
          <span className="material-symbols-outlined absolute text-primary/40 text-[20px] bottom-[30%] left-[20%] opacity-40">favorite</span>
          <span className="material-symbols-outlined absolute text-tertiary/30 text-[28px] top-[60%] right-[10%] opacity-60">pets</span>
          <span className="material-symbols-outlined absolute text-primary/20 text-[40px] bottom-[10%] right-[25%] opacity-30">bubble_chart</span>
        </div>

        {/* Top Spacing */}
        <div className="h-12"></div>

        {/* Hero Section: The Jelly */}
        <div className="flex flex-col items-center justify-center w-full flex-grow space-y-8">
          {/* Jelly Character Container */}
          <div className="relative w-64 h-64 flex items-center justify-center jelly-float">
            {/* Soft Glow Behind Jelly */}
            <div className="absolute inset-0 bg-jelly-base blur-[60px] opacity-40 rounded-full"></div>

            {/* Jelly Illustration */}
            <div className="relative w-56 h-48 bg-jelly-base rounded-[45%_45%_35%_35%] shadow-[inset_-10px_-10px_30px_rgba(255,255,255,0.6),inset_10px_10px_30px_rgba(120,85,94,0.15)] flex flex-col items-center justify-center overflow-hidden border-b-8 border-primary/10">
              {/* Jelly Eyes */}
              <div className="flex space-x-12 mb-2">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
                <div className="w-4 h-4 bg-primary rounded-full"></div>
              </div>
              {/* Jelly Blush */}
              <div className="absolute flex justify-between w-40 px-4">
                <div className="w-6 h-3 bg-red-300/40 rounded-full blur-sm"></div>
                <div className="w-6 h-3 bg-red-300/40 rounded-full blur-sm"></div>
              </div>
              {/* Jelly Smile */}
              <div className="w-6 h-3 border-b-4 border-primary rounded-full"></div>
            </div>
          </div>

          {/* Branding */}
          <div className="text-center space-y-2 z-10">
            <h1 className="font-dongle text-[64px] font-bold text-primary tracking-tight leading-none">마인드 젤리</h1>
            <p className="font-gamja text-[24px] text-on-surface-variant opacity-80 leading-tight">오늘 하루, 젤리에게 맡겨요</p>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="w-full max-w-sm px-6 pb-4">
          <Link
            href="/onboarding/welcome"
            className="w-full py-5 rounded-lg bg-gradient-to-r from-primary-container to-primary/20 text-on-primary-container font-jakarta shadow-lg shadow-primary/10 hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center space-x-3 group block text-center"
          >
            <span className="font-jakarta text-[24px] font-bold">시작하기</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
          </Link>
          <p className="mt-6 text-center font-caption text-[13px] text-on-surface-variant/60">
            로그인 없이 바로 시작할 수 있어요
          </p>
        </div>
      </main>

      {/* Content Cards (Decorative Background) */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-[#E6E6FA] via-[#fbf9f6] to-[#FFE5D9]"></div>
      </div>
    </>
  );
}
