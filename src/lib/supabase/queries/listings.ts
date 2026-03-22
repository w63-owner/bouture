import { createClient } from "@/lib/supabase/client";
import type { MapBounds, ListingFilters, ListingInBounds } from "@/lib/types/listing";

export async function getListingsInBounds(
  bounds: MapBounds,
  filters?: ListingFilters,
): Promise<ListingInBounds[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_listings_in_bounds", {
    north: bounds.north,
    south: bounds.south,
    east: bounds.east,
    west: bounds.west,
    filter_species: filters?.species ?? null,
    filter_sizes: filters?.sizes ?? null,
    filter_radius_km: filters?.radiusKm ?? null,
    center_lat: filters?.centerLat ?? null,
    center_lng: filters?.centerLng ?? null,
  });

  if (error) {
    console.error("Failed to fetch listings in bounds:", error);
    throw error;
  }

  return (data ?? []) as ListingInBounds[];
}

export async function getListingById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles:donor_id (
        username,
        avatar_url,
        created_at
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch listing:", error);
    throw error;
  }

  return data;
}
