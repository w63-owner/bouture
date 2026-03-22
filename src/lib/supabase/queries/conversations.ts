import { createClient } from "@/lib/supabase/server";

export async function getUserConversations() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_user_conversations");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getConversationMessages(
  conversationId: string,
  limit = 50,
  offset = 0,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getConversationWithDetails(conversationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      listing:listing_id (
        id,
        species_name,
        size,
        photos,
        is_active
      )
    `,
    )
    .eq("id", conversationId)
    .single();

  if (error || !conversation) return null;

  const isParticipant =
    conversation.participant_a === user.id ||
    conversation.participant_b === user.id;
  if (!isParticipant) return null;

  const otherUserId =
    conversation.participant_a === user.id
      ? conversation.participant_b
      : conversation.participant_a;

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", otherUserId)
    .single();

  return {
    conversation,
    listing: conversation.listing as {
      id: string;
      species_name: string;
      size: string;
      photos: string[];
      is_active: boolean;
    } | null,
    otherUser: {
      id: otherUserId,
      username: otherProfile?.username ?? "Utilisateur",
      avatar_url: otherProfile?.avatar_url ?? null,
    },
    currentUserId: user.id,
  };
}
