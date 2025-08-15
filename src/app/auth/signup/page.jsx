"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { validationSchema } from "@/components/validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { registerUser } from "../../../supabase/registerUser";
import Loader from "@/components/Loader";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    register("phone", { required: true });
  }, [register]);

  const onSubmit = async (payload) => {
    setLoading(true);
    try {
      const result = await registerUser(payload);

      if (result.success) {
        toast.success(result.message);

        setTimeout(() => {
          router.push(
            `/auth/confirmation?name=${encodeURIComponent(
              payload.fullName
            )}&email=${encodeURIComponent(payload.email)}`
          );
        }, 1000);
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error.message);
      toast.error("Something went wrong, please try again.");
    } finally {
      setLoading(false);
      reset();
    }
  };

  const handleGoogleSignIn = () => {};

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 text-center border border-zinc-200">
        {/* Logo/Icon */}
        <div className="w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg flex items-center justify-center mx-auto">
          <div className="w-5 h-5 bg-white rounded-sm"></div>
        </div>

        {/* Title */}
        <span className="text-xl font-bold text-gray-900 mt-3 block">
          Create ControlHub Account
        </span>
        <div className="w-12 h-0.5 bg-blue-600 mx-auto mb-6 mt-2"></div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left"
        >
          {/* Full Name */}
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              placeholder="Full Name"
              className="h-10 border text-black border-gray-300 rounded px-3 w-full focus:outline-none"
              {...register("fullName")}
            />
            <p
              className={`text-[13px] h-3 ${
                errors.fullName ? "text-red-600" : "text-green-600"
              }`}
            >
              {errors.fullName?.message}
            </p>
          </div>

          {/* Email */}
          <div className="col-span-1 md:col-span-2">
            <input
              type="email"
              placeholder="Email"
              className="h-10 border text-black border-gray-300 rounded px-3 w-full focus:outline-none"
              {...register("email")}
            />
            <p
              className={`text-[13px] h-3 ${
                errors.email ? "text-red-600" : "text-green-600"
              }`}
            >
              {errors.email?.message}
            </p>
          </div>

          {/* Phone */}
          <div className="relative col-span-1 md:col-span-2">
            <PhoneInput
              country={"in"}
              onChange={(phone) =>
                setValue("phone", phone, { shouldValidate: true })
              }
              inputClass="!w-full !h-10 !text-black !border !border-gray-300 !rounded"
              containerClass="relative"
              buttonClass="!h-10"
              dropdownClass="!z-55 text-black"
            />
            <p
              className={`text-[13px] h-3 ${
                errors.phone ? "text-red-600" : "text-green-600"
              }`}
            >
              {errors.phone?.message}
            </p>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="h-10 border text-black border-gray-300 rounded px-3 w-full pr-10 focus:outline-none"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <p
              className={`text-[13px] h-3 ${
                errors.password ? "text-red-600" : "text-green-600"
              }`}
            >
              {errors.password?.message}
            </p>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="h-10 border text-black border-gray-300 rounded px-3 w-full pr-10 focus:outline-none"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-600 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <p
              className={`text-[13px] h-3 ${
                errors.confirmPassword ? "text-red-600" : "text-green-600"
              }`}
            >
              {errors.confirmPassword?.message}
            </p>
          </div>

          {/* Gender */}
          <div className="col-span-1">
            <select
              className="h-10 border text-black border-gray-300 rounded px-3 w-full focus:outline-none"
              {...register("gender")}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <p
              className={`text-[13px] h-3 ${
                errors.gender ? "text-red-600" : "text-green-600"
              }`}
            >
              {errors.gender?.message}
            </p>
          </div>

          {/* Date of Birth */}
          <div className="col-span-1">
            <input
              type="date"
              className="h-10 border text-black border-gray-300 rounded px-3 w-full focus:outline-none"
              {...register("birthDate")}
            />
            <p
              className={`text-[13px] h-3 ${
                errors.birthDate ? "text-red-600" : "text-green-600"
              }`}
            >
              {errors.birthDate?.message}
            </p>
          </div>

          {/* Terms & Conditions */}
          <div className="col-span-1 md:col-span-2 flex items-center space-x-2 ">
            <input
              type="checkbox"
              id="terms"
              className="h-4 w-4 cursor-pointer"
              {...register("terms", {
                required: "You must accept Terms & Conditions",
              })}
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{" "}
              <a
                href="/terms-and-conditions"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Terms & Conditions
              </a>
            </label>
          </div>
          <p className="text-sm text-red-600 font-medium h-4 col-span-1 md:col-span-2">
            {errors.terms?.message}
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer col-span-1 md:col-span-2 w-full h-10 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-semibold rounded shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader size="5" /> : "Register"}
          </button>

          {/* Horizontal Divider */}
          <div className="col-span-1 md:col-span-2 flex items-center my-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="cursor-pointer col-span-1 md:col-span-2 flex items-center justify-center gap-2 border border-gray-300 h-10 rounded hover:bg-gray-100 transition"
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

          {/* Login Redirect */}
          <div className="col-span-1 md:col-span-2 text-center mt-2 flex justify-center gap-1">
            <span className="text-zinc-500">Already have an account?</span>
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
