'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface NavMenuProps {
  activeTab?: 'jelly' | 'history' | 'garden';
}

export default function NavMenu({ activeTab = 'jelly' }: NavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = [
    { id: 'jelly' as const, label: 'Jelly', icon: 'pets', href: '/home' },
    { id: 'history' as const, label: 'History', icon: 'analytics', href: '/diary' },
    { id: 'garden' as const, label: 'Settings', icon: 'settings', href: '/settings' },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity active:scale-95"
      >
        <span className="material-symbols-outlined text-primary text-2xl">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-48 glass-card rounded-2xl shadow-lg py-2 z-50 animate-slide-up">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary-container/50 text-on-primary-container'
                    : 'text-text-primary hover:bg-surface-variant/50'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: isActive ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24' }}
                >
                  {item.icon}
                </span>
                <span className="font-gowun text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
