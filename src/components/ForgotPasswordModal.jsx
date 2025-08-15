"use client";
import { useState } from "react";
import { Mail, X } from "lucide-react";
import Loader from "./Loader";
import toast from "react-hot-toast";

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success("Password reset link sent to your email!");
        onClose?.();
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      toast.error("Something went wrong, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative border border-zinc-200 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg flex items-center justify-center">
            <Mail size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ControlHub</span>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 text-center">
          Forgot Password?
        </h2>
        <p className="text-gray-500 text-center text-sm mb-5">
          Enter your registered email address and we’ll send you a reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 border text-black border-gray-300 rounded px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-semibold rounded shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {loading ? <Loader size="5" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
