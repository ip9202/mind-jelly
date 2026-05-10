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
