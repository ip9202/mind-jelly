/**
 * HomePage WebView 분기 테스트
 * WebView 환경 감지 및 UI 분기 처리 검증
 */
import { render, screen } from '@testing-library/react';

jest.mock('matter-js', () => ({
  Engine: { create: jest.fn(() => ({ world: {}, gravity: { x: 0, y: 1, scale: 0.001 } })) },
  Bodies: { circle: jest.fn(() => ({ id: 1 })), rectangle: jest.fn(() => ({ id: 2 })) },
  Composite: { add: jest.fn(), remove: jest.fn(), allBodies: jest.fn(() => []) },
  Events: { on: jest.fn() },
  Body: { setPosition: jest.fn(), applyForce: jest.fn() },
}));

jest.mock('@/components/layout/BottomNav', () => {
  const MockNav = () => <nav data-testid="bottom-nav">Nav</nav>;
  return { __esModule: true, default: MockNav };
});

jest.mock('next/dynamic', () => () => () => <div data-testid="dynamic-component">Loading...</div>);

jest.mock('@/lib/physics/collisions', () => ({
  setupCollisionDetection: jest.fn(),
}));
jest.mock('@/lib/physics/forces', () => ({
  applyMagneticField: jest.fn(),
}));

import Home from '@/app/home/page';
import { tossStore } from '@/stores/tossStore';

describe('HomePage WebView 분기', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tossStore.getState().reset();
  });

  it('WebView가 아닐 때 홈 페이지가 렌더링된다', () => {
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it('WebView일 때 설정 링크가 숨겨진다', () => {
    tossStore.setState({ isWebView: true });
    const { container } = render(<Home />);
    const settingsLink = container.querySelector('a[href="/settings"]');
    expect(settingsLink).not.toBeInTheDocument();
  });

  it('WebView이고 userInfo가 있을 때 인사말이 표시된다', () => {
    tossStore.setState({ isWebView: true, userInfo: { name: '강력쇠주먹' } as any });
    render(<Home />);
    expect(screen.getByText(/강력쇠주먹님,/)).toBeInTheDocument();
  });

  it('WebView이지만 userInfo가 null이면 인사말이 표시되지 않는다', () => {
    tossStore.setState({ isWebView: true, userInfo: null });
    const { container } = render(<Home />);
    expect(container.textContent).not.toContain('반가워요!');
  });

  it('동적 컴포넌트들이 로딩 상태로 렌더링된다', () => {
    render(<Home />);
    const dynamicSlots = screen.getAllByTestId('dynamic-component');
    expect(dynamicSlots.length).toBeGreaterThan(0);
  });
});
