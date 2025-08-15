import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "../../../supabase/adminClient";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    // console.log(email, password);

    
    // 1️⃣ Check user profile
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("id, is_verified, full_name, role")
      .ilike("email", email)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // 2️⃣ If NOT verified → resend link
    if (!profile.is_verified) {
      await supabaseAdmin
        .from("email_verification_tokens")
        .delete()
        .eq("user_id", profile.id);

      const token = uuidv4();
      const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await supabaseAdmin
        .from("email_verification_tokens")
        .insert([{ user_id: profile.id, token, expires_at }]);

      // ✅ Configure transporter
      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Control-Hub" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your Control-Hub Account (New Link)",
        html: `
          <h2>Hi ${profile.full_name},</h2>
          <p>You tried to log in, but your account isn't verified yet.</p>
          <p>Please verify your email using the new link below (valid for 1 hour):</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}" 
          target="_blank" style="padding:10px 20px;background:#5c52b5;color:#fff;border-radius:5px;text-decoration:none;">
          Verify Email
          </a>
        `,
      });

      return new Response(
        JSON.stringify({
          success: false,
          code: "email_not_confirmed",
          message:
            "We sent you a new verification link. Please check your inbox.",
        }),
        { status: 403 }
      );
    }

    // ✅ If verified → return role only (login frontend karega)
    return new Response(
      JSON.stringify({
        success: true,
        message: "User verified. Proceed to login.",
        data: { role: profile.role, id: profile.id },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
