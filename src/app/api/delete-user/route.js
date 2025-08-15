export const deleteUser = async (user_id) => {
  try {
    const res = await fetch(
      "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/delete-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ id: user_id }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(errorText);
      throw new Error("Failed to delete user");
    }

    return "User deleted successfully";
  } catch (error) {
    console.error(error.message);
    toast.error("Failed to delete user");
  }
};
