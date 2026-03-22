-- Helper to extract lat/lng from a listing for edit purposes
CREATE OR REPLACE FUNCTION get_listing_coords(p_listing_id UUID)
RETURNS TABLE(lat DOUBLE PRECISION, lng DOUBLE PRECISION) AS $$
  SELECT
    ST_Y(location_exact::geometry) AS lat,
    ST_X(location_exact::geometry) AS lng
  FROM listings
  WHERE id = p_listing_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
