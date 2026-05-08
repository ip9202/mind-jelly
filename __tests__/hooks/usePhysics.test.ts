// usePhysics Hook 테스트
import { renderHook, act } from '@testing-library/react';
import { usePhysics } from '@/hooks/usePhysics';

// Matter.js 모킹
const mockEngine = {
  world: {},
  gravity: { x: 0, y: 1 },
};

const mockRunner = {
  run: jest.fn(),
  stop: jest.fn(),
};

jest.mock('matter-js', () => ({
  Engine: {
    create: jest.fn(() => mockEngine),
    clear: jest.fn(),
    update: jest.fn(),
  },
  Runner: {
    create: jest.fn(() => mockRunner),
    run: jest.fn(),
    stop: jest.fn(() => mockRunner.stop()),
  },
}));

describe('usePhysics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('마운트 시 엔진을 생성해야 함', () => {
    const Matter = require('matter-js');

    renderHook(() => usePhysics());

    expect(Matter.Engine.create).toHaveBeenCalled();
  });

  it('엔진 인스턴스를 반환해야 함', () => {
    const { result } = renderHook(() => usePhysics());

    expect(result.current.engineRef.current).toBeDefined();
  });

  it('update 함수를 제공해야 함', () => {
    const { result } = renderHook(() => usePhysics());

    expect(result.current.update).toBeDefined();
    expect(typeof result.current.update).toBe('function');
  });

  it('update 함수를 호출하면 엔진을 업데이트해야 함', () => {
    const Matter = require('matter-js');

    const { result } = renderHook(() => usePhysics());

    act(() => {
      result.current.update(16.67);
    });

    expect(Matter.Engine.update).toHaveBeenCalledWith(mockEngine, 16.67);
  });

  it('언마운트 시 엔진을 정리해야 함', () => {
    const Matter = require('matter-js');

    const { unmount } = renderHook(() => usePhysics());

    unmount();

    expect(Matter.Engine.clear).toHaveBeenCalledWith(mockEngine);
    expect(mockRunner.stop).toHaveBeenCalled();
  });
});
