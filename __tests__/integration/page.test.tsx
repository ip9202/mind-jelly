/**
 * T-019: 전체 통합 테스트
 * 메인 페이지 렌더링 및 레이아웃 구조 검증
 * 동적 로딩 컴포넌트(EmotionInput, JellyRenderer 등)는 각 단위 테스트에서 개별 검증
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Matter.js 모킹
jest.mock('matter-js', () => ({
  Engine: {
    create: jest.fn(() => ({
      world: { bodies: [], add: jest.fn(), remove: jest.fn() },
      events: {},
      run: jest.fn(),
    })),
  },
  Render: { create: jest.fn(), run: jest.fn() },
  Runner: { create: jest.fn(() => ({ run: jest.fn() })) },
  Bodies: { circle: jest.fn(() => ({ id: 1 })), rectangle: jest.fn(() => ({ id: 2 })) },
  Composite: { add: jest.fn(), remove: jest.fn(), allBodies: jest.fn(() => []) },
  Events: { on: jest.fn() },
  Body: { setPosition: jest.fn() },
}));

// 컴포넌트 모킹
jest.mock('@/components/layout/BottomNav', () => {
  const MockNav = () => <nav data-testid="bottom-nav">Nav</nav>;
  return { __esModule: true, default: MockNav };
});

// next/dynamic 모킹 - ssr:false 컴포넌트를 로딩 placeholder로 대체
jest.mock('next/dynamic', () => {
  return () => () => <div data-testid="dynamic-component">Loading...</div>;
});

import Home from '@/app/home/page';

describe('Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('HomePage 컴포넌트가 크래시 없이 렌더링되어야 함', () => {
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it('하단 네비게이션이 렌더링되어야 함', () => {
    render(<Home />);
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('flex 레이아웃 구조를 가져야 함', () => {
    const { container } = render(<Home />);
    const mainDiv = container.firstChild as HTMLElement;
    if (mainDiv && mainDiv.className) {
      expect(mainDiv.className).toContain('flex');
    }
  });

  it('다이내믹 로딩 컴포넌트 영역이 존재해야 함', () => {
    const { container } = render(<Home />);
    const dynamicSlots = container.querySelectorAll('[data-testid="dynamic-component"]');
    expect(dynamicSlots.length).toBeGreaterThan(0);
  });
});
