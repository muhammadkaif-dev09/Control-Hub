import { supabase } from "../../../../../supabase/createClient";

export async function POST(req) {
  try {
    const { token } = await req.json();

    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("is_used", false)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or expired token" }),
        { status: 400 }
      );
    }

    if (new Date(data.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, message: "Token expired" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user_id: data.user_id }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
