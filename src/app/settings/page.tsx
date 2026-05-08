'use client';

import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';

export default function SettingsPage() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32 overflow-x-hidden">
      {/* Top AppBar */}
      <header className="bg-surface/85 backdrop-blur-[8px] fixed top-0 left-0 z-40 w-full">
        <div className="flex justify-between items-center w-full px-[20px] h-16">
          <Link href="/home" className="text-primary hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-dongle text-5xl text-primary tracking-tight leading-none">설정</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="mt-20 px-[20px] space-y-[12px]">
        {/* Jelly Appearance Section */}
        <section className="space-y-[8px]">
          <h2 className="font-dongle text-5xl text-primary leading-none px-2">색상 테마</h2>
          <div className="glass-card rounded-lg p-[24px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40">
            <div className="flex items-center gap-[24px]">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="w-20 h-20 bg-jelly-base rounded-full blur-[2px] jelly-float shadow-[inset_-4px_-8px_15px_rgba(255,255,255,0.6),0_8px_15px_rgba(0,0,0,0.05)] relative overflow-hidden">
                  <div className="absolute top-1/3 left-1/4 w-2 h-1.5 bg-on-primary-container rounded-full opacity-60"></div>
                  <div className="absolute top-1/3 right-1/4 w-2 h-1.5 bg-on-primary-container rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-on-primary-container/40 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-[16px] flex-1">
                <button className="w-10 h-10 rounded-full bg-jelly-base ring-4 ring-primary-container border-2 border-white shadow-sm"></button>
                <button className="w-10 h-10 rounded-full bg-jelly-tired border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-secondary-container border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-jelly-sad border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-tertiary-fixed border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-jelly-anger border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
              </div>
            </div>
            <p className="text-on-surface-variant mt-[16px] text-center font-gamja text-lg">젤리의 기분에 맞춰 색상을 변경해보세요</p>
          </div>
        </section>

        {/* Sound Settings Section */}
        <section className="space-y-[8px]">
          <h2 className="font-dongle text-5xl text-primary leading-none px-2">소리 설정</h2>
          <div className="glass-card rounded-lg p-[24px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 space-y-[24px]">
            <div className="flex justify-between items-center">
              <span className="font-gowun text-[16px] text-on-surface">배경 음악</span>
              <button className="w-12 h-6 bg-primary-container rounded-full relative transition-colors">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
            <div className="space-y-[4px]">
              <div className="flex justify-between items-center text-[13px] font-gowun text-on-surface-variant">
                <span>볼륨</span>
                <span>70%</span>
              </div>
              <div className="h-2 w-full bg-primary-container/30 rounded-full relative">
                <div className="h-full w-[70%] bg-primary rounded-full relative">
                  <div className="absolute -right-2 -top-1.5 w-5 h-5 bg-white border-4 border-primary rounded-full shadow-md"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-gowun text-[16px] text-on-surface">효과음</span>
              <button className="w-12 h-6 bg-primary-container rounded-full relative transition-colors">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-[8px]">
          <h2 className="font-dongle text-5xl text-primary leading-none px-2">알림</h2>
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">데일리 리마인더</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">스트레스 분석 알림</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
            <div className="p-[16px] flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">방해 금지 모드</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-[8px]">
          <h2 className="font-dongle text-5xl text-primary leading-none px-2">정보</h2>
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center">
              <span className="font-gowun text-[16px] text-on-surface">버전 정보</span>
              <span className="text-on-surface-variant font-gowun">v1.2.4</span>
            </div>
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">도움말</span>
              <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
            </div>
            <div className="p-[16px] flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer text-error">
              <span className="font-gowun text-[16px]">데이터 초기화</span>
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
          </div>
        </section>

        {/* Decorative Element */}
        <div className="pt-[32px] flex flex-col items-center opacity-40">
          <span className="material-symbols-outlined text-[32px] text-primary mb-2">bubble_chart</span>
          <p className="font-dongle text-2xl text-primary">Mind Jelly with Love</p>
        </div>
      </main>

      <BottomNav activeTab="garden" />

      {/* Background Illustration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary-container rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-secondary-container rounded-full blur-[60px]"></div>
      </div>
    </div>
  );
}
