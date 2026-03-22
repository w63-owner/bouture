import Link from "next/link";
import { timeAgo } from "@/lib/utils/time-ago";

interface ConversationRowProps {
  conversationId: string;
  otherUsername: string | null;
  otherAvatar: string | null;
  lastMessageContent: string | null;
  lastMessageType: string | null;
  lastMessageAt: string | null;
  listingSpecies: string | null;
  unreadCount: number;
}

export function ConversationRow({
  conversationId,
  otherUsername,
  otherAvatar,
  lastMessageContent,
  lastMessageType,
  lastMessageAt,
  listingSpecies,
  unreadCount,
}: ConversationRowProps) {
  const username = otherUsername ?? "Utilisateur";
  const initial = username.charAt(0).toUpperCase();

  let snippet = "Nouvelle conversation";
  if (lastMessageType === "image") {
    snippet = "📷 Photo";
  } else if (lastMessageContent) {
    snippet = lastMessageContent;
  }

  return (
    <Link
      href={`/messages/${conversationId}`}
      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-neutral-100/60 active:bg-neutral-100"
    >
      {otherAvatar ? (
        <img
          src={otherAvatar}
          alt={username}
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-neutral-100"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold ring-2 ring-neutral-100">
          {initial}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`text-sm truncate ${unreadCount > 0 ? "font-bold text-neutral-900" : "font-medium text-neutral-900"}`}
          >
            {username}
          </span>
          {lastMessageAt && (
            <span className="shrink-0 text-xs text-neutral-600">
              {timeAgo(lastMessageAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="min-w-0 flex-1">
            {listingSpecies && (
              <span className="text-xs text-primary font-medium">
                {listingSpecies}
                {" · "}
              </span>
            )}
            <span
              className={`text-sm truncate ${unreadCount > 0 ? "font-medium text-neutral-900" : "text-neutral-600"}`}
            >
              {snippet}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
