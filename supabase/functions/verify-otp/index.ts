import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email, otp } = await req.json() as { email?: string; otp?: string };

    if (!email || !otp) {
      throw new Error("Missing email or OTP");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      throw new Error("Invalid OTP format");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Query for the OTP record
    const { data: otpRecord, error: queryError } = await supabase
      .from("email_verify_otps")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp", otp)
      .single();

    if (queryError || !otpRecord) {
      throw new Error("Invalid OTP");
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);

    if (now > expiresAt) {
      // Delete expired OTP
      await supabase
        .from("email_verify_otps")
        .delete()
        .eq("email", email.toLowerCase())
        .eq("otp", otp);

      throw new Error("OTP has expired");
    }

    // OTP is valid, delete it (one-time use)
    const { error: deleteError } = await supabase
      .from("email_verify_otps")
      .delete()
      .eq("email", email.toLowerCase())
      .eq("otp", otp);

    if (deleteError) {
      console.error("Error deleting OTP:", deleteError);
      // Don't throw error here, as verification was successful
    }

    // ✅ OTP verified successfully
    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP verified successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
