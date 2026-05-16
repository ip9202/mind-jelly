import { supabase } from './client';

// ── 사용자 ──────────────────────────────────────────

/** 닉네임으로 사용자 검색 */
export async function findUserByNickname(nickname: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('nickname', nickname)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/** 초대코드로 사용자 검색 */
export async function findUserByInviteCode(code: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/** 내 프로필 조회 */
export async function getMyProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/** 닉네임 설정 */
export async function setNickname(userId: string, nickname: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ nickname, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── 일기 ──────────────────────────────────────────

/** 일기 저장 */
export async function saveDiaryEntry(entry: {
  // 로컬에서 생성한 ID 전달 시 Supabase row ID로 사용 (id 일치 보장)
  id?: string;
  userId: string;
  text: string;
  emotion: string;
  confidence: number;
  emotionKo: string;
  isShared?: boolean;
  createdAt?: string;
}) {
  const { data, error } = await supabase
    .from('diary_entries')
    .insert({
      ...(entry.id ? { id: entry.id } : {}),
      user_id: entry.userId,
      text: entry.text,
      emotion: entry.emotion,
      confidence: entry.confidence,
      emotion_ko: entry.emotionKo,
      is_shared: entry.isShared ?? false,
      created_at: entry.createdAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** 내 일기 조회 (최근 30개) */
// @MX:NOTE: [AUTO] SPEC-PERF-001 (REQ-PERF-001) - 모바일 WebView 메모리 절약을 위해 30개 제한
export async function getMyDiaryEntries(userId: string) {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data ?? [];
}

/** 일기 삭제 */
export async function deleteDiaryEntry(id: string) {
  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/** 일기 공유 여부 토글 */
export async function toggleDiaryShare(id: string, isShared: boolean) {
  const { error } = await supabase
    .from('diary_entries')
    .update({ is_shared: isShared })
    .eq('id', id);

  if (error) throw error;
}

// @MX:NOTE: [AUTO] 오늘 작성된 다이어리 존재 여부 확인
// @MX:REASON: 다이어리가 없으면 오늘 첫 접속으로 간주하여 젤리 감정 상태 초기화
// @MX:REASON: 로컬 타임존 기준 하루 범위 사용 (UTC 기준 시 한국 자정~오전9시 구간에서 날짜 오판)
export async function hasTodayDiary(userId: string): Promise<boolean> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const { data, error } = await supabase
    .from('diary_entries')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .maybeSingle();

  return !!data && !error;
}

// ── 친구 ──────────────────────────────────────────

/** 친구 요청 전송 */
export async function sendFriendRequest(requesterId: string, receiverId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, receiver_id: receiverId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** 친구 요청 수락 */
export async function acceptFriendRequest(requesterId: string, myId: string) {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('requester_id', requesterId)
    .eq('receiver_id', myId);

  if (error) throw error;
}

/** 내 친구 목록 (수락된 것만) */
export async function getMyFriends(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) throw error;
  return data ?? [];
}

/** 받은 친구 요청 (대기 중) */
// @MX:NOTE: [AUTO] pending 상태인 친구 요청 목록을 requester 정보와 함께 조회
export async function getPendingFriendRequests(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, requester:users!requester_id(id, nickname, invite_code, avatar_emotion)')
    .eq('receiver_id', userId)
    .eq('status', 'pending');
  if (error) throw error;
  return data ?? [];
}

/** 친구 요청 거절 (삭제) */
export async function rejectFriendRequest(requesterId: string, myId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('requester_id', requesterId)
    .eq('receiver_id', myId);
  if (error) throw error;
}

/** 보낸 친구 요청 상태 확인 */
export async function checkFriendshipStatus(myId: string, targetId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('status')
    .or(
      `and(requester_id.eq.${myId},receiver_id.eq.${targetId}),and(requester_id.eq.${targetId},receiver_id.eq.${myId})`
    )
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/** 친구의 공유 감정 피드 */
export async function getFriendsFeed(friendIds: string[]) {
  if (friendIds.length === 0) return [];

  const { data, error } = await supabase
    .from('diary_entries')
    .select('*, user:users!user_id(nickname, avatar_emotion, invite_code)')
    .in('user_id', friendIds)
    .eq('is_shared', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

// ── 동기화 (SPEC-SYNC-001) ──────────────────────────

// @MX:NOTE: [AUTO] 사용자 프로필 확장 필드 (jelly_shape, persist_emotion, skin_expires_at)
export interface UserProfile {
  jellyShape: string | null;
  persistEmotion: boolean;
  skinExpiresAt: string | null;
}

// @MX:NOTE: [AUTO] 사용자 스킨 보유/활성/광고 카운트 상태
export interface UserSkins {
  unlockedSkins: string[];
  activeSkin: string | null;
  skinEnabled: boolean;
  rewardedAdCount: number;
  updatedAt: string;
}

// @MX:NOTE: [AUTO] 일별 광고 노출 카운트
export interface AdImpressions {
  interstitialCount: number;
  rewardedCount: number;
  adDate: string;
}

/** 사용자 확장 프로필 조회 (jelly_shape, persist_emotion, skin_expires_at) */
export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('jelly_shape, persist_emotion, skin_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    jellyShape: (data as { jelly_shape: string | null }).jelly_shape ?? null,
    persistEmotion: (data as { persist_emotion: boolean }).persist_emotion ?? false,
    skinExpiresAt: (data as { skin_expires_at: string | null }).skin_expires_at ?? null,
  };
}

/** 사용자 확장 프로필 부분 업데이트 */
export async function updateUserProfile(
  userId: string,
  patch: Partial<{ jellyShape: string | null; persistEmotion: boolean; skinExpiresAt: string | null }>
): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.jellyShape !== undefined) payload.jelly_shape = patch.jellyShape;
  if (patch.persistEmotion !== undefined) payload.persist_emotion = patch.persistEmotion;
  if (patch.skinExpiresAt !== undefined) payload.skin_expires_at = patch.skinExpiresAt;

  const { error } = await supabase.from('users').update(payload).eq('id', userId);
  if (error) throw error;
}

/** 사용자 스킨 상태 조회 */
export async function loadUserSkins(userId: string): Promise<UserSkins | null> {
  const { data, error } = await supabase
    .from('user_skins')
    .select('unlocked_skins, active_skin, skin_enabled, rewarded_ad_count, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  const row = data as {
    unlocked_skins: string[] | null;
    active_skin: string | null;
    skin_enabled: boolean;
    rewarded_ad_count: number;
    updated_at: string;
  };
  return {
    unlockedSkins: row.unlocked_skins ?? [],
    activeSkin: row.active_skin ?? null,
    skinEnabled: row.skin_enabled ?? false,
    rewardedAdCount: row.rewarded_ad_count ?? 0,
    updatedAt: row.updated_at,
  };
}

/** 사용자 스킨 상태 upsert */
export async function upsertUserSkins(
  userId: string,
  patch: Partial<Omit<UserSkins, 'updatedAt'>>
): Promise<void> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (patch.unlockedSkins !== undefined) payload.unlocked_skins = patch.unlockedSkins;
  if (patch.activeSkin !== undefined) payload.active_skin = patch.activeSkin;
  if (patch.skinEnabled !== undefined) payload.skin_enabled = patch.skinEnabled;
  if (patch.rewardedAdCount !== undefined) payload.rewarded_ad_count = patch.rewardedAdCount;

  const { error } = await supabase.from('user_skins').upsert(payload, { onConflict: 'user_id' });
  if (error) throw error;
}

// @MX:NOTE: [AUTO] 보상형 광고 카운트 증가 + 스킨 잠금 해제를 단일 RPC로 원자적 처리
export async function incrementRewardedAdAndUnlock(
  userId: string,
  newSkinId: string | null
): Promise<UserSkins> {
  const { data, error } = await supabase.rpc('increment_rewarded_and_unlock', {
    p_user_id: userId,
    p_new_skin_id: newSkinId,
  });
  if (error) throw new Error(`increment_rewarded_and_unlock 실패: ${error.message ?? error}`);
  if (!data) throw new Error('increment_rewarded_and_unlock 결과 없음');

  const row = data as {
    unlocked_skins: string[] | null;
    active_skin: string | null;
    skin_enabled: boolean;
    rewarded_ad_count: number;
    updated_at: string;
  };
  return {
    unlockedSkins: row.unlocked_skins ?? [],
    activeSkin: row.active_skin ?? null,
    skinEnabled: row.skin_enabled ?? false,
    rewardedAdCount: row.rewarded_ad_count ?? 0,
    updatedAt: row.updated_at,
  };
}

/** 오늘자 광고 노출 카운트 조회 (row 없으면 0으로 초기화된 객체) */
export async function loadTodayAdImpressions(
  userId: string,
  date: string
): Promise<AdImpressions> {
  const { data, error } = await supabase
    .from('ad_impressions')
    .select('interstitial_count, rewarded_count, ad_date')
    .eq('user_id', userId)
    .eq('ad_date', date)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) {
    return { interstitialCount: 0, rewardedCount: 0, adDate: date };
  }

  const row = data as {
    interstitial_count: number;
    rewarded_count: number;
    ad_date: string;
  };
  return {
    interstitialCount: row.interstitial_count ?? 0,
    rewardedCount: row.rewarded_count ?? 0,
    adDate: row.ad_date ?? date,
  };
}

// @MX:NOTE: [AUTO] 광고 카운트 증가 (load → +1 → upsert). RLS로 self-only 보장
export async function incrementAdImpression(
  userId: string,
  date: string,
  type: 'interstitial' | 'rewarded'
): Promise<AdImpressions> {
  const current = await loadTodayAdImpressions(userId, date);
  const next: AdImpressions = {
    interstitialCount:
      type === 'interstitial' ? current.interstitialCount + 1 : current.interstitialCount,
    rewardedCount: type === 'rewarded' ? current.rewardedCount + 1 : current.rewardedCount,
    adDate: date,
  };

  const { error } = await supabase.from('ad_impressions').upsert(
    {
      user_id: userId,
      ad_date: date,
      interstitial_count: next.interstitialCount,
      rewarded_count: next.rewardedCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,ad_date' }
  );
  if (error) throw error;

  return next;
}

/** 사용자 데이터 전체 리셋 (RPC, SECURITY DEFINER로 원자적 처리) */
export async function resetUserData(userId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_user_data', { p_user_id: userId });
  if (error) throw new Error(`reset_user_data 실패: ${error.message ?? error}`);
}
