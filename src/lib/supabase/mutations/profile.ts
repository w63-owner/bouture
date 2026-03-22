import { createClient } from "../client";

export interface AddressData {
  address_city: string;
  address_lat: number;
  address_lng: number;
  address_street?: string;
  address_postal?: string;
  address_country?: string;
}

export async function updateAddress(
  userId: string,
  data: AddressData,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      address_city: data.address_city,
      address_lat: data.address_lat,
      address_lng: data.address_lng,
      address_street: data.address_street ?? null,
      address_postal: data.address_postal ?? null,
      address_country: data.address_country ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(`Mise à jour échouée : ${error.message}`);
}
