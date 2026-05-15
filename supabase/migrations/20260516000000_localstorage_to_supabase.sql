-- 1) Extend users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS jelly_shape TEXT,
  ADD COLUMN IF NOT EXISTS persist_emotion BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skin_expires_at TIMESTAMPTZ;

-- 2) user_skins table
CREATE TABLE IF NOT EXISTS user_skins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  unlocked_skins TEXT[] NOT NULL DEFAULT '{}',
  active_skin TEXT,
  skin_enabled BOOLEAN NOT NULL DEFAULT false,
  rewarded_ad_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_skins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_skins_self_select" ON user_skins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_skins_self_upsert" ON user_skins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) ad_impressions table
CREATE TABLE IF NOT EXISTS ad_impressions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ad_date DATE NOT NULL,
  interstitial_count INTEGER NOT NULL DEFAULT 0,
  rewarded_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, ad_date)
);

ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_impressions_self" ON ad_impressions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) Indexes
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user_date
  ON ad_impressions(user_id, ad_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_invite_code
  ON users(invite_code) WHERE invite_code IS NOT NULL;

-- 5) RPC function: atomic rewarded ad + skin unlock
CREATE OR REPLACE FUNCTION increment_rewarded_and_unlock(
  p_user_id UUID,
  p_new_skin_id TEXT
) RETURNS user_skins AS $$
DECLARE
  v_result user_skins;
BEGIN
  INSERT INTO user_skins (user_id, rewarded_ad_count, unlocked_skins)
  VALUES (p_user_id, 1, ARRAY[p_new_skin_id])
  ON CONFLICT (user_id) DO UPDATE SET
    rewarded_ad_count = user_skins.rewarded_ad_count + 1,
    unlocked_skins = CASE
      WHEN p_new_skin_id IS NOT NULL AND NOT (p_new_skin_id = ANY(user_skins.unlocked_skins))
      THEN user_skins.unlocked_skins || p_new_skin_id
      ELSE user_skins.unlocked_skins
    END,
    updated_at = now()
  RETURNING * INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) RPC function: reset user data
CREATE OR REPLACE FUNCTION reset_user_data(p_user_id UUID) RETURNS void AS $$
BEGIN
  DELETE FROM user_skins WHERE user_id = p_user_id;
  DELETE FROM ad_impressions WHERE user_id = p_user_id;
  DELETE FROM diary_entries WHERE user_id = p_user_id;
  UPDATE users SET
    jelly_shape = NULL,
    persist_emotion = false,
    skin_expires_at = NULL,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
