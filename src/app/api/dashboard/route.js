import { supabaseAdmin } from "@/supabase/adminClient";

export async function GET(req) {
  try {
    // Get total users
    const { count: totalUsers, error: userCountError } = await supabaseAdmin
      .from("user_profiles")
      .select("id", { count: "exact", head: true });

    // Get today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todaysRegistrations, error: todayError } = await supabaseAdmin
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get gender distribution
    const { data: genderData, error: genderError } = await supabaseAdmin
      .from("user_profiles")
      .select("gender");

    // Get registration trends (last 7 days)
    const last7 = new Date();
    last7.setDate(last7.getDate() - 6);
    const { data: regData, error: regError } = await supabaseAdmin
      .from("user_profiles")
      .select("created_at")
      .gte("created_at", last7.toISOString());

    if (userCountError || todayError || genderError || regError) {
      return Response.json({ success: false, message: "Error fetching data" }, { status: 500 });
    }

    return Response.json({
      success: true,
      totalUsers,
      todaysRegistrations,
      genderData,
      regData,
    });
  } catch (error) {
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
