-- =============================================
-- mind-jelly Supabase 스키마 v2
-- Supabase auth.uid() 기반 (익명 인증 + 토스 로그인 대응)
-- SQL Editor에서 기존 테이블 삭제 후 실행
-- =============================================

-- 기존 테이블 삭제 (있다면)
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS diary_entries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 사용자 프로필 (Supabase auth.users와 연결)
CREATE TABLE users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  toss_user_id   TEXT UNIQUE,   -- 토스 등록 후 연결
  nickname       TEXT UNIQUE,
  invite_code    TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
  avatar_emotion TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 감정 일기
CREATE TABLE diary_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  emotion     TEXT NOT NULL,
  confidence  FLOAT NOT NULL DEFAULT 0,
  emotion_ko  TEXT NOT NULL,
  is_shared   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 친구 관계
CREATE TABLE friendships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (requester_id, receiver_id)
);

-- 인덱스
CREATE INDEX idx_diary_entries_user_id  ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_created  ON diary_entries(created_at DESC);
CREATE INDEX idx_diary_entries_shared   ON diary_entries(is_shared) WHERE is_shared = true;
CREATE INDEX idx_friendships_receiver   ON friendships(receiver_id);

-- RLS 활성화
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships   ENABLE ROW LEVEL SECURITY;

-- users 정책
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete" ON users FOR DELETE USING (auth.uid() = id);

-- diary 정책: 본인 일기 전체 + 타인의 공유 일기
CREATE POLICY "diary_owner"  ON diary_entries FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "diary_shared" ON diary_entries FOR SELECT USING (is_shared = true);

-- friendships 정책
CREATE POLICY "friendships_view"   ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "friendships_insert" ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friendships_update" ON friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "friendships_delete" ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
