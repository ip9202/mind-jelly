-- SPEC-INFRA-001: 개발용 시드 데이터
-- npm run db:sync 실행 후 이 스크립트로 테스트 데이터 생성
-- ON CONFLICT로 중복 실행 안전

-- =============================================
-- 테스트 사용자 (고정 UUID)
-- =============================================

-- auth.users에 테스트 계정 생성은 Supabase 대시보드에서 수동으로 진행해야 합니다.
-- 아래 UUID는 seed 적용 전 auth.users에 존재해야 합니다.
-- 대시보드 > Authentication > Users > Add User 로 생성 후 UUID를 아래에 맞추세요.

-- 테스트 사용자 1: 테스트유저1
INSERT INTO users (id, nickname, invite_code, avatar_emotion, toss_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '테스트유저1',
  'TEST01',
  'happy',
  '테스터1'
) ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  invite_code = EXCLUDED.invite_code,
  avatar_emotion = EXCLUDED.avatar_emotion;

-- 테스트 사용자 2: 테스트유저2
INSERT INTO users (id, nickname, invite_code, avatar_emotion, toss_name)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '테스트유저2',
  'TEST02',
  'sad',
  '테스터2'
) ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  invite_code = EXCLUDED.invite_code,
  avatar_emotion = EXCLUDED.avatar_emotion;

-- 테스트 사용자 3: 테스트유저3
INSERT INTO users (id, nickname, invite_code, avatar_emotion)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '테스트유저3',
  'TEST03',
  'anxious'
) ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  invite_code = EXCLUDED.invite_code,
  avatar_emotion = EXCLUDED.avatar_emotion;

-- =============================================
-- 친구 관계
-- =============================================

-- 유저1 ↔ 유저2: 수락됨 (accepted)
INSERT INTO friendships (requester_id, receiver_id, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'accepted'
) ON CONFLICT (requester_id, receiver_id) DO UPDATE SET
  status = EXCLUDED.status;

-- 유저1 → 유저3: 대기중 (pending)
INSERT INTO friendships (requester_id, receiver_id, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'pending'
) ON CONFLICT (requester_id, receiver_id) DO UPDATE SET
  status = EXCLUDED.status;

-- =============================================
-- 일기 엔트리
-- =============================================

-- 유저1 일기
INSERT INTO diary_entries (user_id, text, emotion, confidence, emotion_ko, is_shared)
VALUES
  ('00000000-0000-0000-0000-000000000001', '오늘 회사에서 칭찬받아서 기분 좋았다', 'happy', 0.92, '기쁨', true),
  ('00000000-0000-0000-0000-000000000001', '월요일 출근길 지하철이 너무 혼잡했다', 'tired', 0.85, '지침', false),
  ('00000000-0000-0000-0000-000000000001', '친구와 다투고 나서 마음이 무거웠다', 'sad', 0.88, '슬픔', false)
ON CONFLICT DO NOTHING;

-- 유저2 일기
INSERT INTO diary_entries (user_id, text, emotion, confidence, emotion_ko, is_shared)
VALUES
  ('00000000-0000-0000-0000-000000000002', '프로젝트 마감이 다가와서 불안하다', 'anxious', 0.90, '불안', true),
  ('00000000-0000-0000-0000-000000000002', '점심에 맛있는 걸 먹어서 기분이 풀렸다', 'happy', 0.78, '기쁨', false)
ON CONFLICT DO NOTHING;

-- 유저3 일기
INSERT INTO diary_entries (user_id, text, emotion, confidence, emotion_ko, is_shared)
VALUES
  ('00000000-0000-0000-0000-000000000003', '상사에게 불합리한 요구를 받았다', 'angry', 0.93, '분노', true),
  ('00000000-0000-0000-0000-000000000003', '아무것도 하기 싫은 하루였다', 'empty', 0.80, '허무', false)
ON CONFLICT DO NOTHING;

-- =============================================
-- 스킨 데이터
-- =============================================

INSERT INTO user_skins (user_id, unlocked_skins, active_skin, skin_enabled)
VALUES
  ('00000000-0000-0000-0000-000000000001', ARRAY['default', 'cat'], 'cat', true),
  ('00000000-0000-0000-0000-000000000002', ARRAY['default'], 'default', false),
  ('00000000-0000-0000-0000-000000000003', ARRAY['default', 'dog', 'rabbit'], 'rabbit', true)
ON CONFLICT (user_id) DO UPDATE SET
  unlocked_skins = EXCLUDED.unlocked_skins,
  active_skin = EXCLUDED.active_skin,
  skin_enabled = EXCLUDED.skin_enabled;
