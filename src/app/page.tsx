'use client';

import { useEffect } from 'react';

// Static export(앱인토스 빌드)에서 서버사이드 redirect()는 동작하지 않으므로
// 클라이언트 useEffect로 명시적 이동 처리
export default function RootPage() {
  useEffect(() => {
    window.location.replace('/onboarding');
  }, []);
  return null;
}
