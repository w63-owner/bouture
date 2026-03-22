import type { Database } from "./database.types";

export type ListingSize = Database["public"]["Enums"]["listing_size"];

export interface ListingInBounds {
  id: string;
  donor_id: string;
  species_name: string;
  size: ListingSize;
  description: string | null;
  photos: string[];
  lat: number;
  lng: number;
  address_city: string | null;
  donor_username: string;
  donor_avatar: string | null;
  created_at: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ListingFilters {
  species?: string[];
  sizes?: ListingSize[];
  radiusKm?: number;
  centerLat?: number;
  centerLng?: number;
}
