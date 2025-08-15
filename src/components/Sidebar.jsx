"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  LogOut,
  UserPlus,
  DockIcon,
  DollarSignIcon,
  Bell,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { handleSignOut } from "../supabase/handleSignOut";
import { useUser } from "@/context/UserProvider";
import { fetchUserDetails } from "@/utils/fetchSignleUser";

export default function Sidebar({ activeTab, onTabChange }) {
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
    fetchUserData();
  }, [user_id]);
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
            href="/admin/dashboard"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/admin/dashboard"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/admin/users"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <User size={20} />
            All Users
          </Link>
          <Link
            href="/admin/users/add"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/admin/users/add"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <UserPlus size={20} />
            Add User
          </Link>
          <Link
            href="/admin/document"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/admin/document"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <DockIcon size={20} />
            Documents
          </Link>
          <Link
            href="/admin/subscription"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/admin/subscription"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <DollarSignIcon size={20} />
            Service Plan
          </Link>
          <Link
            href="/admin/user-subscription"
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer
        ${
          path === "/admin/user-subscription"
            ? "bg-[#61A5FA] text-white"
            : "text-gray-700 hover:bg-[#E6F1FF] hover:text-gray-800"
        }`}
          >
            <Bell size={20} />
            Subscription
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {userData?.full_name}
            </p>
            <p className="text-xs text-gray-500">{userData?.role}</p>
          </div>
        </div>

        <Link
          href={"/admin/profile"}
          className="flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100"
        >
          <User size={16} />
          Profile
        </Link>

        <button
          onClick={() => handleSignOut()}
          className="flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
