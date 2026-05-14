// @MX:ANCHOR: 토스 로그인 OAuth2 code exchange Edge Function
// @MX:REASON: 정적 앱에서 client_secret을 노출하지 않기 위한 서버사이드 처리
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TOSS_TOKEN_ENDPOINT = 'https://accounts.toss.im/oauth2/token';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TOSS_CLIENT_ID = Deno.env.get('TOSS_CLIENT_ID')!;
const TOSS_CLIENT_SECRET = Deno.env.get('TOSS_CLIENT_SECRET')!;

interface TossLoginRequest {
  authorizationCode: string;
  supabaseUserId: string;
}

interface TossUserInfo {
  user_name?: string;
  user_email?: string;
  user_gender?: string;
  user_birthday?: string;
  user_phone?: string;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: TossLoginRequest = await req.json();
    const { authorizationCode, supabaseUserId } = body;

    if (!authorizationCode || !supabaseUserId) {
      return new Response(
        JSON.stringify({ error: 'authorizationCode and supabaseUserId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. 토스 OAuth 서버에 authorizationCode → access_token 교환
    const tokenRes = await fetch(TOSS_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${TOSS_CLIENT_ID}:${TOSS_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('[toss-login] token exchange failed:', err);
      return new Response(
        JSON.stringify({ error: 'Token exchange failed', detail: err }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;

    // 2. access_token으로 토스 유저 정보 조회
    const userInfoRes = await fetch('https://accounts.toss.im/oauth2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user info' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userInfo: TossUserInfo = await userInfoRes.json();

    // 3. Supabase users 테이블 업데이트
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        toss_name: userInfo.user_name ?? null,
        toss_email: userInfo.user_email ?? null,
        toss_gender: userInfo.user_gender ?? null,
        toss_birthday: userInfo.user_birthday ?? null,
        toss_phone: userInfo.user_phone ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supabaseUserId);

    if (updateError) {
      console.error('[toss-login] supabase update failed:', updateError);
      return new Response(
        JSON.stringify({ error: 'DB update failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        name: userInfo.user_name,
        email: userInfo.user_email,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (e) {
    console.error('[toss-login] unexpected error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
