/**
 * Supabase 인증 헬퍼
 * 익명 로그인 → 앱 시작 시 자동 실행
 * 토스 로그인 → toss_user_id 연결
 *
 * @MX:SPEC: SPEC-SESSION-RECOVER-001
 */

import { supabase } from './client';

// @MX:ANCHOR: Supabase 세션 초기화 진입점
// @MX:REASON: _app 또는 BridgeInitializer에서 앱 시작 시 단 한 번 호출. tossHash가 주어지면 recover-session으로 기존 세션 복구를 우선 시도한다.

export interface InitSupabaseSessionOptions {
  /** 토스 익명 해시. 있으면 recover-session Edge Function 우선 호출 */
  tossHash?: string;
}

/**
 * recover-session Edge Function 으로 기존 세션 복구를 시도한다.
 * 성공 시 supabase.auth.setSession()까지 마치고 user.id를 반환한다.
 * 실패/미매칭/네트워크 오류 시 null을 반환해 호출측이 fallback 하도록 한다.
 *
 * @MX:NOTE: [AUTO] REQ-SESSION-010, REQ-SESSION-011, REQ-SESSION-021
 */
async function tryRecoverSession(tossHash: string): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) return null;

    const res = await fetch(`${supabaseUrl}/functions/v1/recover-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ toss_hash: tossHash }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      found: boolean;
      access_token?: string;
      refresh_token?: string;
    };

    if (!data.found || !data.access_token || !data.refresh_token) {
      return null;
    }

    const { data: setData, error } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (error || !setData?.user) {
      console.error('[Supabase] setSession 실패:', error?.message);
      return null;
    }

    return setData.user.id;
  } catch (e) {
    console.warn('[Supabase] recover-session 호출 실패, fallback:', (e as Error)?.message);
    return null;
  }
}

/** 현재 세션 반환 또는 익명 로그인으로 신규 세션 생성 */
export async function initSupabaseSession(
  options?: InitSupabaseSessionOptions,
): Promise<string | null> {
  // 기존 세션 확인
  const { data: { session } } = await supabase.auth.getSession();

  let userId = session?.user?.id ?? null;

  // 토스 해시가 주어졌고 아직 세션이 없으면 recover-session 우선 시도
  if (!userId && options?.tossHash) {
    const recoveredId = await tryRecoverSession(options.tossHash);
    if (recoveredId) {
      userId = recoveredId;
    }
  }

  // 세션 없으면 익명 로그인 (recover 실패 또는 미매칭 시 fallback)
  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      console.error('[Supabase] 익명 로그인 실패:', error?.message);
      return null;
    }
    userId = data.user.id;
  }

  // public.users 프로필 보장
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.error('[Supabase] 프로필 생성 실패:', error.message);
  }

  // invite_code 누락 시 생성 (기존 유저 대응)
  const { data: profile } = await supabase
    .from('users')
    .select('invite_code')
    .eq('id', userId)
    .single();

  if (profile && !profile.invite_code) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    await supabase.from('users').update({ invite_code: code }).eq('id', userId);
  }

  return userId;
}

/**
 * 토스 로그인 연결: users 테이블에 toss_user_id 업데이트.
 *
 * @MX:NOTE: [AUTO] REQ-SESSION-030 — UNIQUE 충돌(23505) 시 silent swallow + 로그
 * @MX:SPEC: SPEC-SESSION-RECOVER-001
 */
export async function linkTossUser(supabaseUserId: string, tossUserId: string) {
  const { error } = await supabase
    .from('users')
    .update({ toss_user_id: tossUserId, updated_at: new Date().toISOString() })
    .eq('id', supabaseUserId);

  if (error) {
    // PostgreSQL unique_violation = 23505 → 이미 다른 row에 매핑됨
    // 동시 부팅이나 race condition으로 충돌이 발생해도 UI 흐름은 차단하지 않는다.
    if (error.code === '23505') {
      console.warn('[Supabase] toss_user_id 중복 매핑 감지 (silent swallow):', {
        supabaseUserId: supabaseUserId.slice(0, 8),
        tossHashPrefix: tossUserId.slice(0, 8),
      });
      return;
    }
    console.error('[Supabase] 토스 ID 연결 실패:', error.message);
  }
}

/** 현재 로그인된 Supabase 유저 ID */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
