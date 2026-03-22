import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserConversations } from "@/lib/supabase/queries/conversations";
import { ConversationRow } from "@/components/chat/conversation-row";
import { EmptyConversations } from "@/components/chat/empty-conversations";

export const metadata = {
  title: "Messages — bouture.app",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const conversations = await getUserConversations();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-neutral-100 bg-white px-5 py-4">
          <h1 className="text-xl font-heading font-semibold text-neutral-900">
            Messages
          </h1>
        </header>
        <EmptyConversations />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="border-b border-neutral-100 px-5 py-4">
        <h1 className="text-xl font-heading font-semibold text-neutral-900">
          Messages
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
        {conversations.map((c) => (
          <ConversationRow
            key={c.conversation_id}
            conversationId={c.conversation_id}
            otherUsername={c.other_username}
            otherAvatar={c.other_avatar}
            lastMessageContent={c.last_message_content}
            lastMessageType={c.last_message_type}
            lastMessageAt={c.last_message_at}
            listingSpecies={c.listing_species}
            unreadCount={c.unread_count}
          />
        ))}
      </div>
    </div>
  );
}
