import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 🖤 Branded HTML Email Template for MLV ST. - Email Change
const htmlContent = (otp: string, displayName: string, newEmail: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MLV ST. Email Change Verification</title>
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
      margin: 0;
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
    .security-notice {
      background-color: #fff5f5;
      border-left: 4px solid #ff4444;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .security-notice p {
      margin: 0;
      font-size: 14px;
      color: #cc0000;
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
      <h1>Email Address Change Request</h1>
      <p>Hello ${displayName},</p>
      <p>We received a request to change your email address to <strong>${newEmail}</strong> for your <strong>MLV ST.</strong> account. Please use the One-Time Password (OTP) below to verify and complete this email change:</p>

      <div class="otp-box">${otp}</div>

      <p>⚠️ This code will expire in <strong>2 minutes</strong> for your security.</p>

      <div class="security-notice">
        <p><strong>🔒 Security Alert:</strong> If you didn't request this email change, please ignore this message and contact our support team immediately to secure your account.</p>
      </div>

      <p>Thank you for being part of the <strong>Molave Street Barbers</strong> community.</p>
    </div>
    <div class="footer">
      💈 MLV ST. | <a href="https://molavestreetbarbers.vercel.app">molavestreetbarbers.vercel.app</a><br/>
      &copy; 2025 Molave Street Barbers. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1️⃣ Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // 2️⃣ Parse request
    const { newEmail } = await req.json() as { newEmail?: string };
    if (!newEmail) throw new Error("Missing 'newEmail' field");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) throw new Error("Invalid email format");

    // 3️⃣ Get current user profile
    const { data: currentUser, error: userError } = await supabase
      .from("customer_profiles")
      .select("email, display_name")
      .eq("id", user.id)
      .single();

    if (userError || !currentUser) {
      throw new Error("User profile not found");
    }

    // 4️⃣ Check if new email is the same as current
    if (newEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      return new Response(
        JSON.stringify({ success: false, error: "New email is the same as current email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 5️⃣ Check if new email is already taken by another user
    const { data: existingUser } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("email", newEmail.toLowerCase())
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: "Email already in use" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    // 6️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    // 7️⃣ Save OTP with user_id as key (not email)
    const { error: dbError } = await supabase
      .from("email_change_otps")
      .upsert({
        user_id: user.id,
        new_email: newEmail.toLowerCase(),
        otp,
        created_at: new Date().toISOString(),
        expires_at: expiresAt
      });

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 8️⃣ Send Email to CURRENT email (not new email)
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
        to: [{ email: currentUser.email }],
        subject: "🔐 MLV ST. – Verify Your Email Change (OTP Inside)",
        htmlContent: htmlContent(otp, currentUser.display_name || "User", newEmail),
      }),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      throw new Error(`Email service error: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent to your current email address",
        sentTo: currentUser.email 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("Unauthorized") || message.includes("authorization") ? 401 : 400;

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
    );
  }
});