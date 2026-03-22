import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@bouture.app",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

interface WebhookPayload {
  type: "INSERT";
  table: string;
  schema: string;
  record: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    type: "text" | "image";
    image_url: string | null;
  };
}

interface PushSubscriptionRow {
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { record } = (await req.json()) as WebhookPayload;

    if (!record?.conversation_id || !record?.sender_id) {
      return Response.json(
        { error: "Invalid webhook payload: missing conversation_id or sender_id" },
        { status: 400 },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const [conversationResult, senderResult] = await Promise.all([
      supabase
        .from("conversations")
        .select("participant_a, participant_b")
        .eq("id", record.conversation_id)
        .single(),
      supabase
        .from("profiles")
        .select("username")
        .eq("id", record.sender_id)
        .single(),
    ]);

    if (conversationResult.error || !conversationResult.data) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    const { participant_a, participant_b } = conversationResult.data;
    const recipientId =
      participant_a === record.sender_id ? participant_b : participant_a;

    const senderName = senderResult.data?.username ?? "Quelqu'un";

    const notificationPayload = JSON.stringify({
      title: `Nouveau message de ${senderName}`,
      body:
        record.type === "image"
          ? "\u{1F4F7} Photo"
          : (record.content?.slice(0, 100) ?? ""),
      icon: "/icons/icon-192x192.png",
      url: `/messages/${record.conversation_id}`,
    });

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, keys_p256dh, keys_auth")
      .eq("user_id", recipientId);

    if (subError) {
      return Response.json({ error: subError.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({
        message: "No push subscriptions for recipient",
        recipientId,
      });
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub: PushSubscriptionRow) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        };

        try {
          await webpush.sendNotification(pushSubscription, notificationPayload);
          return true;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
          return false;
        }
      }),
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value,
    ).length;

    return Response.json({ sent, total: subscriptions.length });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
});
