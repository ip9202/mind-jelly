// useDrag Hook 테스트
import { renderHook, act } from '@testing-library/react';
import { useDrag } from '@/hooks/useDrag';
import * as Matter from 'matter-js';

// Matter.js 모킹
jest.mock('matter-js', () => ({
  Body: {
    setStatic: jest.fn(),
    setPosition: jest.fn(),
    setVelocity: jest.fn(),
  },
}));

describe('useDrag', () => {
  it('드래그 상태를 추적해야 함', () => {
    const mockBody = {
      isStatic: false,
      position: { x: 100, y: 100 },
    };

    const { result } = renderHook(() => useDrag(mockBody as any));

    expect(result.current.isDragging).toBe(false);
  });

  it('핸들러 함수를 제공해야 함', () => {
    const mockBody = {
      isStatic: false,
      position: { x: 100, y: 100 },
    };

    const { result } = renderHook(() => useDrag(mockBody as any));

    expect(result.current.startDrag).toBeDefined();
    expect(result.current.onDrag).toBeDefined();
    expect(result.current.endDrag).toBeDefined();
  });

  it('startDrag 핸들러를 호출할 수 있어야 함', () => {
    const mockBody = {
      isStatic: false,
      position: { x: 100, y: 100 },
    };

    const { result } = renderHook(() => useDrag(mockBody as any));

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 100 } as any);
    });

    expect(result.current.isDragging).toBe(true);
  });

  it('endDrag 핸들러를 호출할 수 있어야 함', () => {
    const mockBody = {
      isStatic: false,
      position: { x: 100, y: 100 },
    };

    const { result } = renderHook(() => useDrag(mockBody as any));

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 100 } as any);
      result.current.endDrag();
    });

    expect(result.current.isDragging).toBe(false);
  });
});
