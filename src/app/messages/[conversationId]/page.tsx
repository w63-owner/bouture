import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getConversationWithDetails,
  getConversationMessages,
} from "@/lib/supabase/queries/conversations";
import { ChatView } from "@/components/chat/chat-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}): Promise<Metadata> {
  const { conversationId } = await params;
  const data = await getConversationWithDetails(conversationId);
  if (!data) return { title: "Chat — bouture.app" };

  return {
    title: `Chat avec ${data.otherUser.username} — bouture.app`,
  };
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { conversationId } = await params;
  const data = await getConversationWithDetails(conversationId);
  if (!data) notFound();

  const messages = await getConversationMessages(conversationId);

  return (
    <ChatView
      conversationId={conversationId}
      currentUserId={data.currentUserId}
      otherUser={data.otherUser}
      listing={data.listing}
      initialMessages={messages}
    />
  );
}
