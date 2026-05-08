/**
 * T-019: 전체 통합 테스트
 * 메인 페이지 통합 (PhysicsCanvas, JellyRenderer, BeadGroup, TestInput)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Matter.js 모킹
jest.mock('matter-js', () => ({
  Engine: {
    create: jest.fn(() => ({
      world: {
        bodies: [],
        add: jest.fn(),
        remove: jest.fn(),
      },
      events: {},
      run: jest.fn(),
    })),
  },
  Render: {
    create: jest.fn(),
    run: jest.fn(),
  },
  Runner: {
    create: jest.fn(() => ({
      run: jest.fn(),
    })),
  },
  Bodies: {
    circle: jest.fn(() => ({})),
    rectangle: jest.fn(() => ({})),
  },
  Composite: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  Events: {
    on: jest.fn(),
  },
}));

// PhysicsCanvas 모킹
jest.mock('@/components/jelly/PhysicsCanvas', () => {
  const MockCanvas = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="physics-canvas">{children}</div>
  );
  return { __esModule: true, PhysicsCanvas: MockCanvas, default: MockCanvas };
});

// JellyRenderer 모킹
jest.mock('@/components/jelly/JellyRenderer', () => {
  const MockRenderer = () => <div data-testid="jelly-renderer">Jelly</div>;
  return { __esModule: true, JellyRenderer: MockRenderer, default: MockRenderer };
});

// BeadGroup 모킹
jest.mock('@/components/beads/BeadGroup', () => {
  const MockBeads = () => <div data-testid="bead-group">Beads</div>;
  return { __esModule: true, BeadGroup: MockBeads, default: MockBeads };
});

// TestInput 모킹
jest.mock('@/components/input/TestInput', () => {
  const MockInput = () => <button data-testid="test-input">Test Input</button>;
  return { __esModule: true, TestInput: MockInput, default: MockInput };
});

describe('Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('메인 페이지 렌더링', () => {
    it('PhysicsCanvas를 렌더링해야 함', () => {
      render(<Home />);
      expect(screen.getByTestId('physics-canvas')).toBeInTheDocument();
    });

    it('JellyRenderer를 렌더링해야 함', () => {
      render(<Home />);
      expect(screen.getByTestId('jelly-renderer')).toBeInTheDocument();
    });

    it('BeadGroup을 렌더링해야 함', () => {
      render(<Home />);
      expect(screen.getByTestId('bead-group')).toBeInTheDocument();
    });

    it('TestInput 버튼을 렌더링해야 함', () => {
      render(<Home />);
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });
  });

  describe('컴포넌트 통합', () => {
    it('모든 컴포넌트가 올바른 순서로 렌더링되어야 함', () => {
      const { container } = render(<Home />);

      const canvas = screen.getByTestId('physics-canvas');
      const jelly = screen.getByTestId('jelly-renderer');
      const beads = screen.getByTestId('bead-group');
      const input = screen.getByTestId('test-input');

      // PhysicsCanvas가 최상위 컨테이너
      expect(canvas).toContainElement(jelly);
      expect(canvas).toContainElement(beads);
      expect(canvas).toContainElement(input);
    });

    it('상태 머신 흐름을 지원해야 함', () => {
      render(<Home />);

      // 모든 컴포넌트가 존재하는지 확인
      expect(screen.getByTestId('jelly-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('bead-group')).toBeInTheDocument();
      expect(screen.getByTestId('test-input')).toBeInTheDocument();

      // 실제 상태 전환은 컴포넌트 내부에서 처리
      // 여기서는 모든 컴포넌트가 함께 렌더링되는지 확인
    });
  });

  describe('레이아웃 및 스타일', () => {
    it('전체 화면 컨테이너를 가져야 함', () => {
      const { container } = render(<Home />);
      expect(container.firstChild).toHaveClass('h-screen');
    });

    it('적절한 Tailwind 클래스를 적용해야 함', () => {
      const { container } = render(<Home />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain('flex');
      expect(mainDiv.className).toContain('flex-col');
    });
  });
});
