-- V2: Échanges & Collection — Phase 1 Foundations
-- ENUMs, listings alteration, transactions table, RLS, functions & triggers

-- ============================================================================
-- 1. ENUMs
-- ============================================================================

CREATE TYPE transaction_type AS ENUM (
  'don_uniquement',
  'echange_uniquement',
  'les_deux'
);

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'cancelled',
  'giver_confirmed',
  'receiver_confirmed',
  'completed'
);

-- ============================================================================
-- 2. ALTER TABLE listings — add transaction_type column
-- ============================================================================

ALTER TABLE listings
  ADD COLUMN transaction_type transaction_type NOT NULL DEFAULT 'don_uniquement';

COMMENT ON COLUMN listings.transaction_type IS
  'Détermine si l''annonce accepte les dons, les échanges, ou les deux.';

-- ============================================================================
-- 3. Table transactions
-- ============================================================================

CREATE TABLE transactions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  giver_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  listing_id         UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  offered_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,

  conversation_id    UUID REFERENCES conversations(id) ON DELETE SET NULL,

  status             transaction_status NOT NULL DEFAULT 'pending',

  giver_confirmed_at    TIMESTAMPTZ,
  receiver_confirmed_at TIMESTAMPTZ,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT different_participants CHECK (giver_id <> receiver_id),
  CONSTRAINT valid_exchange CHECK (
    offered_listing_id IS NULL
    OR offered_listing_id <> listing_id
  )
);

CREATE INDEX idx_transactions_giver        ON transactions(giver_id);
CREATE INDEX idx_transactions_receiver     ON transactions(receiver_id);
CREATE INDEX idx_transactions_listing      ON transactions(listing_id);
CREATE INDEX idx_transactions_status       ON transactions(status);
CREATE INDEX idx_transactions_conversation ON transactions(conversation_id);

CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 4. RLS policies on transactions
-- ============================================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their transactions"
  ON transactions FOR SELECT
  USING (auth.uid() IN (giver_id, receiver_id));

CREATE POLICY "Authenticated users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    auth.uid() = receiver_id
    AND status = 'pending'
  );

CREATE POLICY "Giver can accept or reject pending transactions"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = giver_id
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('accepted', 'rejected')
  );

CREATE POLICY "Receiver can cancel pending transactions"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = receiver_id
    AND status = 'pending'
  )
  WITH CHECK (
    status = 'cancelled'
  );

CREATE POLICY "Giver can confirm giving"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = giver_id
    AND status = 'accepted'
  )
  WITH CHECK (
    status = 'giver_confirmed'
  );

CREATE POLICY "Receiver can confirm receiving after giver"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = receiver_id
    AND status = 'giver_confirmed'
  )
  WITH CHECK (
    status = 'completed'
  );

-- ============================================================================
-- 5. Function & trigger: handle_transaction_completion
--    On transition to 'completed':
--      - Insert plant into receiver's plant_library
--      - If exchange, insert offered plant into giver's plant_library
--      - Deactivate the listing(s)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_transaction_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_listing RECORD;
  v_offered RECORD;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  NEW.receiver_confirmed_at := NOW();

  SELECT species_name, species_id, photos
    INTO v_listing
    FROM listings WHERE id = NEW.listing_id;

  INSERT INTO plant_library (user_id, species_name, species_id, photos, status, notes)
  VALUES (
    NEW.receiver_id,
    v_listing.species_name,
    v_listing.species_id,
    ARRAY[v_listing.photos[1]],
    'collection',
    'Reçue via échange sur bouture.app'
  )
  ON CONFLICT DO NOTHING;

  UPDATE listings SET is_active = false WHERE id = NEW.listing_id;

  IF NEW.offered_listing_id IS NOT NULL THEN
    SELECT species_name, species_id, photos
      INTO v_offered
      FROM listings WHERE id = NEW.offered_listing_id;

    INSERT INTO plant_library (user_id, species_name, species_id, photos, status, notes)
    VALUES (
      NEW.giver_id,
      v_offered.species_name,
      v_offered.species_id,
      ARRAY[v_offered.photos[1]],
      'collection',
      'Reçue via échange sur bouture.app'
    )
    ON CONFLICT DO NOTHING;

    UPDATE listings SET is_active = false WHERE id = NEW.offered_listing_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_completed
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transaction_completion();

-- ============================================================================
-- 6. Function & trigger: notify_transaction_completion
--    Sends an async HTTP POST to the push-notify Edge Function via pg_net.
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_transaction_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.edge_function_url') || '/push-notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'transaction_completed',
        'receiver_id', NEW.receiver_id,
        'giver_id', NEW.giver_id,
        'listing_id', NEW.listing_id,
        'transaction_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_completed_notify
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_transaction_completion();

-- ============================================================================
-- 7. Replace get_listings_in_bounds — add p_species_id + return transaction_type
-- ============================================================================

CREATE OR REPLACE FUNCTION get_listings_in_bounds(
  north              DOUBLE PRECISION,
  south              DOUBLE PRECISION,
  east               DOUBLE PRECISION,
  west               DOUBLE PRECISION,
  filter_species     TEXT[]         DEFAULT NULL,
  filter_sizes       listing_size[] DEFAULT NULL,
  filter_radius_km   DOUBLE PRECISION DEFAULT NULL,
  center_lat         DOUBLE PRECISION DEFAULT NULL,
  center_lng         DOUBLE PRECISION DEFAULT NULL,
  p_species_id       INT            DEFAULT NULL
)
RETURNS TABLE (
  id               UUID,
  donor_id         UUID,
  species_name     TEXT,
  size             listing_size,
  description      TEXT,
  photos           TEXT[],
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  address_city     TEXT,
  donor_username   TEXT,
  donor_avatar     TEXT,
  created_at       TIMESTAMPTZ,
  transaction_type transaction_type
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
    l.created_at,
    l.transaction_type
  FROM listings l
  JOIN profiles p ON p.id = l.donor_id
  WHERE l.is_active = true
    AND ST_Intersects(
      l.location_public,
      ST_MakeEnvelope(west, south, east, north, 4326)::geography
    )
    AND (filter_species IS NULL OR l.species_name = ANY(filter_species))
    AND (filter_sizes   IS NULL OR l.size = ANY(filter_sizes))
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
    AND (p_species_id IS NULL OR l.species_id = p_species_id)
  ORDER BY l.created_at DESC
  LIMIT 500;
$$;
