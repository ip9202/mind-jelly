// @MX:ANCHOR: 토스 로그인 authorizationCode → 이름 교환 Edge Function (mTLS)
// @MX:REASON: 앱인토스 API는 mTLS 인증 필수, 정적 앱에서 직접 호출 불가
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MTLS_CERT = Deno.env.get('MTLS_CERT')!;
const MTLS_KEY = Deno.env.get('MTLS_KEY')!;

// 앱인토스 토스 로그인 유저 정보 조회 엔드포인트
const AIT_USERINFO_ENDPOINT = 'https://apps-in-toss-api.toss.im/api/v2/toss-login/userinfo';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface TossLoginRequest {
  authorizationCode: string;
  supabaseUserId: string;
}

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
    const { authorizationCode, supabaseUserId } = body;

    if (!authorizationCode || !supabaseUserId) {
      return new Response(
        JSON.stringify({ error: 'authorizationCode and supabaseUserId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // mTLS 클라이언트 생성
    const tlsClient = Deno.createHttpClient({
      certChain: MTLS_CERT,
      privateKey: MTLS_KEY,
    });

    // 앱인토스 API로 유저 정보 조회
    const userInfoRes = await fetch(AIT_USERINFO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode }),
      client: tlsClient,
    });

    if (!userInfoRes.ok) {
      const errText = await userInfoRes.text();
      console.error('[toss-login] userinfo failed:', userInfoRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user info', status: userInfoRes.status }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const userInfo = await userInfoRes.json();
    // 앱인토스 응답 구조에 따라 이름 추출 (실제 필드명은 로그로 확인 필요)
    const tossName: string = userInfo?.user_name ?? userInfo?.name ?? userInfo?.resultBody?.userName ?? '';

    console.log('[toss-login] userInfo keys:', Object.keys(userInfo));

    // Supabase users 테이블 업데이트
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error: updateError } = await supabase
      .from('users')
      .update({
        toss_name: tossName || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supabaseUserId);

    if (updateError) {
      console.error('[toss-login] db update failed:', updateError.message);
    }

    return new Response(
      JSON.stringify({ ok: true, name: tossName }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (e) {
    console.error('[toss-login] error:', e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
});
