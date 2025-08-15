import { supabaseAdmin } from "@/supabase/adminClient";
import { supabase } from "@/supabase/createClient";

// Fetch All Users
export async function GET(req) {
  try {
    // Fetch all users with relevant fields
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")  
      .order("updated_at", { ascending: false });

    if (error) {
      return Response.json(
        { success: false, message: "Error fetching users" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      users: data,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

