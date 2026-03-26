import { createClient } from "../client";
import type { Database } from "@/lib/types/database.types";

type TransactionStatus = Database["public"]["Enums"]["transaction_status"];

export async function createTransaction(
  giverId: string,
  receiverId: string,
  listingId: string,
  offeredListingId?: string,
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      giver_id: giverId,
      receiver_id: receiverId,
      listing_id: listingId,
      offered_listing_id: offeredListingId ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Échec de la création de transaction : ${error.message}`);
  return data.id;
}

export async function updateTransactionStatus(
  transactionId: string,
  newStatus: TransactionStatus,
): Promise<void> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = { status: newStatus };

  if (newStatus === "giver_confirmed") {
    updateData.giver_confirmed_at = new Date().toISOString();
  }
  if (newStatus === "completed") {
    updateData.receiver_confirmed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", transactionId);

  if (error) throw new Error(`Échec de la mise à jour : ${error.message}`);
}

export async function linkTransactionToConversation(
  transactionId: string,
  conversationId: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("transactions")
    .update({ conversation_id: conversationId })
    .eq("id", transactionId);

  if (error) throw new Error(`Échec du lien conversation : ${error.message}`);
}
