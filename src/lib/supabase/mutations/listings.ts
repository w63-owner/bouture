import { createClient } from "../client";
import { uploadListingPhotos } from "../storage";
import { jitterCoordinates } from "@/lib/utils/geo-jitter";
import type { ListingFormData } from "@/lib/schemas/listing";

export interface CreateListingResult {
  id: string;
  photos: string[];
}

export interface CreateListingOptions {
  existingPhotoUrls?: string[];
}

export async function createListing(
  userId: string,
  data: ListingFormData,
  options?: CreateListingOptions,
): Promise<CreateListingResult> {
  const supabase = createClient();
  const listingId = crypto.randomUUID();

  const uploadedUrls =
    data.photos.length > 0
      ? await uploadListingPhotos(userId, listingId, data.photos)
      : [];

  const allPhotos = [...(options?.existingPhotoUrls ?? []), ...uploadedUrls];

  const jittered = jitterCoordinates(
    data.address_lat,
    data.address_lng,
    listingId,
  );

  const { error } = await supabase.from("listings").insert({
    id: listingId,
    donor_id: userId,
    species_name: data.species_name,
    species_id: data.species_id,
    size: data.size,
    description: data.description || null,
    photos: allPhotos,
    location_exact: `SRID=4326;POINT(${data.address_lng} ${data.address_lat})`,
    location_public: `SRID=4326;POINT(${jittered.lng} ${jittered.lat})`,
    address_city: data.address_city,
    is_active: true,
  });

  if (error) throw new Error(`Failed to create listing: ${error.message}`);

  return { id: listingId, photos: allPhotos };
}
