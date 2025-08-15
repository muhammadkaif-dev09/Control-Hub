import { supabaseAdmin } from "../../../supabase/adminClient";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, password, fullName, phone, gender, birthDate } =
      await req.json();
    // Check if email or phone already exists
    const { data: existingEmail, error: emailError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email already exists.",
        }),
        { status: 409 }
      );
    }

    // Check if phone number already exists
    const { data: existingPhone, error: phoneError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("phone_number", phone)
      .single();

    if (existingPhone) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Phone number already exists.",
        }),
        { status: 409 }
      );
    }

    if (
      (emailError && emailError.code !== "PGRST116") ||
      (phoneError && phoneError.code !== "PGRST116")
    ) {
      // Ignore 'No rows found' error
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error checking user existence.",
        }),
        { status: 500 }
      );
    }

    // 1️⃣ Create Auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {},
      });

    if (authError) {
      return new Response(
        JSON.stringify({ success: false, message: authError.message }),
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2️⃣ Insert into user_profiles (bypass RLS using supabaseAdmin)
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert([
        {
          id: userId,
          email,
          full_name: fullName,
          phone_number: phone,
          gender:
            gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase(),
          birthdate: new Date(birthDate).toISOString().split("T")[0],
          is_verified: false,
        },
      ]);

    if (profileError) {
      console.error("Profile insert error:", profileError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to save profile data",
        }),
        { status: 500 }
      );
    }

    // 3️⃣ Sign in the user to get access token
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      console.error("SignIn Error:", signInError); // Add this line
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to sign in after registration.",
        }),
        { status: 500 }
      );
    }

    const accessToken = signInData.session?.access_token;

    // 4️⃣ Create a verification token
    const token = uuidv4();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from("email_verification_tokens")
      .insert([{ user_id: userId, token, expires_at }]);

    // 5️⃣ Send verification email
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
        <h2>Hi ${fullName},</h2>
        <p>Thank you for signing up! Please verify your email using the link below:</p>
        <a href="${verifyLink}" target="_blank" style="padding:10px 20px;background:#5c52b5;color:#fff;border-radius:5px;text-decoration:none;">
          Verify Email
        </a>
      `,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account created. Please check your email to verify.",
        accessToken, // Return token to client
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: "Something went wrong." }),
      { status: 500 }
    );
  }
}
