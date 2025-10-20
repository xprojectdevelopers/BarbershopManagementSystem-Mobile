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

    // 1️⃣ Send push notification via Expo
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: token,
        title,
        body,
        data: { title, body },
      }),
    });

    const result = await expoResponse.json();
    const ticket = result.data?.[0] || {};
    const receiptId = ticket.id;

    // 2️⃣ Store send log with timestamp
    const { error } = await supabase.from("notification_logs").insert({
      expo_receipt_id: receiptId,
      status: "queued",
      device_token: token,
      message: body,
      details: result,
      sent_at: new Date().toISOString(), // 👈 Add timestamp
    });

    if (error) console.error("Error saving log:", error);

    return new Response(
      JSON.stringify({
        success: true,
        ticket,
        receiptId,
        message: "Push notification queued successfully",
        info: {
          note: "Check server logs for delivery status",
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
