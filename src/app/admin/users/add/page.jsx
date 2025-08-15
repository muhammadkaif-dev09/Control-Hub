"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { yupResolver } from "@hookform/resolvers/yup";
import { validationSchema } from "@/components/validationSchema";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { registerUser } from "@/supabase/registerUser";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const AddUser = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
    getValues,
  } = useForm({ resolver: yupResolver(validationSchema), mode: "onChange" });

  const gender = watch("gender");

  useEffect(() => {
    register("phone", { required: true });
  }, [register]);

  const onSubmit = async (payload) => {
    setLoading(true);
    try {
      const result = await registerUser(payload);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error.message);
      toast.error("Something went wrong, please try again.");
    } finally {
      setLoading(false);
      reset();
      setValue("phone", ""); // <-- Add this line to clear phone input
    }
  };

  return (
    <AuthProvider>
      <Layout>
        <div className="max-w-full mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Add New User
          </h1>
          <p className="text-gray-500 mb-6">
            Manage your account settings and preferences
          </p>

          <form
            className="bg-white rounded-lg shadow-md p-8 h-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Jhon Doe"
                  {...register("fullName")}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <p
                  className={`text-[13px] h-3 ${
                    errors.fullName ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {errors.fullName?.message}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="jhondow@gmail.com"
                  {...register("email")}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <p
                  className={`text-[13px] h-3 ${
                    errors.email ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {errors.email?.message}
                </p>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register("birthDate")}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <p
                  className={`text-[13px] h-3 ${
                    errors.birthDate ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {errors.birthDate?.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-[0.65rem]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <p
                  className={`text-[13px] h-3 ${
                    errors.gender ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {errors.gender?.message}
                </p>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="xxxxxxxx"
                  {...register("password", {
                    required: isEditing ? "Password is required" : false,
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <button
                  type="button"
                  className="absolute right-3 top-11.5 transform -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="xxxxxxxx"
                  {...register("confirmPassword", {
                    required: isEditing
                      ? "Confirm password is required"
                      : false,
                    validate: (value) =>
                      !isEditing ||
                      value === getValues("password") ||
                      "Passwords do not match",
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <button
                  type="button"
                  className="absolute right-3 top-11.5 transform -translate-y-1/2 text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-1.5">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition cursor-pointer"
              >
                {loading ? <Loader size="5" /> : "Add Profile"}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default AddUser;
