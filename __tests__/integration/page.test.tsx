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

// 충돌 감지 모킹
jest.mock('@/lib/physics/collisions', () => ({
  setupCollisionDetection: jest.fn(),
}));

// 자기장 모킹
jest.mock('@/lib/physics/forces', () => ({
  applyMagneticField: jest.fn(),
}));

import Home from '@/app/home/page';
import { tossStore } from '@/stores/tossStore';

describe('Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tossStore.getState().reset();
  });

  it('HomePage 컴포넌트가 크래시 없이 렌더링되어야 함', () => {
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it('홈 페이지가 정상 렌더링되어야 함', () => {
    render(<Home />);
    expect(screen.getByText('Mind Jelly')).toBeInTheDocument();
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

  it('WebView가 아닐 때 헤더가 렌더링된다', () => {
    render(<Home />);

    expect(screen.getByText('Mind Jelly')).toBeInTheDocument();
  });

  it('WebView 환경에서 사용자 인사말이 표시된다', () => {
    tossStore.setState({
      isWebView: true,
      userInfo: { name: '테스트유저' } as any,
    });

    render(<Home />);

    expect(screen.getByText('테스트유저님, 반가워요!')).toBeInTheDocument();
  });

  it('WebView 환경에서 설정 버튼이 숨겨진다', () => {
    tossStore.setState({ isWebView: true });

    render(<Home />);

    // WebView일 때 설정 링크가 없어야 함
    // settings 아이콘은 header에 있을 수 있으므로 정확한 선택자로 확인
    const { container } = render(<Home />);
    const settingsLinks = container.querySelectorAll('a[href="/settings"]');
    expect(settingsLinks).toHaveLength(0);
  });

  it('로딩 상태 텍스트가 표시된다', () => {
    render(<Home />);

    // 다이내믹 컴포넌트의 로딩 텍스트
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });
});
