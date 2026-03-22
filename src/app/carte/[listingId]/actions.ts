"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteListing(listingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("donor_id, photos")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) throw new Error("Annonce introuvable");
  if (listing.donor_id !== user.id) throw new Error("Non autorisé");

  const prefix = `${user.id}/${listingId}`;
  const { data: files } = await supabase.storage
    .from("listings")
    .list(prefix);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${prefix}/${f.name}`);
    await supabase.storage.from("listings").remove(paths);
  }

  const { error: deleteError } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId);

  if (deleteError) throw new Error(`Échec de la suppression : ${deleteError.message}`);

  redirect("/carte");
}
