// supabase/functions/send-push/index.ts
import { Expo, ExpoPushMessage, ExpoPushErrorTicket } from "expo-server-sdk";
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
  const startTime = Date.now();
  console.log("🚀 SendNotification function triggered at:", new Date().toISOString());
  
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body: NotificationRequest = await req.json();
    const { expoPushToken, title, message, data, sound = "default", badge, priority = "high", channelId } = body;

    console.log("📨 NEW NOTIFICATION REQUEST");
    console.log("🎯 Target Token:", expoPushToken?.substring(0, 20) + "...");
    console.log("📋 Title:", title);
    console.log("💬 Message:", message);
    console.log("⏱️ Request parsed in:", Date.now() - startTime, "ms");

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
    console.log("⏱️ Expo client initialized in:", Date.now() - startTime, "ms");

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

    // 🟢 Send instantly with minimal timeout
    const sendStartTime = Date.now();
    const tickets = await expo.sendPushNotificationsAsync(messages) as unknown[];
    const ticket = tickets[0] as { id: string; status: string; message?: string; details?: unknown };
    console.log("📬 Notification sent in:", Date.now() - sendStartTime, "ms");
    console.log("📬 Ticket:", ticket);

    // 🧾 Log asynchronously to avoid blocking response
    const sent_at = new Date().toISOString();
    const receiptId = ticket.id;
    
    // Don't await database insert - do it asynchronously
    (async () => {
      try {
        await supabase.from("notification_logs").insert([
          {
            expo_receipt_id: receiptId,
            device_token: expoPushToken,
            message,
            status: ticket.status === "ok" ? "sent" : "error",
            details: ticket,
            sent_at,
          },
        ]);
        console.log("💾 Database log saved asynchronously");
      } catch (error) {
        console.error("❌ Database log error:", error);
      }
    })();

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

    // Return immediately - no background processing to keep response fast

    const totalTime = Date.now() - startTime;
    console.log("✅ Response ready in:", totalTime, "ms");
    console.log("🚀 SendNotification completed at:", new Date().toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        message: "Push sent instantly ⚡",
        receiptId: receiptId,
        sent_at,
        timing: {
          totalTime: totalTime + "ms",
          sentAt: sent_at
        }
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
