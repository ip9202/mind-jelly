/**
 * Jest 설정
 * Next.js + TypeScript + React Testing Library
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱 경로
  dir: './',
})

// Jest 커스텀 설정
const customJestConfig = {
  // 테스트 환경 설정
  testEnvironment: 'jest-environment-jsdom',

  // TypeScript 및 JSX 처리
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // 모듈 경로 매핑 (tsconfig.json paths와 동일)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    'src/**/*.test.(ts|tsx)',
  ],

  // 커버리지 수집 설정
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.(ts|tsx)',
    '!src/**/__tests__/**',
  ],

  // 커버리지 기준
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

// @ts-ignore
module.exports = createJestConfig({
  ...customJestConfig,
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    'src/**/*.test.(ts|tsx)',
  ],
})
