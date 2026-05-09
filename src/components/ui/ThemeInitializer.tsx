'use client';

import { useEffect } from 'react';

/**
 * 테마 초기화 컴포넌트
 * 앱인토스: 다크모드 미지원, 항상 라이트모드 강제
 */
export function ThemeInitializer() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('mind-jelly-theme');
  }, []);

  return null;
}
