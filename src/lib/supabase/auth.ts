/**
 * Supabase 인증 헬퍼
 * 익명 로그인 → 앱 시작 시 자동 실행
 * 토스 로그인 → toss_user_id 연결
 */

import { supabase } from './client';

// @MX:ANCHOR: Supabase 세션 초기화 진입점
// @MX:REASON: _app 또는 BridgeInitializer에서 앱 시작 시 단 한 번 호출

/** 현재 세션 반환 또는 익명 로그인으로 신규 세션 생성 */
export async function initSupabaseSession(): Promise<string | null> {
  // 기존 세션 확인
  const { data: { session } } = await supabase.auth.getSession();

  let userId = session?.user?.id ?? null;

  // 세션 없으면 익명 로그인
  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      console.error('[Supabase] 익명 로그인 실패:', error?.message);
      return null;
    }
    userId = data.user.id;
  }

  // public.users 프로필 보장 (이미 있으면 무시)
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.error('[Supabase] 프로필 생성 실패:', error.message);
  }

  return userId;
}

/** 토스 로그인 연결: users 테이블에 toss_user_id 업데이트 */
export async function linkTossUser(supabaseUserId: string, tossUserId: string) {
  const { error } = await supabase
    .from('users')
    .update({ toss_user_id: tossUserId, updated_at: new Date().toISOString() })
    .eq('id', supabaseUserId);

  if (error) {
    console.error('[Supabase] 토스 ID 연결 실패:', error.message);
  }
}

/** 현재 로그인된 Supabase 유저 ID */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
