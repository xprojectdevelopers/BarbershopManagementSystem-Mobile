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
    const { to, otp } = await req.json() as { to?: string; otp?: string };

    if (!to || !otp) {
      throw new Error("Missing required fields: to, otp");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email format");
    }

    // Fetch display name from customer_profiles
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile, error: profileError } = await supabase
      .from('customer_profiles')
      .select('display_name')
      .eq('email', to.toLowerCase())
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error("Failed to fetch user profile");
    }

    const displayName = profile?.display_name || "User";

    const subject = "MLV ST. Email Verification OTP";
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MLV ST. Email Verification OTP</title>
  <style>
    body {
      background-color: #ffffff;
      color: #000000;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 480px;
      margin: 40px auto;
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #000000;
      text-align: center;
      padding: 24px;
    }

    .header h1 {
      font-family: 'Oswald', sans-serif;
      color: #ffffff;
    }

    .logo {
      width: 150px;
      height: auto;
    }
    .content {
      padding: 30px;
      text-align: left;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #000000;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #333333;
      margin-bottom: 20px;
    }
    .otp-box {
      display: block;
      text-align: center;
      font-size: 26px;
      font-weight: bold;
      background-color: #000000;
      color: #ffffff;
      letter-spacing: 4px;
      padding: 16px;
      border-radius: 8px;
      margin: 20px auto;
      width: fit-content;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #777777;
      padding: 20px;
      border-top: 1px solid #ddd;
    }
    a {
      color: #000000;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MOLAVE STREET BARBERS</h1>
    </div>
    <div class="content">
      <h1>Email Verification</h1>
      <p>Hello ${displayName},</p>
      <p>Thank you for signing up with <strong>MLV ST.</strong>! To complete your registration, please use the One-Time Password (OTP) below to verify your email address:</p>

      <div class="otp-box">${otp}</div>

      <p>This code will expire in <strong>2 minutes</strong> for your security.</p>
      <p>If you didn’t create an account, please ignore this email — your email address will remain safe.</p>

      <p>Thank you for being part of the <strong>Molave Street Barbers</strong> community.</p>
    </div>
    <div class="footer">
      MLV ST. | <a href="https://molavestreetbarbers.vercel.app">molavestreetbarbers.vercel.app</a><br/>
      &copy; 2025 Molave Street Barbers. All rights reserved.
    </div>
  </div>
</body>
</html>`;

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "MLV ST.", email: "xprojectdevelopers2025@gmail.com" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      throw new Error(`Email service error: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("Missing") || message.includes("Invalid") ? 400 : 500;

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
    );
  }
});
