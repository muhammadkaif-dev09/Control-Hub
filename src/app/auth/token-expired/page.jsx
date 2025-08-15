"use client";
import { handleSignOut } from "@/supabase/handleSignOut";
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const handleSignout = () => {
    handleSignOut();
    router.push("/");
  };
  const router = useRouter();
  return (
    <div className="flex justify-center items-center h-screen bg-zinc-100">
      <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] text-black">
        <h2 className="text-2xl mb-4">Hello, User 👋</h2>
        <p className="text-base leading-relaxed mb-4">
          The verification link is invalid or expired. Please log in and request
          a new confirmation link.
        </p>
        <p className="text-base leading-relaxed mb-6">
          Just click the button below:
        </p>
        <button
          onClick={() => handleSignout()}
          className="cursor-pointer inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          Control-Hub!
        </button>
        <p className="mt-8 text-xs text-gray-500 text-center">
          If you didn’t sign up for Control-Hub, you can ignore this email.
        </p>
      </div>
    </div>
  );
};

export default page;
