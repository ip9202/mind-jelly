/**
 * 해시 단위 인메모리 rate limiter.
 * Edge Function 인스턴스 메모리에서 사용한다.
 *
 * @MX:NOTE: [AUTO] SPEC-SESSION-RECOVER-001 REQ-SESSION-031
 * @MX:SPEC: SPEC-SESSION-RECOVER-001
 */

export interface RateLimiterOptions {
  /** 윈도우 안에서 허용되는 최대 호출 수 */
  max: number;
  /** 윈도우 길이 (밀리초) */
  windowMs: number;
}

export interface HashRateLimiter {
  /** 호출이 허용되면 true, 차단되어야 하면 false 반환 */
  check(key: string): boolean;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * key별로 windowMs 안에 max회까지 허용하는 단순 토큰 버킷.
 * 윈도우는 첫 호출 시점부터 시작하고, 만료되면 카운터가 리셋된다.
 */
export function createHashRateLimiter(options: RateLimiterOptions): HashRateLimiter {
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string): boolean {
      const now = Date.now();
      const bucket = buckets.get(key);

      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return true;
      }

      if (bucket.count >= options.max) {
        return false;
      }

      bucket.count += 1;
      return true;
    },
  };
}
