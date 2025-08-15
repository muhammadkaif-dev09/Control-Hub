"use client";
import Layout from "@/components/Layout";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import Image from "next/image";

// Local validation schema for user profile
const profileValidationSchema = yup.object({
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
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Invalid email format")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Email must include a valid domain"
    ),
  birthdate: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .required("Birthdate is required")
    .max(new Date(), "Future dates are not allowed"),
  gender: yup.string().required("Gender is required"),
  phone_number: yup
    .string()
    .required("Phone number is required")
    .test("is-valid-phone", "Invalid phone number", (value) => {
      if (!value || typeof value !== "string") return false;
      try {
        const { parsePhoneNumberFromString } = require("libphonenumber-js");
        const phone_number = parsePhoneNumberFromString(value, "IN");
        return phone_number ? phone_number.isValid() : false;
      } catch {
        return false;
      }
    }),
  role: yup.string().required("Role is required"),
  profile_image: yup.mixed().nullable().notRequired(),
});

const UserProfile = () => {
  const params = useParams();
  const mode = params.slug?.[0];
  const user_id = params.slug?.[1];

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(
          "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/fetch-single",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGdhb3dvaWd6YXhxaGd1Z3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTc4NTQsImV4cCI6MjA2OTc3Mzg1NH0.jUgNeUFEHlOMRzeQpXXX3mEv_Wdr7rxUlfJjTFYVgyM",
            },
            body: JSON.stringify({ id: user_id }),
          }
        );

        if (!res.ok) {
          const errorData = await res.text();
          console.error("API Error:", errorData);
          return;
        }

        const data = await res.json();
        setUserData(data?.user);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    if (user_id) fetchUserData();
  }, [user_id]);

  console.log(userData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
    mode: "onChange",
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      gender: "",
      role: "",
      birthdate: "",
      profile_image: null,
      updated_at: new Date().toISOString(),
    },
  });

  useEffect(() => {
    if (userData) {
      reset({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        gender: userData.gender || "",
        role: userData.role || "",
        birthdate: userData.birthdate || "",
        profile_image: userData.profile_image || null,
        is_verified: userData.is_verified
      });
    }
  }, [userData, reset]);

  const formValues = watch();

  const STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  };

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectDocId, setRejectDocId] = useState(null);
  const router = useRouter();
  const handleStatusChange = (id, newStatus) => {
    if (newStatus === STATUS.REJECTED) {
      setRejectDocId(id);
      setShowRejectModal(true);
    } else {
      setDocuments((docs) =>
        docs.map((doc) =>
          doc.id === id ? { ...doc, status: newStatus, rejectionNote: "" } : doc
        )
      );
    }
  };

  const handleRejectSubmit = () => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === rejectDocId
          ? { ...doc, status: STATUS.REJECTED, rejectionNote: rejectNote }
          : doc
      )
    );
    setShowRejectModal(false);
    setRejectNote("");
    setRejectDocId(null);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0]?.toUpperCase()
      : (parts[0][0] + parts[1][0])?.toUpperCase();
  };

  const fileInputRef = useRef(null);
  const [localprofile_image, setLocalprofile_image] = useState(null);

  const handleprofile_imageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalprofile_image(userData.profile_image);
      setValue("profile_image", url);
    }
  };

  const handleAvatarClick = () => {
    if (mode === "edit" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const [profileImg, setProfileImg] = useState("/dummy-user.jpg");
  const [backgroundImg, setBackgroundImg] = useState("/dummy-banner.png");
  const [profileImgLoading, setProfileImgLoading] = useState(false);
  const [backgroundImgLoading, setBackgroundImgLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // for toggle

  const tinyBlur =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoMSIgbGVuZ3RoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

  const onUpdateProfile = async (data) => {
    try {
      // Format birthdate if needed
      const formattedData = {
        ...data,
        birthdate: data.birthdate
          ? new Date(data.birthdate).toISOString().split("T")[0]
          : null,
      };

      const res = await fetch(
        "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/update-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGdhb3dvaWd6YXhxaGd1Z3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTc4NTQsImV4cCI6MjA2OTc3Mzg1NH0.jUgNeUFEHlOMRzeQpXXX3mEv_Wdr7rxUlfJjTFYVgyM",
          },
          body: JSON.stringify({ id: user_id, ...formattedData }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update API error:", errorText);
        return;
      }

      const result = await res.json();
      toast.success("Profile Updated successful");
      setTimeout(() => {
        router.push("/admin/users");
      });

      setUserData(result?.user); // update local state with new user data
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <AuthProvider>
      <Layout>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            User Management
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 h-full">
          <div className="flex  justify-start flex-col mb-8">
            {/* Cover Photo */}
            <div className="relative h-40 bg-gray-300">
              {backgroundImgLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              <Image
                src={userData?.banner_image || backgroundImg}
                alt=""
                fill
                placeholder="blur"
                blurDataURL={tinyBlur}
                className={`h-full w-full object-cover ${
                  backgroundImgLoading ? "visible" : ""
                }`}
                onLoadingComplete={() => setBackgroundImgLoading(false)}
                onError={() => setBackgroundImgLoading(false)}
                priority
              />
            </div>
            {/* Profile Picture */}
            <div className="relative">
              <div className="absolute -top-16 left-12 rounded-full border-4 border-white w-32 h-32 bg-gray-300 flex items-center justify-center overflow-hidden">
                {profileImgLoading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
                )}
                <Image
                  src={userData?.profile_image || "/dummy-user.jpg"}
                  alt=" "
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

            <div className="flex-1 ml-4 mt-15">
              <form onSubmit={handleSubmit(onUpdateProfile)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register("full_name")}
                      readOnly={mode === "view"}
                      className={`mt-1 block w-full border border-gray-300 rounded-md p-2 ${
                        mode === "edit" ? "bg-white" : "bg-gray-100"
                      }`}
                    />
                    {errors.full_name && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      readOnly
                      className={`mt-1 block w-full border cursor-not-allowed border-gray-300 rounded-md p-2 ${
                        mode === "edit" ? "bg-white" : "bg-gray-100"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <PhoneInput
                      country={"in"}
                      value={formValues.phone_number}
                      onChange={(phone_number) => {
                        if (mode !== "view") {
                          setValue("phone", phone_number, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }}
                      inputClass={`!w-full !h-10 !text-black !border !border-gray-300 !rounded ${
                        mode === "view"
                          ? "!bg-gray-100 !cursor-not-allowed"
                          : ""
                      }`}
                      disabled={mode === "view"}
                    />
                    {errors.phone_number && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.phone_number.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      {...register("birthdate")}
                      readOnly={mode === "view"}
                      className={`mt-1 block w-full border border-gray-300 rounded-md p-2 ${
                        mode === "edit" ? "bg-white" : "bg-gray-100"
                      }`}
                    />
                    {errors.birthdate && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.birthdate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      {...register("gender")}
                      disabled={mode === "view"}
                      className={`mt-1 block w-full border border-gray-300 rounded-md p-2 h-11 ${
                        mode === "edit" ? "bg-white" : "bg-gray-100"
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <input
                      {...register("role")}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Role cannot be changed
                    </p>
                  </div>

                  <div className="col-span-2">
                    {!formValues.is_verified ? (
                      <p className="text-red-600 mb-2">✔ Not Verified</p>
                    ) : (
                      <p className="text-green-600 mb-2">✔ Verified</p>
                    )}
                  </div>
                </div>
                {/* Show all validation errors if any */}
                {Object.keys(errors).length > 0 && (
                  <div className="mb-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                      <strong className="font-bold">
                        Please fix the following errors:
                      </strong>
                      <ul className="list-disc ml-5 mt-1">
                        {Object.entries(errors).map(([field, err]) => (
                          <li key={field}>{err.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-6 gap-2">
                  {mode === "edit" && (
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition cursor-pointer"
                    >
                      Update Profile
                    </button>
                  )}
                  <Link
                    href={"/admin/users"}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Back
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default UserProfile;
