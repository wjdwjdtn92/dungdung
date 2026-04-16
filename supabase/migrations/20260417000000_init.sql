-- ============================================================
-- 둥둥(Dungdung) 초기 스키마 — SPEC.md v1.1 기준
-- ============================================================

-- PostGIS 확장 활성화
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum 타입
CREATE TYPE visibility AS ENUM ('public', 'friends', 'private');
CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment');

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE users (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url   text,
  bio          text,
  locale       text NOT NULL DEFAULT 'ko',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 신규 가입 시 users 행 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. trips
-- ============================================================
CREATE TABLE trips (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  cover_pin_id uuid,                          -- FK 후순위 추가 (pins 생성 후)
  visibility   visibility NOT NULL DEFAULT 'public',
  started_at   date,
  ended_at     date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX trips_user_id_created_at ON trips (user_id, created_at DESC);

-- ============================================================
-- 3. pins
-- ============================================================
CREATE TABLE pins (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      uuid REFERENCES trips(id) ON DELETE SET NULL,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  body         text,
  lat          float8 NOT NULL,
  lng          float8 NOT NULL,
  location     geography(Point, 4326) GENERATED ALWAYS AS (ST_Point(lng, lat)) STORED,
  place_name   text NOT NULL,
  place_id     text,
  country_code char(2),
  city         text,
  visited_at   date NOT NULL,
  visited_tz   text,
  visibility   visibility NOT NULL DEFAULT 'public',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pins_user_id_created_at ON pins (user_id, created_at DESC);
CREATE INDEX pins_visibility          ON pins (visibility);
CREATE INDEX pins_country_code        ON pins (country_code);
CREATE INDEX pins_location            ON pins USING GIST (location);

-- trips.cover_pin_id FK 추가
ALTER TABLE trips
  ADD CONSTRAINT trips_cover_pin_id_fkey
  FOREIGN KEY (cover_pin_id) REFERENCES pins(id) ON DELETE SET NULL;

-- ============================================================
-- 4. pin_photos
-- ============================================================
CREATE TABLE pin_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id       uuid NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  "order"      int NOT NULL DEFAULT 0,
  width        int,
  height       int,
  exif_lat     float8,
  exif_lng     float8,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pin_photos_pin_id ON pin_photos (pin_id, "order");

-- ============================================================
-- 5. tags & pin_tags
-- ============================================================
CREATE TABLE tags (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL CHECK (name = lower(name))
);

CREATE TABLE pin_tags (
  pin_id uuid NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (pin_id, tag_id)
);

-- ============================================================
-- 6. follows
-- ============================================================
CREATE TABLE follows (
  follower_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX follows_following_id ON follows (following_id);

-- ============================================================
-- 7. likes
-- ============================================================
CREATE TABLE likes (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pin_id     uuid NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, pin_id)
);

CREATE INDEX likes_pin_id ON likes (pin_id);

-- ============================================================
-- 8. comments
-- ============================================================
CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id     uuid NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX comments_pin_id ON comments (pin_id, created_at DESC);

-- ============================================================
-- 9. notifications
-- ============================================================
CREATE TABLE notifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              notification_type NOT NULL,
  target_pin_id     uuid REFERENCES pins(id) ON DELETE CASCADE,
  target_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  read_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  -- 동일한 (수신자, 행위자, 타입, 핀) 중복 알림 방지
  UNIQUE NULLS NOT DISTINCT (recipient_id, actor_id, type, target_pin_id)
);

CREATE INDEX notifications_recipient_unread ON notifications (recipient_id, created_at DESC)
  WHERE read_at IS NULL;

-- ============================================================
-- 10. Row Level Security
-- ============================================================

ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users_public_read"   ON users FOR SELECT USING (true);
CREATE POLICY "users_own_write"     ON users FOR ALL   USING (auth.uid() = id);

-- trips
CREATE POLICY "trips_public_read"   ON trips FOR SELECT USING (
  visibility = 'public'
  OR user_id = auth.uid()
  OR (visibility = 'friends' AND EXISTS (
    SELECT 1 FROM follows WHERE following_id = trips.user_id AND follower_id = auth.uid()
  ))
);
CREATE POLICY "trips_own_insert"    ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_own_update"    ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trips_own_delete"    ON trips FOR DELETE USING (auth.uid() = user_id);

-- pins
CREATE POLICY "pins_public_read"    ON pins FOR SELECT USING (
  visibility = 'public'
  OR user_id = auth.uid()
  OR (visibility = 'friends' AND EXISTS (
    SELECT 1 FROM follows WHERE following_id = pins.user_id AND follower_id = auth.uid()
  ))
);
CREATE POLICY "pins_own_insert"     ON pins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pins_own_update"     ON pins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pins_own_delete"     ON pins FOR DELETE USING (auth.uid() = user_id);

-- pin_photos: 핀 소유자만 쓰기, 핀이 보이면 사진도 보임
CREATE POLICY "pin_photos_read"     ON pin_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = pin_photos.pin_id)
);
CREATE POLICY "pin_photos_own_write" ON pin_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = pin_photos.pin_id AND pins.user_id = auth.uid())
);

-- tags: 누구나 읽기, 로그인 사용자만 쓰기
CREATE POLICY "tags_public_read"    ON tags FOR SELECT USING (true);
CREATE POLICY "tags_auth_insert"    ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- pin_tags
CREATE POLICY "pin_tags_read"       ON pin_tags FOR SELECT USING (true);
CREATE POLICY "pin_tags_own_write"  ON pin_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = pin_tags.pin_id AND pins.user_id = auth.uid())
);

-- follows
CREATE POLICY "follows_read"        ON follows FOR SELECT USING (
  follower_id = auth.uid() OR following_id = auth.uid()
);
CREATE POLICY "follows_own_insert"  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_own_delete"  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- likes
CREATE POLICY "likes_public_read"   ON likes FOR SELECT USING (true);
CREATE POLICY "likes_own_insert"    ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_own_delete"    ON likes FOR DELETE USING (auth.uid() = user_id);

-- comments
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = comments.pin_id)
);
CREATE POLICY "comments_own_insert"  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_delete"  ON comments FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM pins WHERE pins.id = comments.pin_id AND pins.user_id = auth.uid())
);

-- notifications: 수신자만 읽기/수정
CREATE POLICY "notif_own_read"      ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "notif_own_update"    ON notifications FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "notif_service_insert" ON notifications FOR INSERT WITH CHECK (true); -- Edge Function (service role)
