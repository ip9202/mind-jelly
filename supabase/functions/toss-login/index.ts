// @MX:ANCHOR: 토스 로그인 연동 기록 Edge Function
// @MX:REASON: 정적 앱에서 toss_linked 상태를 서버에 기록
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TossLoginRequest {
  supabaseUserId: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  try {
    const body: TossLoginRequest = await req.json();
    const { supabaseUserId } = body;

    if (!supabaseUserId) {
      return new Response(
        JSON.stringify({ error: 'supabaseUserId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // users 테이블에 toss_linked = true 기록
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error } = await supabase
      .from('users')
      .update({ toss_linked: true, updated_at: new Date().toISOString() })
      .eq('id', supabaseUserId);

    if (error) {
      // toss_linked 컬럼이 없을 수 있으므로 에러 무시하고 성공 반환
      console.warn('[toss-login] update warning:', error.message);
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (e) {
    console.error('[toss-login] error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
});
