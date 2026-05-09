'use client';

import Link from 'next/link';

interface BottomNavProps {
  activeTab?: 'jelly' | 'history' | 'garden';
}

export default function BottomNav({ activeTab = 'jelly' }: BottomNavProps) {
  const tabs = [
    { id: 'jelly', label: 'Jelly', icon: 'pets', href: '/home' },
    { id: 'history', label: 'History', icon: 'analytics', href: '/diary' },
    { id: 'garden', label: 'Garden', icon: 'eco', href: '/settings' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container/80 dark:bg-[#191F28]/80 backdrop-blur-lg border-t border-white/20 dark:border-white/10 rounded-t-lg shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center active:scale-95 transition-all duration-300 ${
              isActive
                ? 'bg-primary-container text-on-primary-container dark:bg-primary/30 dark:text-primary-fixed rounded-xl px-4 py-1'
                : 'text-text-primary dark:text-[#b0b8c4] px-4 py-1 hover:bg-surface-variant/50 dark:hover:bg-white/10'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isActive ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24' }}
            >
              {tab.icon}
            </span>
            <span className="font-caption text-caption">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
