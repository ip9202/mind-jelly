/**
 * @MX:NOTE: [AUTO] SPEC-SYNC-001 T-006 - 오프라인 복원력 Sync 유틸리티
 * REQ-SYNC-008: 메모리 큐 기반 오프라인 쓰기 버퍼링
 * @MX:SPEC: SPEC-SYNC-001
 */

// @MX:ANCHOR: [AUTO] 쓰기 작업 타입 - 외부에서 enqueueWrite 시 사용
// @MX:REASON: db.ts의 각 update/upsert 함수를 래핑하여 큐에 전달하는 기본 단위
export type WriteOperation = () => Promise<void>;

// @MX:NOTE: [AUTO] SyncQueue 인터페이스 - createSyncQueue 팩토리 반환 타입
export interface SyncQueue {
  enqueueWrite(operation: WriteOperation): void;
  flushQueue(): Promise<void>;
  isOnline(): boolean;
  getQueueLength(): number;
  destroy(): void;
}

/**
 * 오프라인 복원력을 제공하는 Sync 큐 팩토리
 *
 * - 오프라인 시 쓰기 작업을 메모리 큐에 적재
 * - online 이벤트 발생 시 자동 flush
 * - Supabase 장애 시에도 사용자에게 에러 노출하지 않음
 */
export function createSyncQueue(): SyncQueue {
  const queue: WriteOperation[] = [];

  // @MX:NOTE: [AUTO] navigator.onLine 래핑 - SSR 환경에서 window 미존재 방지
  const isOnline = (): boolean => {
    if (typeof window === 'undefined') return true;
    return window.navigator.onLine;
  };

  const enqueueWrite = (operation: WriteOperation): void => {
    queue.push(operation);
  };

  // @MX:WARN: [AUTO] flush 중 새 enqueue 가능 - 순차 실행 보장, 동시 flush 방지
  // @MX:REASON: 온라인 이벤트와 수동 flush가 동시에 발생할 수 있음
  let flushing = false;

  const flushQueue = async (): Promise<void> => {
    if (!isOnline()) return;
    if (flushing) return;
    flushing = true;

    try {
      while (queue.length > 0) {
        const op = queue[0];
        try {
          await op();
          queue.shift();
        } catch {
          // 첫 번째 작업이 실패하면 중단하고 큐에 남김 (순서 보장)
          break;
        }
      }
    } finally {
      flushing = false;
    }
  };

  const getQueueLength = (): number => queue.length;

  // @MX:NOTE: [AUTO] 브라우저 online/offline 이벤트 핸들러
  const handleOnline = (): void => {
    flushQueue();
  };

  const handleOffline = (): void => {
    // 상태는 isOnline()에서 navigator.onLine으로 실시간 조회
  };

  // 이벤트 리스너 등록
  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  const destroy = (): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  };

  return {
    enqueueWrite,
    flushQueue,
    isOnline,
    getQueueLength,
    destroy,
  };
}
