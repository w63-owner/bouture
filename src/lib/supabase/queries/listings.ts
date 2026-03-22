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

export async function getListingForEdit(listingId: string, userId: string) {
  const supabase = createClient();

  const [listingRes, coordsRes] = await Promise.all([
    supabase
      .from("listings")
      .select("id, donor_id, species_name, species_id, size, description, photos, address_city, is_active")
      .eq("id", listingId)
      .eq("donor_id", userId)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)("get_listing_coords", { p_listing_id: listingId }).single() as Promise<{
      data: { lat: number; lng: number } | null;
      error: unknown;
    }>,
  ]);

  if (listingRes.error || !listingRes.data) return null;

  return {
    ...listingRes.data,
    lat: coordsRes.data?.lat ?? 0,
    lng: coordsRes.data?.lng ?? 0,
  };
}

export async function getUserListings(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("id, species_name, size, photos, is_active, address_city, created_at")
    .eq("donor_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user listings:", error);
    throw error;
  }

  return data ?? [];
}
