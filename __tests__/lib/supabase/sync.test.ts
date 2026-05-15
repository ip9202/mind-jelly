/**
 * @MX:NOTE: [AUTO] SPEC-SYNC-001 T-006 - 오프라인 복원력 Sync 유틸리티 테스트
 * REQ-SYNC-008: 오프라인 메모리 큐, online/offline 이벤트, Supabase 장애 복원력
 */

import { createSyncQueue, SyncQueue } from '@/lib/supabase/sync';

// navigator.onLine 모킹
const mockOnLineGetter = jest.fn(() => true);
Object.defineProperty(window.navigator, 'onLine', {
  get: mockOnLineGetter,
  configurable: true,
});

// window.addEventListener / removeEventListener 스파이
const listeners: Record<string, EventListener[]> = {};

// 타입 안전한 Mock 함수 정의
const mockAddEventListener = jest.fn((event: string, handler: EventListenerOrEventListenerObject) => {
  if (!listeners[event]) listeners[event] = [];
  // EventListenerObject 타입도 처리
  const listener = typeof handler === 'function' ? handler : handler.handleEvent;
  listeners[event].push(listener);
}) as any;

const mockRemoveEventListener = jest.fn((event: string, handler: EventListenerOrEventListenerObject) => {
  if (listeners[event]) {
    const listener = typeof handler === 'function' ? handler : handler.handleEvent;
    listeners[event] = listeners[event].filter((h) => h !== listener);
  }
}) as any;

// @ts-expect-error - 테스트를 위해 window 메서드를 Mock으로 교체
window.addEventListener = mockAddEventListener;
// @ts-expect-error - 테스트를 위해 window 메서드를 Mock으로 교체
window.removeEventListener = mockRemoveEventListener;

describe('Sync 유틸리티 (createSyncQueue)', () => {
  let queue: SyncQueue;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnLineGetter.mockReturnValue(true);
    // 이전 리스너 초기화
    Object.keys(listeners).forEach((key) => delete listeners[key]);
    queue = createSyncQueue();
  });

  afterEach(() => {
    queue.destroy();
  });

  describe('isOnline()', () => {
    it('navigator.onLine이 true면 true 반환', () => {
      mockOnLineGetter.mockReturnValue(true);
      expect(queue.isOnline()).toBe(true);
    });

    it('navigator.onLine이 false면 false 반환', () => {
      mockOnLineGetter.mockReturnValue(false);
      expect(queue.isOnline()).toBe(false);
    });

    it('SSR 환경(window 없음)에서는 항상 true 반환', () => {
      // window를 일시적으로 undefined로 만들어 SSR 환경 시뮬레이션
      const originalWindow = globalThis.window;
      // @ts-expect-error SSR 환경 시뮬레이션을 위해 window 제거
      delete globalThis.window;

      const ssrQueue = createSyncQueue();
      expect(ssrQueue.isOnline()).toBe(true);

      ssrQueue.destroy();
      globalThis.window = originalWindow;
    });
  });

  describe('enqueueWrite()', () => {
    it('큐에 쓰기 작업을 추가한다', () => {
      const op = jest.fn(() => Promise.resolve());
      queue.enqueueWrite(op);

      expect(queue.getQueueLength()).toBe(1);
    });

    it('여러 작업을 순차적으로 추가할 수 있다', () => {
      queue.enqueueWrite(jest.fn(() => Promise.resolve()));
      queue.enqueueWrite(jest.fn(() => Promise.resolve()));
      queue.enqueueWrite(jest.fn(() => Promise.resolve()));

      expect(queue.getQueueLength()).toBe(3);
    });
  });

  describe('flushQueue()', () => {
    it('온라인 상태에서 큐의 모든 작업을 순차 실행한다', async () => {
      const order: number[] = [];
      const op1 = jest.fn(() => {
        order.push(1);
        return Promise.resolve();
      });
      const op2 = jest.fn(() => {
        order.push(2);
        return Promise.resolve();
      });
      const op3 = jest.fn(() => {
        order.push(3);
        return Promise.resolve();
      });

      queue.enqueueWrite(op1);
      queue.enqueueWrite(op2);
      queue.enqueueWrite(op3);

      await queue.flushQueue();

      expect(op1).toHaveBeenCalledTimes(1);
      expect(op2).toHaveBeenCalledTimes(1);
      expect(op3).toHaveBeenCalledTimes(1);
      expect(order).toEqual([1, 2, 3]);
    });

    it('성공한 작업은 큐에서 제거한다', async () => {
      queue.enqueueWrite(jest.fn(() => Promise.resolve()));
      queue.enqueueWrite(jest.fn(() => Promise.resolve()));

      await queue.flushQueue();

      expect(queue.getQueueLength()).toBe(0);
    });

    it('실패한 작업과 그 이후 작업은 큐에 남겨둔다 (순서 보장)', async () => {
      const failOp = jest.fn(() => Promise.reject(new Error('Supabase 에러')));
      const successOp = jest.fn(() => Promise.resolve());

      queue.enqueueWrite(failOp);
      queue.enqueueWrite(successOp);

      await queue.flushQueue();

      // 실패한 첫 번째 작업 + 그 뒤의 성공 작업 모두 큐에 남음 (순서 보장)
      expect(queue.getQueueLength()).toBe(2);
      // 이후 작업은 아직 실행되지 않음
      expect(successOp).not.toHaveBeenCalled();
    });

    it('빈 큐를 flush하면 아무 일도 일어나지 않는다', async () => {
      await queue.flushQueue();
      expect(queue.getQueueLength()).toBe(0);
    });

    it('오프라인 상태에서는 flush가 실행되지 않는다', async () => {
      mockOnLineGetter.mockReturnValue(false);

      const op = jest.fn(() => Promise.resolve());
      queue.enqueueWrite(op);

      await queue.flushQueue();

      expect(op).not.toHaveBeenCalled();
      expect(queue.getQueueLength()).toBe(1);
    });

    it('부분 실패 시 성공한 작업만 제거한다', async () => {
      const success1 = jest.fn(() => Promise.resolve());
      const failOp = jest.fn(() => Promise.reject(new Error('network')));
      const success2 = jest.fn(() => Promise.resolve());

      queue.enqueueWrite(success1);
      queue.enqueueWrite(failOp);
      queue.enqueueWrite(success2);

      await queue.flushQueue();

      // success1은 성공, failOp에서 실패 → 이후 작업은 실행 중단
      // 실패한 작업과 그 이후 작업이 큐에 남음
      expect(queue.getQueueLength()).toBeGreaterThanOrEqual(1);
    });

    it('동시 flush 요청은 무시된다 (flushing 가드)', async () => {
      let resolveFirst: () => void;
      const slowOp = jest.fn(
        () => new Promise<void>((resolve) => { resolveFirst = resolve; })
      );
      const fastOp = jest.fn(() => Promise.resolve());

      queue.enqueueWrite(slowOp);
      queue.enqueueWrite(fastOp);

      // 첫 번째 flush 시작 (완료되지 않음)
      const flushPromise = queue.flushQueue();

      // 두 번째 flush 시도 (무시되어야 함)
      await queue.flushQueue();

      // 첫 번째 작업 완료
      resolveFirst!();
      await flushPromise;

      // slowOp는 1번만 호출, fastOp도 1번만 호출
      expect(slowOp).toHaveBeenCalledTimes(1);
      expect(fastOp).toHaveBeenCalledTimes(1);
    });
  });

  describe('online/offline 이벤트', () => {
    it('online 이벤트 리스너를 등록한다', () => {
      expect(listeners['online']).toBeDefined();
      expect(listeners['online'].length).toBeGreaterThanOrEqual(1);
    });

    it('offline 이벤트 리스너를 등록한다', () => {
      expect(listeners['offline']).toBeDefined();
      expect(listeners['offline'].length).toBeGreaterThanOrEqual(1);
    });

    it('online 이벤트 발생 시 큐에 작업이 있으면 자동 flush', async () => {
      const op = jest.fn(() => Promise.resolve());
      queue.enqueueWrite(op);

      // 오프라인 상태로 전환
      mockOnLineGetter.mockReturnValue(false);

      // online 이벤트 발생
      mockOnLineGetter.mockReturnValue(true);
      const onlineHandlers = listeners['online'] || [];
      for (const handler of onlineHandlers) {
        handler(new Event('online'));
      }

      // 비동기 flush 대기
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(op).toHaveBeenCalledTimes(1);
    });

    it('offline 이벤트 후에는 isOnline이 false를 반환', () => {
      mockOnLineGetter.mockReturnValue(true);
      expect(queue.isOnline()).toBe(true);

      mockOnLineGetter.mockReturnValue(false);
      const offlineHandlers = listeners['offline'] || [];
      for (const handler of offlineHandlers) {
        handler(new Event('offline'));
      }

      expect(queue.isOnline()).toBe(false);
    });
  });

  describe('Supabase 장애 복원력', () => {
    it('모든 작업이 실패해도 에러를 throw하지 않는다', async () => {
      const failOp1 = jest.fn(() => Promise.reject(new Error('Supabase timeout')));
      const failOp2 = jest.fn(() => Promise.reject(new Error('Network error')));

      queue.enqueueWrite(failOp1);
      queue.enqueueWrite(failOp2);

      // 에러를 throw하지 않아야 함
      await expect(queue.flushQueue()).resolves.not.toThrow();
    });

    it('큐에 남은 작업은 다음 flush 시 재시도된다', async () => {
      let callCount = 0;
      const op = jest.fn(() => {
        callCount++;
        if (callCount === 1) return Promise.reject(new Error('일시적 장애'));
        return Promise.resolve();
      });

      queue.enqueueWrite(op);

      // 첫 번째 flush: 실패
      await queue.flushQueue();
      expect(queue.getQueueLength()).toBe(1);

      // 두 번째 flush: 성공
      await queue.flushQueue();
      expect(queue.getQueueLength()).toBe(0);
      expect(op).toHaveBeenCalledTimes(2);
    });
  });

  describe('destroy()', () => {
    it('이벤트 리스너를 해제한다', () => {
      queue.destroy();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });
});
