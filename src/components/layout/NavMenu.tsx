'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';

interface NavMenuProps {
  activeTab?: 'jelly' | 'history' | 'garden';
}

export default function NavMenu({ activeTab = 'jelly' }: NavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // 방향키 네비게이션에서 현재 포커스 인덱스 추적용 (렌더링과 무관하므로 ref 사용)
  const focusedIndexRef = useRef(-1);

  const items = [
    { id: 'jelly' as const, label: 'Jelly', icon: 'pets', href: '/home' },
    { id: 'history' as const, label: 'History', icon: 'analytics', href: '/diary' },
    { id: 'garden' as const, label: 'Settings', icon: 'settings', href: '/settings' },
  ];

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    focusedIndexRef.current = -1;
  }, []);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, closeMenu]);

  // Escape 키 및 방향키 네비게이션
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeMenu();
          break;
        case 'ArrowDown':
          e.preventDefault();
          focusedIndexRef.current = focusedIndexRef.current < items.length - 1 ? focusedIndexRef.current + 1 : 0;
          itemRefs.current[focusedIndexRef.current]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusedIndexRef.current = focusedIndexRef.current > 0 ? focusedIndexRef.current - 1 : items.length - 1;
          itemRefs.current[focusedIndexRef.current]?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items.length, closeMenu]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="nav-menu"
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity active:scale-95"
      >
        <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {isOpen && (
        <div
          id="nav-menu"
          role="menu"
          aria-label="내비게이션 메뉴"
          className="absolute right-0 top-12 w-48 glass-card rounded-2xl shadow-lg py-2 z-50 animate-slide-up"
        >
          {items.map((item, index) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                ref={(el) => { itemRefs.current[index] = el; }}
                onClick={closeMenu}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary-container/50 text-on-primary-container'
                    : 'text-text-primary hover:bg-surface-variant/50'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: isActive ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24' }}
                  aria-hidden="true"
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
