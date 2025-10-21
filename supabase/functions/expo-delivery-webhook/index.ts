import { Expo, ExpoPushMessage, ExpoPushSuccessTicket } from "expo-server-sdk";
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token, title, body } = await req.json();

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

    // Send push notification
    const [ticket] = await expo.sendPushNotificationsAsync(messages);
    console.log("📬 Ticket:", ticket);

    const receiptId = (ticket as ExpoPushSuccessTicket).id;

    // Store initial send log with timestamp
    const { error: insertError } = await supabase.from("notification_logs").insert({
      expo_receipt_id: receiptId,
      status: ticket.status === "ok" ? "sent" : "error",
      device_token: token,
      message: body,
      details: ticket,
      sent_at: new Date().toISOString(),
    });

    if (insertError) console.error("Error saving initial log:", insertError);

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

    // Wait a few seconds for delivery receipt
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check delivery receipt
    const receiptIdLog = [receiptId];
    const receipts = await expo.getPushNotificationReceiptsAsync(receiptIdLog);
    console.log("📬 Receipts:", receipts);

    let deliveryStatus = "unknown";
    if (receipts[receiptId]) {
      const receipt = receipts[receiptId];
      if (receipt.status === "ok") {
        deliveryStatus = "delivered";
      } else {
        deliveryStatus = "failed";
        console.error("Delivery failed:", receipt.message, receipt.details);
      }
    } else {
      deliveryStatus = "pending"; // Receipt not yet available
    }

    // Update log with delivery status
    const { error: updateError } = await supabase
      .from("notification_logs")
      .update({
        delivery_status: deliveryStatus,
        delivered_at: deliveryStatus === "delivered" ? new Date().toISOString() : null,
      })
      .eq("expo_receipt_id", receiptId);

    if (updateError) console.error("Error updating delivery status:", updateError);

    return new Response(
      JSON.stringify({
        success: true,
        ticket,
        receiptId,
        deliveryStatus,
        message: "Push notification sent successfully",
        info: {
          note: "Delivery status updated in logs",
          expectedDelivery: "Within a few seconds",
        },
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
