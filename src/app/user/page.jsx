"use client";

import UserLayout from "@/components/UserLayout";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Camera } from "lucide-react";
import { ChangeAdminPassword } from "@/components/ChangeAdminPassword";
import { useUser } from "@/context/UserProvider";
import { redirect, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/supabase/createClient";
import { Loader2, Trash2 } from "lucide-react"; // Add to your imports
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image"; // Add this import
import PurchaseDetails from "./PurchaseDetails/page";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import * as yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { yupResolver } from "@hookform/resolvers/yup";

// Pre-calculate today's date and minAgeDate
const today = new Date();
const minAgeDate = new Date(today.setFullYear(today.getFullYear() - 18));

export const validation = yup.object({
  full_name: yup
    .string()
    .required("Name is required")
    .min(2, "Name should be at least 2 characters")
    .max(20, "Name should not exceed 20 characters")
    .matches(/^[^\s].*[^\s]$/, "Name cannot start or end with a space")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
    .test(
      "no-only-spaces",
      "Name cannot be empty or only spaces",
      (value) => value && value.trim().length > 0
    ),
  // email: yup
  //   .string()
  //   .trim()
  //   .required("Email is required")
  //   .email("Invalid email format")
  //   .matches(
  //     /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  //     "Email must include a valid domain"
  //   ),
  birthdate: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .required("Birthdate is required")
    .max(new Date(), "Future dates are not allowed")
    .test(
      "min-age",
      "You must be at least 18 years old",
      (value) => value && value <= minAgeDate
    ),
  // gender: yup.string().required("Gender is required"),
  // password: yup
  //   .string()
  //   .required("Password is required")
  //   .min(8, "Password must be at least 8 characters")
  //   .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  //   .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  //   .matches(/\d/, "Password must contain at least one number")
  //   .matches(
  //     /[@$!%*?&]/,
  //     "Password must contain at least one special character (@, $, !, %, *, ?, &)"
  //   ),
  // confirmPassword: yup
  //   .string()
  //   .required("Confirm Password is required")
  //   .oneOf([yup.ref("password")], "Passwords must match"),
});

export default function UserProfile() {
  const { user } = useUser();
  const [profileImg, setProfileImg] = useState("/dummy-banner.jpg");
  const [backgroundImg, setBackgroundImg] = useState("/dummy-banner.jpg");
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [loading, setLoading] = useState(false); // Add this line
  const [deletingDocId, setDeletingDocId] = useState(null); // Add this state
  const [profileImgLoading, setProfileImgLoading] = useState(false); // Set loading to false by default
  const [backgroundImgLoading, setBackgroundImgLoading] = useState(false); // Set loading to false by default

  const user_id = user?.id;
  const router = useRouter();
  const supabaseUrl = "https://fylgaowoigzaxqhgugxr.supabase.co";

  // Tiny transparent SVG as blur placeholder (1x1 pixel)
  const tinyBlur =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoMSIgbGVuZ3RoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user_id) return;

      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          toast.error("Session error. Please log in again.");
          router.push("/auth/login");
          return;
        }

        const token = sessionData?.session?.access_token;

        if (!token) {
          toast.error("Session expired. Please log in again.");
          router.push("/auth/login");
          return;
        }

        const res = await fetch(`${supabaseUrl}/functions/v1/fetch-single`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: user_id }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          if (
            errorText.includes(
              "JSON object requested, multiple (or no) rows returned"
            )
          ) {
            router.push("/auth/login");
            toast.error("Your session is invalid or expired.");
            return;
          }
          // console.error("API Error:", errorText);
          toast.error("Failed to fetch user data.");
          return;
        }

        const data = await res.json();
        setUserData(data?.user);
      } catch (error) {
        console.error("Fetch failed:", error);
        toast.error("An unexpected error occurred.");
      }
    };

    fetchUserData();
  }, [user_id]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(validation), mode: "onChange" });

  useEffect(() => {
    register("phone", { required: true });
  }, [register]);

  useEffect(() => {
    if (userData) {
      reset({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        gender: userData.gender || "",
        role: userData.role || "",
        birthdate: userData.birthdate || "",
      });
      // Only set loading to true if the image URL is different
      if (userData.profile_image && userData.profile_image !== profileImg) {
        setProfileImgLoading(true);
        setProfileImg(userData.profile_image);
      } else {
        setProfileImg(userData.profile_image);
        setProfileImgLoading(false);
      }
      if (userData.banner_image && userData.banner_image !== backgroundImg) {
        setBackgroundImgLoading(true);
        setBackgroundImg(userData.banner_image);
      } else {
        setBackgroundImg(userData.banner_image);
        setBackgroundImgLoading(false);
      }
    }
  }, [userData, reset]);

  const acVerify = userData?.is_verified;

  const onBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundImgLoading(true); // Set loading before changing src
      setBackgroundFile(file);
      setBackgroundImg(URL.createObjectURL(file));
    }
  };

  const onProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImgLoading(true); // Set loading before changing src
      setProfileFile(file);
      setProfileImg(URL.createObjectURL(file));
    }
  };

  async function uploadImage(file, bucketName, userId) {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  const onUpdateProfile = async (formData) => {
    setLoading(true); // Add this line
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast.error("You are not authenticated. Please login again.");
        return;
      }

      // Upload profile image
      let profileImageUrl = userData?.profile_image || null;
      if (profileFile) {
        const uploadedUrl = await uploadImage(
          profileFile,
          "user-profile-images",
          user_id
        );

        if (uploadedUrl) profileImageUrl = uploadedUrl;
      }

      // Upload background image
      let backgroundImageUrl = userData?.banner_image || "/dummy-banner.jpg";
      if (backgroundFile) {
        const uploadedUrl = await uploadImage(
          backgroundFile,
          "user-banner-images",
          user_id
        );
        if (uploadedUrl) backgroundImageUrl = uploadedUrl;
      }

      const formattedData = {
        ...formData,
        profile_image: profileImageUrl,
        banner_image: backgroundImageUrl,
        birthdate: formData.birthdate
          ? new Date(formData.birthdate).toISOString().split("T")[0]
          : null,
      };

      const res = await fetch(`${supabaseUrl}/functions/v1/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: user_id, ...formattedData }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update API error:", errorText);
        toast.error("Failed to update profile");
        return;
      }

      const result = await res.json();
      toast.success("Profile updated successfully");
      setUserData(result?.user);
      setIsEditing(false);
      setProfileFile(null);
      setBackgroundFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false); // Add this line
    }
  };

  const handleDeleteDocument = async (docId) => {
    setDeletingDocId(docId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: docId }),
      });
      if (!res.ok) {
        toast.error("Failed to delete document");
        return;
      }
      toast.success("Document deleted");
      setUserData((prev) => ({
        ...prev,
        documents: prev.documents.filter((doc) => doc.id !== docId),
      }));
    } catch (error) {
      toast.error("Error deleting document");
    } finally {
      setDeletingDocId(null);
    }
  };

  return (
    <ProtectedRoute>
      <UserLayout>
        <div className="bg-white shadow rounded-md overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-40 bg-gray-300">
            {backgroundImgLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {backgroundImg && (
              <Image
                src={backgroundImg}
                alt="   "
                fill
                placeholder="blur"
                blurDataURL={tinyBlur}
                className={`h-full w-full object-cover ${
                  backgroundImgLoading ? "invisible" : ""
                }`}
                onLoadingComplete={() => setBackgroundImgLoading(false)}
                onError={() => setBackgroundImgLoading(false)}
                priority
              />
            )}

            {isEditing && (
              <>
                <label
                  htmlFor="backgroundInput"
                  className="absolute top-2 right-2 cursor-pointer bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition"
                  title="Change Background Image"
                >
                  <Camera className="text-white" size={20} />
                </label>
                <input
                  id="backgroundInput"
                  type="file"
                  accept="image/*"
                  onChange={onBackgroundChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Profile Picture */}
          <div className="relative">
            <div className="absolute -top-16 left-12 rounded-full border-4 border-white w-32 h-32 bg-gray-300 flex items-center justify-center overflow-hidden">
              {profileImgLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
              )}
              {profileImg && (
                <Image
                  src={profileImg}
                  alt=""
                  width={128}
                  height={128}
                  placeholder="blur"
                  blurDataURL={tinyBlur}
                  className={`w-full h-full rounded-full object-cover ${
                    profileImgLoading ? "invisible" : ""
                  }`}
                  onLoadingComplete={() => setProfileImgLoading(false)}
                  onError={() => setProfileImgLoading(false)}
                  priority
                />
              )}
              {isEditing && (
                <>
                  <label
                    htmlFor="profileInput"
                    className="absolute bottom-2 right-2 cursor-pointer bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition"
                    title="Change Profile Image"
                  >
                    <Camera className="text-white" size={20} />
                  </label>
                  <input
                    id="profileInput"
                    type="file"
                    accept="image/*"
                    onChange={onProfileChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <form
            className="bg-white rounded-lg shadow-md p-8 h-full mt-24"
            onSubmit={handleSubmit(onUpdateProfile)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...register("full_name")}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <p
                  className={`text-[13px] h-3 ${
                    errors.full_name ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {errors.full_name?.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  readOnly
                  disabled
                  {...register("email")}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                />
              </div>

              <div className="relative col-span-1 md:col-span-2">
                <PhoneInput
                  country={"in"}
                  value={userData?.phone_number || ""}
                  onChange={(phone) =>
                    setValue("phone_number", phone, { shouldValidate: true })
                  }
                  inputClass="!w-full !h-10 !text-black !border !border-gray-300 !rounded"
                  containerClass="relative"
                  buttonClass="!h-10"
                  dropdownClass="!z-55 text-black"
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                  {...register("birthdate")}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <p
                  className={`text-[13px] h-3 ${
                    errors.birthdate ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {errors.birthdate?.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                {!isEditing ? (
                  <input
                    type="text"
                    readOnly
                    {...register("gender")}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                  />
                ) : (
                  <select
                    {...register("gender")}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  value={userData?.role || ""}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Role cannot be changed
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Edit Profile
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
                >
                  Change Password
                </button>
              </div>
            </div>
          </form>

          {/* Change Password Modal */}
          {isPasswordModalOpen && (
            <ChangeAdminPassword
              isOpen={isPasswordModalOpen}
              onClose={() => setIsPasswordModalOpen(false)}
              user={user}
            />
          )}
        </div>
        <PurchaseDetails />
      </UserLayout>
    </ProtectedRoute>
  );
}
