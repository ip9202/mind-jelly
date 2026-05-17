'use client';

import Link from 'next/link';

import { useFriendStore } from '@/stores/friendStore';

interface BottomNavProps {
  activeTab?: 'jelly' | 'history' | 'friends' | 'garden';
}

/**
 * 플로팅 캡슐형 BottomNav
 * - 화면 하단에서 16px 떠있는 글래스 카드 형태
 * - 활성 탭: 핑크 그라데이션 + 위로 살짝 떠오름 + 도트 인디케이터
 * - 비활성: 부드러운 회색, 호버 시 살짝 강조
 * @MX:ANCHOR: 전역 내비게이션 - home/diary/friends/settings 4개 페이지에서 공유
 * @MX:REASON: 햄버거 메뉴 대체 + 서비스의 "이쁘고 귀여운" 브랜드 컨셉 반영
 */
export default function BottomNav({ activeTab }: BottomNavProps) {
  // 친구 요청 뱃지 상태 (초기값 0/false → SSR에서도 뱃지 미표시)
  const pendingCount = useFriendStore((s) => s.pendingCount);
  const isBadgeVisible = useFriendStore((s) => s.isBadgeVisible);
  const tabs = [
    { id: 'jelly', label: '젤리', icon: 'bubble_chart', href: '/home' },
    { id: 'history', label: '기록', icon: 'auto_stories', href: '/diary' },
    { id: 'friends', label: '친구', icon: 'group', href: '/friends' },
    { id: 'garden', label: '설정', icon: 'tune', href: '/settings' },
  ] as const;

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 nav-safe-bottom pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div
          className="relative bg-white/70 backdrop-blur-2xl rounded-[28px] border border-white/60 px-3 py-2"
          style={{
            boxShadow: '0 10px 36px rgba(255, 158, 205, 0.22), 0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-stretch justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={tab.label}
                  className="relative flex-1 flex flex-col items-center justify-center py-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
                >
                  {/* 활성 도트 인디케이터 (캡슐 상단) */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                      style={{ boxShadow: '0 0 10px rgba(255, 158, 205, 0.9)' }}
                    />
                  )}

                  {/* 아이콘 캡슐 */}
                  <div
                    className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ease-out ${
                      isActive
                        ? '-translate-y-1.5 scale-105'
                        : 'group-hover:bg-surface-variant/40 group-active:scale-95'
                    }`}
                    style={
                      isActive
                        ? {
                            background:
                              'linear-gradient(135deg, #FF9ECD 0%, #FFD1DC 60%, #FFE4EC 100%)',
                            boxShadow:
                              '0 6px 16px rgba(255, 158, 205, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                          }
                        : undefined
                    }
                  >
                    <span
                      className={`material-symbols-outlined transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-on-surface-variant/80'
                      }`}
                      style={{
                        fontSize: isActive ? '26px' : '24px',
                        fontVariationSettings: isActive
                          ? '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24'
                          : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
                      }}
                    >
                      {tab.icon}
                    </span>

                    {/* 활성 시 미세 스파클 장식 */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-1 -right-1 text-white"
                        style={{ fontSize: '10px' }}
                      >
                        ✦
                      </span>
                    )}

                    {/* 친구 요청 뱃지 */}
                    {tab.id === 'friends' && isBadgeVisible && pendingCount > 0 && (
                      <span
                        aria-label="친구 요청 수"
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1"
                      >
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </div>

                  {/* 라벨 */}
                  <span
                    className={`font-gowun text-[11px] mt-0.5 leading-none transition-all duration-300 ${
                      isActive ? 'text-accent font-bold' : 'text-on-surface-variant/70'
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
