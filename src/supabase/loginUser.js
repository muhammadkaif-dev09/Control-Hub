export const loginUser = async (payload) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Login Error:", err.message);
    return {
      success: false,
      code: "unexpected",
      message: "Login failed. Please try again.",
    };
  }
};
