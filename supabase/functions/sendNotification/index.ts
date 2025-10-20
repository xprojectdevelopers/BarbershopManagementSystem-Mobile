// supabase/functions/send-push/index.ts
import { Expo, ExpoPushMessage, ExpoPushErrorTicket, ExpoPushSuccessTicket } from "expo-server-sdk";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🧩 Initialize Supabase
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface NotificationRequest {
  expoPushToken: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  priority?: "default" | "normal" | "high";
  channelId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body: NotificationRequest = await req.json();
    const { expoPushToken, title, message, data, sound = "default", badge, priority = "high", channelId } = body;

    console.log("📨 NEW NOTIFICATION REQUEST");
    console.log("🎯 Target Token:", expoPushToken);
    console.log("📋 Title:", title);
    console.log("💬 Message:", message);

    if (!expoPushToken || !title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: expoPushToken, title, message" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    if (!expoAccessToken)
      return new Response(JSON.stringify({ success: false, error: "Missing EXPO_ACCESS_TOKEN" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });

    const expo = new Expo({ accessToken: expoAccessToken, useFcmV1: true });

    if (!Expo.isExpoPushToken(expoPushToken))
      return new Response(JSON.stringify({ success: false, error: `Invalid token: ${expoPushToken}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });

    const messages: ExpoPushMessage[] = [
      {
        to: expoPushToken,
        sound,
        title,
        body: message,
        data: data || {},
        priority,
        badge,
        channelId: channelId || "default",
      },
    ];

    // 🟢 Send instantly — not queued manually
    const [ticket] = await expo.sendPushNotificationsAsync(messages);
    console.log("📬 Ticket:", ticket);

    // 🧾 Log immediately in Supabase
    const sent_at = new Date().toISOString();
    await supabase.from("notification_logs").insert([
      {
        device_token: expoPushToken,
        message,
        status: ticket.status === "ok" ? "sent" : "error",
        details: ticket,
        sent_at,
      },
    ]);

    if (ticket.status === "error") {
      const errorTicket = ticket as ExpoPushErrorTicket;
      console.error("❌ Expo Error:", errorTicket.details);
      return new Response(
        JSON.stringify({
          success: false,
          error: errorTicket.message,
          details: errorTicket.details,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const successTicket = ticket as ExpoPushSuccessTicket;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Push sent instantly ⚡",
        receiptId: successTicket.id,
        sent_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("💥 ERROR:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
