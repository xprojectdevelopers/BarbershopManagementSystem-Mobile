import { Expo, ExpoPushMessage } from "expo-server-sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    if (!expoPushToken || !title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    if (!expoAccessToken) {
      return new Response(JSON.stringify({ success: false, error: "Server config error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }

    if (!Expo.isExpoPushToken(expoPushToken)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    const expo = new Expo({ accessToken: expoAccessToken });
    const messages: ExpoPushMessage[] = [{
      to: expoPushToken,
      sound,
      title,
      body: message,
      data: data || {},
      priority,
      badge,
      channelId: channelId || "default",
    }];

    const tickets = await expo.sendPushNotificationsAsync(messages) as unknown[];
    const ticket = tickets[0] as { id: string; status: string; message?: string; details?: unknown };

    if (ticket.status === "error") {
      return new Response(
        JSON.stringify({ success: false, error: "Send failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Ultra-fast response - no logging, no extra processing
    return new Response(
      JSON.stringify({
        success: true,
        receiptId: ticket.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
