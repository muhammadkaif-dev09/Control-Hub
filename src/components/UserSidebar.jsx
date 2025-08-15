"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  BookAIcon,
  User2,
  Upload,
  Award, // ✅ Badge icon
} from "lucide-react";
import { usePathname } from "next/navigation";
import { handleSignOut } from "../supabase/handleSignOut";
import { useUser } from "@/context/UserProvider";
import { fetchUserDetails } from "@/utils/fetchSignleUser";

export default function UserSidebar() {
  const { user } = useUser();
  const user_id = user?.id;
  const path = usePathname();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      fetchUserDetails(user_id).then((res) => {
        setUserData(res);
      });
    };
    if (user_id) fetchUserData();
  }, [user_id]);

  console.log(userData);

  // ✅ Determine subscription badge
  const getSubscriptionBadge = (credit) => {
    if (!credit) return null;
    if (credit > 50) return { label: "Gold", color: "text-yellow-500" };
    if (credit > 30) return { label: "Silver", color: "text-gray-400" };
    if (credit > 20) return { label: "Bronze", color: "text-orange-500" };
    return null;
  };

  const badge = getSubscriptionBadge(userData?.credit);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-gray-800">ControlHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link
            href="/user"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/user"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <User2 size={20} />
            Profile
          </Link>
          <Link
            href="/user/document"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/user/document"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <Upload size={20} />
            Upload
          </Link>
          <Link
            href="/user/view"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/user/view"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <BookAIcon size={20} />
            Documents
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      {/* User Profile */}

      <div className="p-4 border-t border-gray-200">
        {/* {userData?.remainingCredits > 0 && (
          <div className="flex items-center gap-1 mb-5 pl-1">
            <Award  className="text-yellow-500" />
            <span className="font-medium text-yellow-600">
              {userData.remainingCredits} Credits
            </span>
          </div>
        )} */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            {/* User Name */}
            <p className="text-sm font-medium text-gray-800">
              {userData?.full_name}
            </p>

            {/* Role */}
            <p className="text-xs text-gray-500">{userData?.role}</p>

            {/* Subscription Badge */}
            {/* {badge && (
              <div className="flex items-center gap-1 mt-1">
                <Award size={14} className={badge.color} />
                <span className={`text-xs font-medium ${badge.color}`}>
                  {badge.label} Member
                </span>
              </div>
            )} */}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => handleSignOut()}
          className="flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
