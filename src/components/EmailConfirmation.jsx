"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function EmailVerifiedSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/user");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-gray-900 shadow-lg rounded-2xl p-8 text-center max-w-md w-full border border-gray-700">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="h-16 w-16 text-green-400 animate-bounce" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          Email Verified Successfully 🎉
        </h1>
        <p className="text-gray-300 mb-6">
          Your email has been successfully verified. Redirecting you to your
          dashboard...
        </p>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
}
