"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../supabase/createClient";
import { handleSignOut } from "@/supabase/handleSignOut";

export default function EmailConfirmation() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("name") || "User";
  const email = searchParams.get("email") || "your email";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!data.success) {
      setMessage("Failed to resend email. Try again later.");
    } else {
      setMessage("🎊 Verification email has been resent successfully. 🎊");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 border-t-4 border-indigo-600">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Confirm Your Email Address
        </h1>
        <p className="text-gray-700 mb-2">
          Hi <span className="font-bold">{userName}</span>,
        </p>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email:
          <br />
          <span className="font-semibold">{email}</span>
          <br />
          Please click the button below to verify your account and complete the
          signup process.
        </p>

        {/* Go to Gmail Button */}
        <div className="text-center mb-4 flex justify-center items-center gap-2.5">
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md text-sm font-medium shadow hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            {loading ? "Resending..." : "Resend Verification Email"}
          </button>
          <a
           onClick={() => handleSignOut()}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md text-sm shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Logout
          </a>
        </div>

        {/* Status Message */}
        {message && (
          <p className="text-center text-sm mt-2 text-gray-600">{message}</p>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Didn’t get the email? Check your spam folder or try again.
        </p>
        <p className="font-semibold mt-6 text-gray-700">
          – The Control-Hub Team
        </p>
      </div>
    </div>
  );
}
