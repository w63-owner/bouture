import { createClient } from "../client";

export interface TransactionWithListings {
  id: string;
  giver_id: string;
  receiver_id: string;
  listing_id: string;
  offered_listing_id: string | null;
  conversation_id: string | null;
  status: string;
  giver_confirmed_at: string | null;
  receiver_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  listing: {
    id: string;
    species_name: string;
    photos: string[];
    donor_id: string;
  };
  offered_listing: {
    id: string;
    species_name: string;
    photos: string[];
    donor_id: string;
  } | null;
  giver: {
    username: string;
    avatar_url: string | null;
  };
  receiver: {
    username: string;
    avatar_url: string | null;
  };
}

export async function getTransactionByConversation(
  conversationId: string,
): Promise<TransactionWithListings | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      listing:listing_id (id, species_name, photos, donor_id),
      offered_listing:offered_listing_id (id, species_name, photos, donor_id),
      giver:giver_id (username, avatar_url),
      receiver:receiver_id (username, avatar_url)
    `,
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch transaction:", error);
    return null;
  }

  return data as unknown as TransactionWithListings | null;
}

export async function getUserActiveListings(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("id, species_name, size, photos, address_city, transaction_type")
    .eq("donor_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Échec du chargement des annonces : ${error.message}`);
  return data ?? [];
}
