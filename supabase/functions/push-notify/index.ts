import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@bouture.com";

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

async function importVapidKeys() {
  const rawPublicBytes = base64UrlDecode(VAPID_PUBLIC_KEY);
  const rawPrivateBytes = base64UrlDecode(VAPID_PRIVATE_KEY);

  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: base64UrlEncode(rawPublicBytes.slice(1, 33)),
    y: base64UrlEncode(rawPublicBytes.slice(33, 65)),
    d: base64UrlEncode(rawPrivateBytes),
  };

  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createVapidAuthHeader(
  audience: string,
  privateKey: CryptoKey,
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: VAPID_SUBJECT,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    encoder.encode(unsigned),
  );

  const sigBytes = new Uint8Array(signature);
  const r = sigBytes.slice(0, 32);
  const s = sigBytes.slice(32, 64);
  const sigB64 = base64UrlEncode(new Uint8Array([...r, ...s]));

  return `vapid t=${unsigned}.${sigB64}, k=${VAPID_PUBLIC_KEY}`;
}

async function sendPushNotification(
  subscription: PushSubscriptionRow,
  payload: string,
  privateKey: CryptoKey,
): Promise<boolean> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const authorization = await createVapidAuthHeader(audience, privateKey);

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/octet-stream",
      TTL: "86400",
    },
    body: payload,
  });

  if (response.status === 404 || response.status === 410) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", subscription.endpoint);
  }

  return response.ok || response.status === 201;
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
    const payload = (await req.json()) as WebhookPayload;

    const record = payload.record;
    if (!record?.conversation_id || !record?.sender_id) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload: missing conversation_id or sender_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
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
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const conversation = conversationResult.data;
    const recipientId = conversation.participant_a === record.sender_id
      ? conversation.participant_b
      : conversation.participant_a;

    const senderName = senderResult.data?.username ?? "Quelqu'un";

    const title = `Nouveau message de ${senderName}`;
    const body = record.type === "image"
      ? "\u{1F4F7} Photo"
      : (record.content?.slice(0, 100) ?? "");
    const notifUrl = `/messages/${record.conversation_id}`;

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, keys_p256dh, keys_auth")
      .eq("user_id", recipientId);

    if (subError) {
      return new Response(
        JSON.stringify({ error: subError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No push subscriptions for recipient", recipientId }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const privateKey = await importVapidKeys();
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: "/icons/icon-192x192.png",
      url: notifUrl,
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub: PushSubscriptionRow) =>
        sendPushNotification(sub, notificationPayload, privateKey),
      ),
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value,
    ).length;

    return new Response(
      JSON.stringify({ sent, total: subscriptions.length }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
