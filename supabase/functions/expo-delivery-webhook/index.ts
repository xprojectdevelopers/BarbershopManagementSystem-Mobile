import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log("🚀 Webhook triggered at:", new Date().toISOString());
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token, title, body } = await req.json();
    console.log("📱 Request received - Token:", token?.substring(0, 20) + "...", "Title:", title);

    if (!token || !title || !body) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: token, title, body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    if (!expoAccessToken) {
      return new Response(JSON.stringify({ success: false, error: "Missing EXPO_ACCESS_TOKEN" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const expo = new Expo({ accessToken: expoAccessToken, useFcmV1: true });
    console.log("⏱️ Expo client initialized at:", Date.now() - startTime, "ms");

    if (!Expo.isExpoPushToken(token)) {
      return new Response(JSON.stringify({ success: false, error: `Invalid token: ${token}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const messages: ExpoPushMessage[] = [
      {
        to: token,
        sound: "default",
        title,
        body,
        data: { title, body },
        priority: "high",
      },
    ];

    // Send push notification instantly
    const sendStartTime = Date.now();
    const tickets = await expo.sendPushNotificationsAsync(messages) as unknown[];
    const ticket = tickets[0] as { id: string; status: string; message?: string; details?: unknown };
    console.log("📬 Notification sent in:", Date.now() - sendStartTime, "ms");
    console.log("📬 Ticket:", ticket);

    const receiptId = ticket.id;

    if (ticket.status === "error") {
      return new Response(
        JSON.stringify({
          success: false,
          error: ticket.message,
          details: ticket.details,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Return immediately - no background processing for maximum speed

    const totalTime = Date.now() - startTime;
    console.log("✅ Response ready in:", totalTime, "ms");
    console.log("🚀 Webhook completed at:", new Date().toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        ticket,
        receiptId,
        message: "Push notification sent successfully",
        timing: {
          totalTime: totalTime + "ms"
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
