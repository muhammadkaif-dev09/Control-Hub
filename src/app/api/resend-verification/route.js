import { supabaseAdmin } from "@/supabase/adminClient";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from("user_profiles")
      .select("id, full_name")
      .eq("email", email)
      .single();

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found." }),
        { status: 404 }
      );
    }

    // Generate new token
    const token = uuidv4();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from("email_verification_tokens")
      .insert([{ user_id: user.id, token, expires_at }]);

    // Send email
    const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}`;
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
      from: `"Control-Hub!" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Control-Hub Account",
      html: `
        <h2>Hi ${user.full_name},</h2>
        <p>Please verify your email using the link below:</p>
        <a href="${verifyLink}" target="_blank">Verify Email</a>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Verification email resent." }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Failed to resend email." }),
      { status: 500 }
    );
  }
}