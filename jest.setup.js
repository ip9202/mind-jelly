/**
 * Jest 테스트 설정 파일
 * React Testing Library 및 기타 테스트 유틸리티 설정
 */

import '@testing-library/jest-dom'

// jsdom에 없는 브라우저 API 폴리필
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// @MX:NOTE: [AUTO] Supabase 클라이언트 모킹 (테스트 환경에서 env 변수 누락 방지)
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ data: [], error: null }),
      insert: jest.fn().mockReturnValue({ data: null, error: null }),
      update: jest.fn().mockReturnValue({ data: null, error: null }),
      delete: jest.fn().mockReturnValue({ data: null, error: null }),
    }),
  },
}));
