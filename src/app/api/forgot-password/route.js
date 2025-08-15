import { supabaseAdmin } from "@/supabase/adminClient";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return Response.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Find user
    const { data: user } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("email", email.trim())
      .maybeSingle();

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Delete old tokens
    await supabaseAdmin
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", user.id);

    // 3️⃣ Create fresh token
    const token = crypto.randomBytes(32).toString("hex").trim();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

    await supabaseAdmin.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      is_used: false,
      expires_at: expiresAt,
    });

    // 4️⃣ Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"ControlHub Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">
        <button>
        Reset Your Password
        </button>
        </a>
        <p><b>Note:</b> This link expires in 1 hour.</p>
      `,
    });

    return Response.json({
      success: true,
      message: "Password reset link sent to your email ✅",
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
