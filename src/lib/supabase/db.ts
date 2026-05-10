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

/** 내 일기 전체 조회 */
export async function getMyDiaryEntries(userId: string) {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

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
