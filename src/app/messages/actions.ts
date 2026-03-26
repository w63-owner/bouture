"use server";

import { createClient } from "@/lib/supabase/server";

const SIZE_LABELS: Record<string, string> = {
  graine: "Graine",
  tubercule: "Tubercule",
  xs: "XS",
  s: "S",
  m: "M",
  l: "L",
  xl: "XL",
  xxl: "XXL",
};

export async function startConversation(
  donorId: string,
  listingId: string,
  speciesName: string,
  size: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  if (user.id === donorId) throw new Error("Vous ne pouvez pas vous contacter vous-même");

  const { data: conversationId, error } = await supabase.rpc(
    "get_or_create_conversation",
    { other_user_id: donorId, for_listing_id: listingId },
  );

  if (error || !conversationId) {
    throw new Error(error?.message ?? "Impossible de créer la conversation");
  }

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  if (count === 0) {
    const sizeLabel = SIZE_LABELS[size] ?? size;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: `Bonjour ! Je suis intéressé(e) par votre bouture de ${speciesName} (${sizeLabel}).`,
      type: "text",
    });
  }

  return conversationId as string;
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Le message ne peut pas être vide");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: trimmed,
    type: "text",
  });

  if (error) throw new Error(error.message);
}

export async function sendImageMessage(
  conversationId: string,
  imagePath: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  if (!imagePath) throw new Error("Chemin de l'image manquant");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    type: "image",
    image_url: imagePath,
  });

  if (error) throw new Error(error.message);
}

export async function proposeExchange(
  listingId: string,
  offeredListingId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("donor_id, species_name")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) throw new Error("Annonce introuvable");
  if (listing.donor_id === user.id) throw new Error("Vous ne pouvez pas échanger avec vous-même");

  const { data: offeredListing, error: offeredError } = await supabase
    .from("listings")
    .select("species_name, donor_id")
    .eq("id", offeredListingId)
    .single();

  if (offeredError || !offeredListing) throw new Error("Annonce offerte introuvable");
  if (offeredListing.donor_id !== user.id) throw new Error("Cette annonce ne vous appartient pas");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      giver_id: listing.donor_id,
      receiver_id: user.id,
      listing_id: listingId,
      offered_listing_id: offeredListingId,
      status: "pending",
    })
    .select("id")
    .single();

  if (txError) throw new Error(`Échec de la proposition : ${txError.message}`);

  const { data: conversationId, error: convError } = await supabase.rpc(
    "get_or_create_conversation",
    { other_user_id: listing.donor_id, for_listing_id: listingId },
  );

  if (convError || !conversationId) {
    throw new Error(convError?.message ?? "Impossible de créer la conversation");
  }

  await supabase
    .from("transactions")
    .update({ conversation_id: conversationId })
    .eq("id", transaction.id);

  const username = profile?.username ?? "Quelqu'un";
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: `🔄 ${username} propose un échange : ${offeredListing.species_name} contre ${listing.species_name}`,
    type: "text",
  });

  return conversationId as string;
}
