// @MX:ANCHOR: 토스 로그인 authorizationCode → 이름 교환 Edge Function
// @MX:REASON: 정적 앱에서 앱인토스 API 직접 호출 불가, 서버사이드 처리 필요
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const body = await req.json();
    const { authorizationCode, supabaseUserId } = body;

    console.log('[toss-login] received:', { supabaseUserId, codeLength: authorizationCode?.length });

    if (!authorizationCode || !supabaseUserId) {
      return new Response(
        JSON.stringify({ error: 'authorizationCode and supabaseUserId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // mTLS 지원 여부 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasMtlsSupport = typeof (Deno as any).createHttpClient === 'function';
    console.log('[toss-login] Deno.createHttpClient available:', hasMtlsSupport);

    // 환경변수 확인
    const certAvailable = !!Deno.env.get('MTLS_CERT');
    const keyAvailable = !!Deno.env.get('MTLS_KEY');
    console.log('[toss-login] secrets:', { certAvailable, keyAvailable });

    if (!hasMtlsSupport) {
      // mTLS 미지원 시: DB에 연동 표시만 기록
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', supabaseUserId);

      return new Response(
        JSON.stringify({ ok: true, name: '', debug: 'mTLS not supported in this runtime' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // mTLS 클라이언트 생성
    const MTLS_CERT = Deno.env.get('MTLS_CERT')!;
    const MTLS_KEY = Deno.env.get('MTLS_KEY')!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tlsClient = (Deno as any).createHttpClient({
      certChain: MTLS_CERT,
      privateKey: MTLS_KEY,
    });

    console.log('[toss-login] mTLS client created, calling API...');

    // 앱인토스 API 호출
    const userInfoRes = await fetch(
      'https://apps-in-toss-api.toss.im/api/v2/toss-login/userinfo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode }),
        client: tlsClient,
      }
    );

    const resText = await userInfoRes.text();
    console.log('[toss-login] API response:', userInfoRes.status, resText.slice(0, 200));

    if (!userInfoRes.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: 'API failed', status: userInfoRes.status, body: resText }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const userInfo = JSON.parse(resText);
    const tossName: string =
      userInfo?.user_name ??
      userInfo?.name ??
      userInfo?.resultBody?.userName ??
      userInfo?.data?.name ??
      '';

    console.log('[toss-login] userInfo keys:', Object.keys(userInfo), '| name:', tossName);

    // Supabase 업데이트
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    await supabase
      .from('users')
      .update({ toss_name: tossName || null, updated_at: new Date().toISOString() })
      .eq('id', supabaseUserId);

    return new Response(
      JSON.stringify({ ok: true, name: tossName }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (e) {
    console.error('[toss-login] caught error:', String(e));
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
});
