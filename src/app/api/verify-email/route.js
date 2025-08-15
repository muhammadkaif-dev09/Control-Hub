import { supabaseAdmin } from "../../../supabase/adminClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Token missing" }),
        { status: 400 }
      );
    }

    // 1️⃣ Fetch token data
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("email_verification_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/token-expired`
      );
    }

    // 2️⃣ Compare expiry time in UTC
    const nowUTC = Date.now();
    const expiryUTC = new Date(tokenData.expires_at).getTime();

    // ✅ 2-second tolerance to avoid microsecond mismatch
    if (nowUTC > expiryUTC + 2000) {
      return new Response(
        JSON.stringify({ success: false, message: "Token expired" }),
        { status: 400 }
      );
    }

    if (nowUTC > expiryUTC + 2000) {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/resend-verification`
      );
    }

    // 3️⃣ Mark user as verified
    await supabaseAdmin
      .from("user_profiles")
      .update({ is_verified: true })
      .eq("id", tokenData.user_id);

    // 4️⃣ Delete token (single-use only)
    await supabaseAdmin
      .from("email_verification_tokens")
      .delete()
      .eq("token", token);

    console.log(token);

    // 5️⃣ Update Supabase Auth (mark email as confirmed)
    await supabaseAdmin.auth.admin.updateUserById(tokenData.user_id, {
      email_confirm: true,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email`,
      },
    });
  } catch (error) {
    console.error("Verification Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
