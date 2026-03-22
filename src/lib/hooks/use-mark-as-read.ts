"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database.types";

type Message = Tables<"messages">;

export function useMarkAsRead(
  conversationId: string,
  currentUserId: string,
  messages: Message[],
) {
  const supabase = createClient();
  const markedRef = useRef(new Set<string>());

  useEffect(() => {
    const unreadIds = messages
      .filter(
        (m) =>
          m.sender_id !== currentUserId &&
          m.status !== "read" &&
          !markedRef.current.has(m.id),
      )
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    unreadIds.forEach((id) => markedRef.current.add(id));

    supabase
      .from("messages")
      .update({ status: "read" })
      .in("id", unreadIds)
      .then();
  }, [messages, currentUserId, conversationId, supabase]);
}
