export const registerUser = async (payload) => {
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success && data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};
