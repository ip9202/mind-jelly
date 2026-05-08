'use client';

import BottomNav from '@/components/layout/BottomNav';

export default function DiaryPage() {
  return (
    <div className="text-on-background min-h-screen pb-24 font-gowun">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-[20px] h-16 bg-surface/85 backdrop-blur-[8px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">bubble_chart</span>
          <h1 className="font-dongle text-[32px] leading-none text-primary pt-2">오늘의 감정 일기</h1>
        </div>
        <button className="hover:opacity-80 transition-opacity active:scale-95 transition-all duration-300 ease-out">
          <span className="material-symbols-outlined text-primary">settings</span>
        </button>
      </header>

      <main className="px-[20px] mt-[16px] space-y-[24px]">
        {/* Calendar Section */}
        <section className="glass-card rounded-[20px] p-[16px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-[8px]">
            <span className="text-primary font-dongle text-[28px] font-normal">2024년 5월</span>
            <div className="flex gap-[4px]">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">chevron_left</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">chevron_right</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            <div className="text-[13px] text-on-surface-variant opacity-50 font-gowun">일</div>
            <div className="text-[13px] text-on-surface-variant opacity-50 font-gowun">월</div>
            <div className="text-[13px] text-on-surface-variant opacity-50 font-gowun">화</div>
            <div className="text-[13px] text-on-surface-variant opacity-50 font-gowun">수</div>
            <div className="text-[13px] text-on-surface-variant opacity-50 font-gowun">목</div>
            <div className="text-[13px] text-on-surface-variant opacity-50 font-gowun">금</div>
            <div className="text-[13px] text-on-surface-variant opacity-50 font-gowun">토</div>
            <div className="p-2 text-[13px] font-gowun">10</div>
            <div className="p-2 text-[13px] font-gowun">11</div>
            <div className="p-2 text-[13px] font-gowun">12</div>
            <div className="p-2 text-[13px] bg-primary-container text-on-primary-container rounded-full font-bold relative font-gowun">
              13
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-jelly-base rounded-full border border-white"></div>
            </div>
            <div className="p-2 text-[13px] font-gowun">14</div>
            <div className="p-2 text-[13px] font-gowun">15</div>
            <div className="p-2 text-[13px] font-gowun">16</div>
          </div>
          {/* Decorative Jelly */}
          <div className="absolute -bottom-2 -right-2 opacity-20">
            <span className="material-symbols-outlined text-[64px]">pets</span>
          </div>
        </section>

        {/* Emotion Timeline */}
        <section className="space-y-[12px]">
          <h2 className="text-primary px-1 font-dongle text-[28px] font-normal">타임라인</h2>
          <div className="relative pl-8 space-y-[12px] before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
            {/* Entry 1 */}
            <div className="glass-card rounded-[20px] p-[16px] shadow-sm relative transition-all active:scale-[0.98]">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-jelly-tired rounded-full border-4 border-surface shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-[8px]">
                  <span className="material-symbols-outlined text-secondary">bedtime</span>
                  <div>
                    <p className="font-bold text-on-surface">조금 답답한 오후</p>
                    <p className="text-[13px] text-on-surface-variant">오후 2:30</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-jelly-tired/40 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-jelly-tired" style={{ fontVariationSettings: "'FILL' 1" }}>mood</span>
                </div>
              </div>
            </div>

            {/* Entry 2 */}
            <div className="glass-card rounded-[20px] p-[16px] shadow-sm relative transition-all active:scale-[0.98]">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-jelly-anger rounded-full border-4 border-surface shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-[8px]">
                  <span className="material-symbols-outlined text-error">bolt</span>
                  <div>
                    <p className="font-bold text-on-surface">갑자기 울컥한 기분</p>
                    <p className="text-[13px] text-on-surface-variant">오전 11:15</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-jelly-anger/40 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-jelly-anger" style={{ fontVariationSettings: "'FILL' 1" }}>mood_bad</span>
                </div>
              </div>
            </div>

            {/* Entry 3 */}
            <div className="glass-card rounded-[20px] p-[16px] shadow-sm relative transition-all active:scale-[0.98]">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-jelly-base rounded-full border-4 border-surface shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-[8px]">
                  <span className="material-symbols-outlined text-primary">sunny</span>
                  <div>
                    <p className="font-bold text-on-surface">평온한 시작</p>
                    <p className="text-[13px] text-on-surface-variant">오전 8:00</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-jelly-base/40 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sentiment_satisfied</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Emotion Flow Chart */}
        <section className="glass-card rounded-[20px] p-[16px] shadow-sm">
          <h2 className="text-primary mb-[16px] font-dongle text-[28px] font-normal">이번 주 감정 흐름</h2>
          <div className="space-y-[8px]">
            {/* Day Row */}
            <div className="flex items-center gap-[16px]">
              <span className="w-8 text-on-surface-variant font-gamja text-[16px]">월</span>
              <div className="flex-1 h-3 flex rounded-full overflow-hidden bg-surface-container-high">
                <div className="h-full bg-jelly-base w-[40%]"></div>
                <div className="h-full bg-jelly-tired w-[20%]"></div>
                <div className="h-full bg-jelly-anger w-[10%]"></div>
                <div className="h-full bg-jelly-sad w-[30%]"></div>
              </div>
            </div>
            {/* Day Row */}
            <div className="flex items-center gap-[16px]">
              <span className="w-8 text-on-surface-variant font-gamja text-[16px]">화</span>
              <div className="flex-1 h-3 flex rounded-full overflow-hidden bg-surface-container-high">
                <div className="h-full bg-jelly-base w-[60%]"></div>
                <div className="h-full bg-jelly-sad w-[40%]"></div>
              </div>
            </div>
            {/* Day Row Active */}
            <div className="flex items-center gap-[16px]">
              <span className="w-8 text-primary font-bold font-gamja text-[16px]">오늘</span>
              <div className="flex-1 h-4 flex rounded-full overflow-hidden bg-surface-container-high ring-2 ring-primary/10">
                <div className="h-full bg-jelly-base w-[30%]"></div>
                <div className="h-full bg-jelly-anger w-[40%]"></div>
                <div className="h-full bg-jelly-tired w-[30%]"></div>
              </div>
            </div>
          </div>
          <div className="mt-[16px] flex justify-center gap-[24px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-jelly-base"></div>
              <span className="text-on-surface-variant font-gamja text-[14px]">평온</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-jelly-anger"></div>
              <span className="text-on-surface-variant font-gamja text-[14px]">분노</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-jelly-sad"></div>
              <span className="text-on-surface-variant font-gamja text-[14px]">우울</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-jelly-tired"></div>
              <span className="text-on-surface-variant font-gamja text-[14px]">피곤</span>
            </div>
          </div>
        </section>
      </main>

      <BottomNav activeTab="history" />
    </div>
  );
}
