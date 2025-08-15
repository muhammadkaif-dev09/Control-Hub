"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { useUser } from "@/context/UserProvider";
import { supabase } from "@/supabase/createClient";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) return toast.error("Invalid email or password");

      const verifyRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      }).then((res) => res.json());

      // console.log(verifyRes);

      if (verifyRes.code === "email_not_confirmed") {
        toast.error(verifyRes.message);
        return router.push(
          `/auth/confirmation?email=${encodeURIComponent(formData.email)}`
        );
      }

      if (!verifyRes.success) {
        toast.error(verifyRes.message);
        return;
      }

      // Set user data globally
      setUser(verifyRes.data);

      const userRole = verifyRes.data?.role || "user";
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        router.push(userRole === "admin" ? "/admin/dashboard" : "/user");
      }, 1000);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-zinc-200 p-8 text-center">
        {/* Logo / Branding */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <span className="text-2xl font-bold text-gray-900">ControlHub</span>
        </div>

        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Welcome back to your account
        </h2>
        <div className="w-16 h-0.5 bg-blue-600 mx-auto mb-8"></div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2 text-left">
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              className="h-12 border text-black border-gray-300 rounded px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2 text-left">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
                className="h-12 border text-black border-gray-300 rounded px-3 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-6 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Button */}
          <div className="text-left">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-blue-600 text-sm hover:underline mb-3 block cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-semibold rounded flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader size="5" /> : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 border border-gray-300 h-12 w-full rounded hover:bg-gray-100 transition cursor-pointer"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">
            Continue with Google
          </span>
        </button>

        {/* Register Link */}
        <div className="mt-6">
          <span className="text-zinc-400">
            Don't have an account?{" "}
            <Link
              href={"/auth/signup"}
              className="text-blue-600 hover:underline"
            >
              Register
            </Link>
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
}
