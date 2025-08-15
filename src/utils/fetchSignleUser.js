import { supabase } from "@/supabase/createClient";

export const fetchUserDetails = async (user_id) => {
  // console.log(user_id)
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user_id)
    .single();

  if (error) {
    console.error("Error fetching user details:", error.message);
    return null;
  }

  return data;
};
