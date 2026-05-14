-- 토스 로그인 사용자 정보 컬럼 추가
-- 수집 동의 항목: user_name, user_email, user_gender, user_birthday, user_phone

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS toss_name     TEXT,
  ADD COLUMN IF NOT EXISTS toss_email    TEXT,
  ADD COLUMN IF NOT EXISTS toss_gender   TEXT,
  ADD COLUMN IF NOT EXISTS toss_birthday TEXT,
  ADD COLUMN IF NOT EXISTS toss_phone    TEXT;

COMMENT ON COLUMN public.users.toss_name     IS '토스 로그인으로 수집한 실명';
COMMENT ON COLUMN public.users.toss_email    IS '토스 로그인으로 수집한 이메일';
COMMENT ON COLUMN public.users.toss_gender   IS '토스 로그인으로 수집한 성별';
COMMENT ON COLUMN public.users.toss_birthday IS '토스 로그인으로 수집한 생년월일';
COMMENT ON COLUMN public.users.toss_phone    IS '토스 로그인으로 수집한 휴대전화번호';
