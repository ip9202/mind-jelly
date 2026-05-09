// useDrag Hook 테스트
import { renderHook, act } from '@testing-library/react';
import { useDrag } from '@/hooks/useDrag';
import Matter from 'matter-js';

// Matter.js 모킹
jest.mock('matter-js', () => ({
  Body: {
    setStatic: jest.fn(),
    setPosition: jest.fn(),
    setVelocity: jest.fn(),
  },
}));

describe('useDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('onDrag가 body와 isDragging=true일 때 Body.setPosition을 호출한다', () => {
    const mockBody = {
      isStatic: false,
      position: { x: 100, y: 100 },
    };

    const { result } = renderHook(() => useDrag(mockBody as any));

    // startDrag로 드래그 시작
    act(() => {
      result.current.startDrag({ clientX: 120, clientY: 130 } as any);
    });

    expect(result.current.isDragging).toBe(true);

    // onDrag 호출
    act(() => {
      result.current.onDrag({ clientX: 200, clientY: 250 } as any);
    });

    // 오프셋: clientX(120) - position.x(100) = 20
    // 새 위치: clientX(200) - offset(20) = 180
    // 오프셋: clientY(130) - position.y(100) = 30
    // 새 위치: clientY(250) - offset(30) = 220
    expect(Matter.Body.setPosition).toHaveBeenCalledWith(mockBody, {
      x: 180,
      y: 220,
    });
  });

  it('onDrag가 body가 null이면 setPosition을 호출하지 않는다', () => {
    const { result } = renderHook(() => useDrag(null));

    act(() => {
      result.current.onDrag({ clientX: 100, clientY: 100 } as any);
    });

    expect(Matter.Body.setPosition).not.toHaveBeenCalled();
  });

  it('onDrag가 isDragging=false이면 setPosition을 호출하지 않는다', () => {
    const mockBody = {
      isStatic: false,
      position: { x: 100, y: 100 },
    };

    const { result } = renderHook(() => useDrag(mockBody as any));

    // startDrag를 호출하지 않은 상태 (isDragging = false)
    act(() => {
      result.current.onDrag({ clientX: 200, clientY: 250 } as any);
    });

    expect(Matter.Body.setPosition).not.toHaveBeenCalled();
  });
});
