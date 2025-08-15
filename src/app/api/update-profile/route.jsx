// utils/authFetch.js
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found. User may not be authenticated.");
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "API request failed");
  }

  return response.json();
};
