"use client";

import { useChatRealtime } from "@/lib/hooks/use-chat-realtime";
import { useMarkAsRead } from "@/lib/hooks/use-mark-as-read";
import { useChatPresence } from "@/lib/hooks/use-chat-presence";
import { ChatHeader } from "./chat-header";
import { ContextCard } from "./context-card";
import { MessageBubble } from "./message-bubble";
import { DateSeparator } from "./date-separator";
import { TypingBubble } from "./typing-bubble";
import { MessageInput } from "./message-input";
import type { Tables } from "@/lib/types/database.types";

type Message = Tables<"messages">;

interface ChatViewProps {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  listing: {
    id: string;
    species_name: string;
    size: string;
    photos: string[];
    is_active: boolean;
  } | null;
  initialMessages: Message[];
}

function isSameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function ChatView({
  conversationId,
  currentUserId,
  otherUser,
  listing,
  initialMessages,
}: ChatViewProps) {
  const { messages, bottomRef } = useChatRealtime(
    conversationId,
    initialMessages,
  );

  useMarkAsRead(conversationId, currentUserId, messages);

  const { isOtherUserTyping, isOtherUserOnline, setTyping } = useChatPresence(
    conversationId,
    currentUserId,
  );

  return (
    <div className="flex h-dvh flex-col bg-white">
      <ChatHeader
        username={otherUser.username}
        avatarUrl={otherUser.avatar_url}
        isOnline={isOtherUserOnline}
      />

      {listing && (
        <ContextCard
          listingId={listing.id}
          speciesName={listing.species_name}
          size={listing.size}
          photo={listing.photos[0] ?? null}
          isActive={listing.is_active}
        />
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {messages.map((msg, i) => {
          const showDate =
            i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);
          return (
            <div key={msg.id}>
              {showDate && <DateSeparator date={msg.created_at} />}
              <MessageBubble
                content={msg.content}
                type={msg.type}
                imageUrl={msg.image_url}
                isMine={msg.sender_id === currentUserId}
                timestamp={msg.created_at}
                status={msg.status}
              />
            </div>
          );
        })}
        {isOtherUserTyping && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      <MessageInput conversationId={conversationId} onTyping={setTyping} />
    </div>
  );
}
