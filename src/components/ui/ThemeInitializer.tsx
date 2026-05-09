'use client';

import { useEffect } from 'react';
import { themeStore } from '@/stores/themeStore';

/**
 * 테마 초기화 컴포넌트
 * 클라이언트에서 themeStore.initTheme()을 호출하여
 * localStorage 읽기 + matchMedia 리스너 등록
 */
export function ThemeInitializer() {
  useEffect(() => {
    themeStore.getState().initTheme();
  }, []);

  return null;
}
