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
  plantLibraryId?: string;
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
    transaction_type: data.transaction_type,
    description: data.description || null,
    photos: allPhotos,
    location_exact: `SRID=4326;POINT(${data.address_lng} ${data.address_lat})`,
    location_public: `SRID=4326;POINT(${jittered.lng} ${jittered.lat})`,
    address_city: data.address_city,
    is_active: true,
    plant_library_id: options?.plantLibraryId ?? null,
  });

  if (error) throw new Error(`Failed to create listing: ${error.message}`);

  return { id: listingId, photos: allPhotos };
}

export interface UpdateListingResult {
  id: string;
  photos: string[];
}

export async function updateListing(
  userId: string,
  listingId: string,
  data: ListingFormData,
  existingPhotoUrls: string[],
): Promise<UpdateListingResult> {
  const supabase = createClient();

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("donor_id")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) throw new Error("Annonce introuvable");
  if (listing.donor_id !== userId) throw new Error("Non autorisé");

  const uploadedUrls =
    data.photos.length > 0
      ? await uploadListingPhotos(userId, listingId, data.photos)
      : [];

  const allPhotos = [...existingPhotoUrls, ...uploadedUrls];

  if (allPhotos.length === 0) {
    throw new Error("Au moins 1 photo est requise");
  }

  const jittered = jitterCoordinates(data.address_lat, data.address_lng, listingId);

  const { error } = await supabase
    .from("listings")
    .update({
      species_name: data.species_name,
      species_id: data.species_id,
      size: data.size,
      transaction_type: data.transaction_type,
      description: data.description || null,
      photos: allPhotos,
      location_exact: `SRID=4326;POINT(${data.address_lng} ${data.address_lat})`,
      location_public: `SRID=4326;POINT(${jittered.lng} ${jittered.lat})`,
      address_city: data.address_city,
    })
    .eq("id", listingId);

  if (error) throw new Error(`Échec de la mise à jour : ${error.message}`);

  return { id: listingId, photos: allPhotos };
}
