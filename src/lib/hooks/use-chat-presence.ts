"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useChatPresence(
  conversationId: string,
  currentUserId: string,
) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase.channel(`presence:${conversationId}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        let otherOnline = false;
        let otherTyping = false;

        for (const [key, presences] of Object.entries(state)) {
          if (key === currentUserId) continue;
          otherOnline = true;
          if (
            Array.isArray(presences) &&
            presences.some((p: Record<string, unknown>) => p.typing === true)
          ) {
            otherTyping = true;
          }
        }

        setIsOtherUserOnline(otherOnline);
        setIsOtherUserTyping(otherTyping);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ typing: false });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const setTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    channelRef.current?.track({ typing: true });

    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.track({ typing: false });
    }, 3000);
  }, []);

  return { isOtherUserTyping, isOtherUserOnline, setTyping };
}
