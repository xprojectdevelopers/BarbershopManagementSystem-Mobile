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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("🔔 sendNotification edge function called");
  const startTime = Date.now();

  try {
    // Parse request body
    const body: NotificationRequest = await req.json();
    const { 
      expoPushToken, 
      title, 
      message, 
      data, 
      sound = "default", 
      badge, 
      priority = "high", 
      channelId 
    } = body;

    console.log("📨 Request details:", {
      token: expoPushToken?.substring(0, 20) + "...",
      title,
      message: message?.substring(0, 50) + "...",
      hasData: !!data
    });

    // Validate required fields
    if (!expoPushToken || !title || !message) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: expoPushToken, title, and message are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Check Expo access token
    const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    if (!expoAccessToken) {
      console.error("❌ EXPO_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: EXPO_ACCESS_TOKEN not set" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Validate Expo push token format
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error("❌ Invalid Expo push token format:", expoPushToken);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid Expo push token format" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    console.log("✅ Input validation passed");

    // Initialize Expo SDK
    const expo = new Expo({ 
      accessToken: expoAccessToken,
      useFcmV1: true // Use latest FCM version
    });

    // Prepare notification message
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

    console.log("📤 Sending push notification via Expo...");

    // Send notification
    const sendStartTime = Date.now();
    const tickets = await expo.sendPushNotificationsAsync(messages);
    const sendTime = Date.now() - sendStartTime;
    
    const ticket = tickets[0] as { 
      id: string; 
      status: string; 
      message?: string; 
      details?: unknown;
    };

    console.log("📬 Expo response:", {
      ticketId: ticket.id,
      status: ticket.status,
      sendTime: `${sendTime}ms`
    });

    // Handle Expo errors
    if (ticket.status === "error") {
      console.error("❌ Expo returned error:", {
        error: ticket.message,
        details: ticket.details
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: ticket.message || "Failed to send notification",
          details: ticket.details
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Success response
    const totalTime = Date.now() - startTime;
    console.log(`✅ Notification sent successfully in ${totalTime}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        receiptId: ticket.id,
        ticket: {
          id: ticket.id,
          status: ticket.status
        },
        timing: {
          totalTime: `${totalTime}ms`,
          sendTime: `${sendTime}ms`
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (err) {
    // Handle unexpected errors
    const error = err as Error;
    console.error("💥 Unexpected error in sendNotification:", {
      error: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal server error"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});