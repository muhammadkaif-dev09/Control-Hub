"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      if (
        allowedRoles &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.user_metadata?.role)
      ) {
        router.replace("/user");
        return;
      }
      setIsChecking(false);
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
