"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleListingStatus(listingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("donor_id, is_active")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) throw new Error("Annonce introuvable");
  if (listing.donor_id !== user.id) throw new Error("Non autorisé");

  const { error } = await supabase
    .from("listings")
    .update({ is_active: !listing.is_active })
    .eq("id", listingId);

  if (error) throw new Error(`Échec du changement de statut : ${error.message}`);

  revalidatePath("/profil/annonces");

  return { is_active: !listing.is_active };
}
