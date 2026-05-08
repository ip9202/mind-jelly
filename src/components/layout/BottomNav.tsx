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
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container/80 backdrop-blur-lg border-t border-white/20 rounded-t-lg shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center active:scale-95 transition-all duration-300 ${
              isActive
                ? 'bg-primary-container text-on-primary-container rounded-xl px-4 py-1'
                : 'text-text-primary px-4 py-1 hover:bg-surface-variant/50'
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
