'use client';

import { themeStore } from '@/stores/themeStore';

/**
 * 다크/라이트 모드 토글 버튼 컴포넌트
 * Sun/Moon 아이콘으로 현재 테마를 표시하고,
 * 클릭 시 테마를 토글한다.
 */
export function ThemeToggle() {
  const resolvedTheme = themeStore((s) => s.resolvedTheme);
  const toggleTheme = themeStore((s) => s.toggleTheme);

  const isDark = resolvedTheme === 'dark';
  const iconName = isDark ? 'dark_mode' : 'light_mode';
  const ariaLabel = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <button
      data-testid="theme-toggle"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      className="flex items-center justify-center w-10 h-10 rounded-full
        bg-surface-container-high text-on-surface
        hover:bg-surface-container-highest
        active:scale-95
        transition-all duration-300"
    >
      <span className="material-symbols-outlined">{iconName}</span>
    </button>
  );
}
