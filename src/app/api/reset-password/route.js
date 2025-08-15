import { supabaseAdmin } from "@/supabase/adminClient";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    const cleanToken = token?.trim();


    if (!cleanToken || !password) {
      return Response.json(
        { success: false, message: "Token and password required" },
        { status: 400 }
      );
    }

    // ✅ 1. Fetch token (unused or NULL)
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*")
      .eq("token", cleanToken)
      .or("is_used.is.null,is_used.eq.false")
      .maybeSingle();


    if (tokenError || !tokenData) {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // ✅ 2. Check expiry time with 2 min tolerance
    const nowUTC = Date.now();
    const expiryUTC = new Date(tokenData.expires_at).getTime();

    if (nowUTC > expiryUTC + 120000) { // 2 minutes tolerance
      return Response.json(
        { success: false, message: "Token expired, please request a new one" },
        { status: 400 }
      );
    }

    // ✅ 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { password }
    );

    if (authError) {
      console.error("Auth Update Error:", authError.message);
      return Response.json(
        { success: false, message: "Password update failed" },
        { status: 500 }
      );
    }

    // ✅ 5. Update password in `user_profiles`
    await supabaseAdmin
      .from("user_profiles")
      .update({ password: hashedPassword })
      .eq("id", tokenData.user_id);

    // ✅ 6. Mark token as used
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ is_used: true })
      .eq("token", cleanToken);

    return Response.json({
      success: true,
      message: "Password updated successfully ✅",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
