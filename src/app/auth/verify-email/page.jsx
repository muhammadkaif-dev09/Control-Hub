"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function EmailVerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full border border-gray-200">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="h-16 w-16 text-green-500 animate-bounce" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Email Verified Successfully 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Redirecting you to your dashboard...
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full animate-progress"></div>
        </div>
      </div>
      <style jsx>{`
        .animate-progress {
          animation: progressBar 2s linear forwards;
        }
        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
