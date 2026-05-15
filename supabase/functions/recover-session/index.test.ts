/**
 * Deno 테스트 — recover-session Edge Function
 *
 * 실행: `deno test --allow-env --allow-net supabase/functions/recover-session/index.test.ts`
 * Jest는 이 파일을 수집하지 않는다 (testMatch는 __tests__/** 또는 src/**).
 *
 * @MX:SPEC: SPEC-SESSION-RECOVER-001 M1
 *
 * 환경 변수가 설정되지 않은 환경에서 핸들러 동작을 확인하기 위한
 * 경량 통합 테스트. 실제 Supabase 연결은 로컬 `supabase start` 환경에서만 통과한다.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

// 환경변수 주입
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon');
Deno.env.set('SUPABASE_URL', 'http://localhost:54321');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service');

// 동적 import — Deno.serve 핸들러를 inspectable 하게 가져오기 위해
// supabase functions 런타임이 아닌 환경에서는 Deno.serve를 stub 해야 한다.
let registeredHandler: ((req: Request) => Promise<Response>) | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Deno as any).serve = (handler: (req: Request) => Promise<Response>) => {
  registeredHandler = handler;
};

await import('./index.ts');

const handler = registeredHandler!;

Deno.test('Authorization 헤더 없으면 401', async () => {
  const res = await handler(
    new Request('http://localhost/recover-session', {
      method: 'POST',
      body: JSON.stringify({ toss_hash: 'h1' }),
    }),
  );
  if (res.status !== 401) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

Deno.test('toss_hash 없으면 400', async () => {
  const res = await handler(
    new Request('http://localhost/recover-session', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-anon' },
      body: JSON.stringify({}),
    }),
  );
  if (res.status !== 400) {
    throw new Error(`expected 400, got ${res.status}`);
  }
});

Deno.test('동일 해시 6회째 호출은 429', async () => {
  const make = () =>
    handler(
      new Request('http://localhost/recover-session', {
        method: 'POST',
        headers: { Authorization: 'Bearer test-anon' },
        body: JSON.stringify({ toss_hash: 'rate-test-hash' }),
      }),
    );
  // 첫 5회는 통과 (rate limit 측면에서) — 다만 service-role 호출은 실패할 수 있다
  for (let i = 0; i < 5; i++) {
    const res = await make();
    if (res.status === 429) {
      throw new Error(`unexpected 429 on attempt ${i + 1}`);
    }
  }
  const res = await make();
  if (res.status !== 429) {
    throw new Error(`expected 429, got ${res.status}`);
  }
});
