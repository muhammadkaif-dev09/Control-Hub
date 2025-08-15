import { supabase } from "./createClient";

export async function handleSignOut() {
  try {
    // Clear client storage first
    localStorage.clear();

    // Sign out using Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }

    // Redirect to login
    window.location.href = "/auth/login";
  } catch (err) {
    console.error("Unexpected sign-out error:", err);
  }
}
