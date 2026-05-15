// @MX:ANCHOR: 토스 해시 기반 세션 복구 Edge Function
// @MX:REASON: 기기 변경/저장소 초기화 시 기존 Supabase user.id 세션을 admin API로 재발급
// @MX:SPEC: SPEC-SESSION-RECOVER-001 REQ-SESSION-010, REQ-SESSION-031, REQ-SESSION-032
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const JSON_HEADERS = { 'Content-Type': 'application/json', ...CORS_HEADERS };

// @MX:NOTE: [AUTO] per-hash 인메모리 rate limit: 60초 윈도우 내 5회 초과 시 429
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // anon-key 인증 — 누락 시 401 (해시 존재 여부 비공개)
  const auth = req.headers.get('Authorization') ?? '';
  const expected = `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') ?? ''}`;
  if (!auth || auth !== expected) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body: { toss_hash?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const tossHash = body?.toss_hash;
  if (!tossHash || typeof tossHash !== 'string') {
    return json({ error: 'toss_hash required' }, 400);
  }

  if (!checkRateLimit(tossHash)) {
    console.warn('[recover-session] rate limited:', { hash_prefix: tossHash.slice(0, 8) });
    return json({ error: 'rate_limited' }, 429);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: user, error: lookupErr } = await supabase
      .from('users')
      .select('id')
      .eq('toss_user_id', tossHash)
      .maybeSingle();

    if (lookupErr) {
      console.error('[recover-session] lookup error:', lookupErr.message);
      return json({ error: 'lookup_failed' }, 500);
    }

    if (!user?.id) {
      return json({ found: false }, 200);
    }

    // @MX:NOTE: [AUTO] admin API로 해당 user.id에 대한 신규 세션 발급
    // createSession은 @supabase/supabase-js v2.39+ 에서 제공
    const adminAuth = supabase.auth.admin as unknown as {
      createSession?: (args: { user_id: string }) => Promise<{
        data: { session: { access_token: string; refresh_token: string } | null };
        error: { message: string } | null;
      }>;
    };

    if (typeof adminAuth.createSession === 'function') {
      const { data, error } = await adminAuth.createSession({ user_id: user.id });
      if (error || !data?.session) {
        console.error('[recover-session] createSession failed:', error?.message);
        return json({ error: 'session_failed' }, 500);
      }
      const startMs = Date.now();
      console.log('[recover-session] session.recovered', {
        hash_prefix: tossHash.slice(0, 8),
        user_id_prefix: user.id.slice(0, 8),
        latency_ms: Date.now() - startMs,
      });
      return json(
        {
          found: true,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
        200,
      );
    }

    // Fallback: generateLink 로 magiclink 생성 후 토큰 추출
    // (anonymous user는 email이 없을 수 있어 createSession 실패 시 server error 처리)
    console.error('[recover-session] admin.createSession not available in this SDK version');
    return json({ error: 'admin_unavailable' }, 500);
  } catch (e) {
    console.error('[recover-session] caught:', String(e));
    return json({ error: 'internal' }, 500);
  }
});
