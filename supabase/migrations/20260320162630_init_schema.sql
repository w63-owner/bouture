-- =============================================================================
-- bouture.com — Initial database schema
-- Extensions, Enums, Tables, Indexes, RLS, Functions, Triggers, Realtime
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------------------------------------------------------------------------
-- 2. Enums
-- ---------------------------------------------------------------------------
CREATE TYPE listing_size AS ENUM (
  'graine',
  'tubercule',
  'xs',
  's',
  'm',
  'l',
  'xl',
  'xxl'
);

CREATE TYPE message_type AS ENUM (
  'text',
  'image'
);

CREATE TYPE message_status AS ENUM (
  'sending',
  'sent',
  'delivered',
  'read'
);

CREATE TYPE plant_status AS ENUM (
  'collection',
  'for_donation',
  'donated'
);

-- ---------------------------------------------------------------------------
-- 3. Tables (respecting FK order)
-- ---------------------------------------------------------------------------

-- profiles
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL CHECK (
                  LENGTH(username) BETWEEN 3 AND 20
                  AND username ~ '^[a-zA-Z0-9_]+$'
                ),
  avatar_url    TEXT,
  bio           TEXT CHECK (LENGTH(bio) <= 200),
  address_street   TEXT,
  address_city     TEXT,
  address_postal   TEXT,
  address_country  TEXT,
  address_lat      DOUBLE PRECISION,
  address_lng      DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_username_trgm ON profiles USING gin (username gin_trgm_ops);

-- species
CREATE TABLE species (
  id              SERIAL PRIMARY KEY,
  common_name     TEXT NOT NULL,
  scientific_name TEXT,
  family          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_species_common_name_trgm ON species USING gin (common_name gin_trgm_ops);
CREATE INDEX idx_species_scientific_name_trgm ON species USING gin (scientific_name gin_trgm_ops);

-- plant_library (must come before listings due to FK)
CREATE TABLE plant_library (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  species_name TEXT NOT NULL,
  species_id  INT REFERENCES species(id),
  photos      TEXT[] NOT NULL CHECK (array_length(photos, 1) BETWEEN 1 AND 5),
  notes       TEXT CHECK (LENGTH(notes) <= 300),
  status      plant_status NOT NULL DEFAULT 'collection',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plant_library_user_id ON plant_library (user_id);

-- listings
CREATE TABLE listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  species_name     TEXT NOT NULL,
  species_id       INT REFERENCES species(id),
  size             listing_size NOT NULL,
  description      TEXT CHECK (LENGTH(description) <= 500),
  photos           TEXT[] NOT NULL CHECK (array_length(photos, 1) BETWEEN 1 AND 5),
  location_exact   GEOGRAPHY(POINT, 4326) NOT NULL,
  location_public  GEOGRAPHY(POINT, 4326) NOT NULL,
  address_city     TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  plant_library_id UUID REFERENCES plant_library(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_location_public ON listings USING GIST (location_public);
CREATE INDEX idx_listings_donor_id ON listings (donor_id);
CREATE INDEX idx_listings_is_active ON listings (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_listings_species_name_trgm ON listings USING gin (species_name gin_trgm_ops);
CREATE INDEX idx_listings_created_at ON listings (created_at DESC);

-- conversations
CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id    UUID REFERENCES listings(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_conversation UNIQUE (participant_a, participant_b, listing_id),
  CONSTRAINT different_participants CHECK (participant_a <> participant_b)
);

CREATE INDEX idx_conversations_participant_a ON conversations (participant_a);
CREATE INDEX idx_conversations_participant_b ON conversations (participant_b);
CREATE INDEX idx_conversations_last_message ON conversations (last_message_at DESC NULLS LAST);

-- messages
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT,
  type            message_type NOT NULL DEFAULT 'text',
  image_url       TEXT,
  status          message_status NOT NULL DEFAULT 'sent',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT content_or_image CHECK (
    (type = 'text' AND content IS NOT NULL AND LENGTH(content) > 0)
    OR (type = 'image' AND image_url IS NOT NULL)
  )
);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id, created_at);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_status ON messages (status) WHERE status <> 'read';

-- follows
CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX idx_follows_following_id ON follows (following_id);

-- push_subscriptions
CREATE TABLE push_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint          TEXT NOT NULL,
  keys_p256dh       TEXT NOT NULL,
  keys_auth         TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions (user_id);

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- SPECIES (read-only for everyone)
CREATE POLICY "Species are viewable by everyone"
  ON species FOR SELECT USING (true);

-- LISTINGS
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (is_active = true OR donor_id = auth.uid());

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update own listings"
  ON listings FOR UPDATE USING (auth.uid() = donor_id);

CREATE POLICY "Donors can delete own listings"
  ON listings FOR DELETE USING (auth.uid() = donor_id);

-- PLANT_LIBRARY
CREATE POLICY "Public can view plant library entries"
  ON plant_library FOR SELECT USING (true);

CREATE POLICY "Users can manage own plant library"
  ON plant_library FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plant library"
  ON plant_library FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plant library"
  ON plant_library FOR DELETE USING (auth.uid() = user_id);

-- CONVERSATIONS
CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- MESSAGES
CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

CREATE POLICY "Recipient can update message status"
  ON messages FOR UPDATE
  USING (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

-- FOLLOWS
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- PUSH_SUBSCRIPTIONS
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. Functions / RPCs
-- ---------------------------------------------------------------------------

-- get_listings_in_bounds
CREATE OR REPLACE FUNCTION get_listings_in_bounds(
  north DOUBLE PRECISION,
  south DOUBLE PRECISION,
  east DOUBLE PRECISION,
  west DOUBLE PRECISION,
  filter_species TEXT[] DEFAULT NULL,
  filter_sizes listing_size[] DEFAULT NULL,
  filter_radius_km DOUBLE PRECISION DEFAULT NULL,
  center_lat DOUBLE PRECISION DEFAULT NULL,
  center_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  donor_id UUID,
  species_name TEXT,
  size listing_size,
  description TEXT,
  photos TEXT[],
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address_city TEXT,
  donor_username TEXT,
  donor_avatar TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE
AS $$
  SELECT
    l.id,
    l.donor_id,
    l.species_name,
    l.size,
    l.description,
    l.photos,
    ST_Y(l.location_public::geometry) AS lat,
    ST_X(l.location_public::geometry) AS lng,
    l.address_city,
    p.username AS donor_username,
    p.avatar_url AS donor_avatar,
    l.created_at
  FROM listings l
  JOIN profiles p ON p.id = l.donor_id
  WHERE l.is_active = true
    AND ST_Intersects(
      l.location_public,
      ST_MakeEnvelope(west, south, east, north, 4326)::geography
    )
    AND (filter_species IS NULL OR l.species_name = ANY(filter_species))
    AND (filter_sizes IS NULL OR l.size = ANY(filter_sizes))
    AND (
      filter_radius_km IS NULL
      OR center_lat IS NULL
      OR center_lng IS NULL
      OR ST_DWithin(
        l.location_public,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        filter_radius_km * 1000
      )
    )
  ORDER BY l.created_at DESC
  LIMIT 500;
$$;

-- get_or_create_conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  other_user_id UUID,
  for_listing_id UUID
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  conv_id UUID;
  current_user_id UUID := auth.uid();
  p_a UUID;
  p_b UUID;
BEGIN
  IF current_user_id < other_user_id THEN
    p_a := current_user_id;
    p_b := other_user_id;
  ELSE
    p_a := other_user_id;
    p_b := current_user_id;
  END IF;

  SELECT c.id INTO conv_id
  FROM conversations c
  WHERE c.participant_a = p_a
    AND c.participant_b = p_b
    AND c.listing_id = for_listing_id;

  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_a, participant_b, listing_id)
    VALUES (p_a, p_b, for_listing_id)
    RETURNING conversations.id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$;

-- get_user_conversations
CREATE OR REPLACE FUNCTION get_user_conversations()
RETURNS TABLE (
  conversation_id UUID,
  listing_id UUID,
  listing_species TEXT,
  listing_photo TEXT,
  listing_size listing_size,
  other_user_id UUID,
  other_username TEXT,
  other_avatar TEXT,
  last_message_content TEXT,
  last_message_type message_type,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
)
LANGUAGE sql STABLE
AS $$
  WITH user_convos AS (
    SELECT c.*,
      CASE
        WHEN c.participant_a = auth.uid() THEN c.participant_b
        ELSE c.participant_a
      END AS other_id
    FROM conversations c
    WHERE c.participant_a = auth.uid() OR c.participant_b = auth.uid()
  ),
  last_msgs AS (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.content,
      m.type,
      m.created_at
    FROM messages m
    WHERE m.conversation_id IN (SELECT uc.id FROM user_convos uc)
    ORDER BY m.conversation_id, m.created_at DESC
  ),
  unreads AS (
    SELECT m.conversation_id, COUNT(*) AS cnt
    FROM messages m
    WHERE m.conversation_id IN (SELECT uc.id FROM user_convos uc)
      AND m.sender_id <> auth.uid()
      AND m.status <> 'read'
    GROUP BY m.conversation_id
  )
  SELECT
    uc.id AS conversation_id,
    uc.listing_id,
    l.species_name AS listing_species,
    l.photos[1] AS listing_photo,
    l.size AS listing_size,
    uc.other_id AS other_user_id,
    p.username AS other_username,
    p.avatar_url AS other_avatar,
    lm.content AS last_message_content,
    lm.type AS last_message_type,
    lm.created_at AS last_message_at,
    COALESCE(u.cnt, 0) AS unread_count
  FROM user_convos uc
  LEFT JOIN last_msgs lm ON lm.conversation_id = uc.id
  LEFT JOIN unreads u ON u.conversation_id = uc.id
  LEFT JOIN profiles p ON p.id = uc.other_id
  LEFT JOIN listings l ON l.id = uc.listing_id
  ORDER BY COALESCE(lm.created_at, uc.created_at) DESC;
$$;

-- ---------------------------------------------------------------------------
-- 6. Triggers
-- ---------------------------------------------------------------------------

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_listings
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_plant_library
  BEFORE UPDATE ON plant_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update conversation last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Sync plant library status with listings
CREATE OR REPLACE FUNCTION sync_plant_status_on_listing_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.plant_library_id IS NOT NULL THEN
    UPDATE plant_library SET status = 'for_donation' WHERE id = NEW.plant_library_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false AND NEW.plant_library_id IS NOT NULL THEN
    UPDATE plant_library SET status = 'donated' WHERE id = NEW.plant_library_id;
  ELSIF TG_OP = 'DELETE' AND OLD.plant_library_id IS NOT NULL THEN
    UPDATE plant_library SET status = 'collection' WHERE id = OLD.plant_library_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_plant_status
  AFTER INSERT OR UPDATE OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION sync_plant_status_on_listing_change();

-- ---------------------------------------------------------------------------
-- 7. Realtime
-- ---------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
