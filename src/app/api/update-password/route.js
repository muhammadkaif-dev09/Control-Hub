import { supabase } from "@/supabase/createClient";


export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return Response.json(
        { success: false, message: "Token aur password required hai" },
        { status: 400 }
      );
    }

    // Verify token
    const { data } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .single();

    if (!data) {
      return Response.json(
        { success: false, message: "Invalid token" },
        { status: 404 }
      );
    }

    if (new Date(data.expires_at) < new Date()) {
      return Response.json(
        { success: false, message: "Token expire ho gaya hai" },
        { status: 400 }
      );
    }

    // Update password in auth.users
    const { error } = await supabase.auth.admin.updateUserById(data.user_id, {
      password: newPassword,
    });

    if (error) throw error;

    // Delete token (one-time use)
    await supabase.from("password_reset_tokens").delete().eq("token", token);

    return Response.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
