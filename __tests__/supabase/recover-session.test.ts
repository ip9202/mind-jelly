/**
 * @MX:NOTE: [AUTO] SPEC-SESSION-RECOVER-001 M1 rate limiter 단위 테스트
 * @MX:SPEC: SPEC-SESSION-RECOVER-001 REQ-SESSION-031
 *
 * Edge Function의 핵심 rate limit 로직만 추출해 검증한다.
 * 실제 Deno 런타임 테스트는 supabase/functions/recover-session/index.test.ts 참고.
 */

import { createHashRateLimiter } from '@/lib/edge/rateLimiter';

describe('createHashRateLimiter (recover-session 용)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-15T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('동일 해시 5회까지는 통과시킨다', () => {
    const limiter = createHashRateLimiter({ max: 5, windowMs: 60_000 });
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('hashA')).toBe(true);
    }
  });

  it('동일 해시 6번째 호출은 차단한다', () => {
    const limiter = createHashRateLimiter({ max: 5, windowMs: 60_000 });
    for (let i = 0; i < 5; i++) limiter.check('hashA');
    expect(limiter.check('hashA')).toBe(false);
  });

  it('서로 다른 해시는 독립적으로 카운팅된다', () => {
    const limiter = createHashRateLimiter({ max: 5, windowMs: 60_000 });
    for (let i = 0; i < 5; i++) limiter.check('hashA');
    expect(limiter.check('hashA')).toBe(false);
    expect(limiter.check('hashB')).toBe(true);
  });

  it('윈도우(60초) 경과 후에는 다시 통과한다', () => {
    const limiter = createHashRateLimiter({ max: 5, windowMs: 60_000 });
    for (let i = 0; i < 5; i++) limiter.check('hashA');
    expect(limiter.check('hashA')).toBe(false);
    jest.advanceTimersByTime(60_001);
    expect(limiter.check('hashA')).toBe(true);
  });
});
