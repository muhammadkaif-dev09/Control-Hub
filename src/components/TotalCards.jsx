// TotalCards.jsx
import { useDocuments } from "@/context/DocumentContext";
import {
  DocumentIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Users,
  TrendingUp,
  Activity,
  FileCheck,
  BookCheck,
  CloudCheck,
  X,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TotalCards({
  totalUsers = 0,
  todaysRegistrations = 0,
  growthRate = 0,
}) {
  const { documents } = useDocuments();

  const totalDocs = documents?.length || 0;
  const pendingCount =
    documents?.filter((d) => d.status === "Pending").length || 0;
  const approvdCount =
    documents?.filter((d) => d.status === "Approved").length || 0;
  const rejectedCount =
    documents?.filter((d) => d.status === "Rejected").length || 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between hover:shadow-[#61A5FA] hover:shadow-md transition-all duration-300 cursor-pointer">
        <Link href={"/users"}>
          <h4 className="text-gray-500">Total Users</h4>
          <p className="text-3xl font-bold text-black">{totalUsers}</p>
        </Link>
        <Users className="text-blue-600" />
      </div>

      <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between hover:shadow-[#61A5FA] hover:shadow-md transition-all duration-300 cursor-pointer">
        <div>
          <h4 className="text-gray-500">Today's Registrations</h4>
          <p className="text-3xl font-bold text-black">{todaysRegistrations}</p>
          {/* <p className="text-xs text-green-500">+12% from yesterday</p> */}
        </div>
        <TrendingUp className="text-green-600" />
      </div>

      <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between hover:shadow-[#61A5FA] hover:shadow-md transition-all duration-300 cursor-pointer">
        <div>
          <h4 className="text-gray-500">Total Documents</h4>
          <p className="text-3xl font-bold text-black">{totalDocs}</p>
          {/* <p className="text-xs text-green-500">+4% this week</p> */}
        </div>
        <DocumentIcon className="h-6 w-6 text-gray-400" />
      </div>

      <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between hover:shadow-[#61A5FA] hover:shadow-md transition-all duration-300 cursor-pointer">
        <div>
          <h4 className="text-gray-500">Pending Review</h4>
          <p className="text-3xl font-bold text-black">{pendingCount}</p>
          {/* <p className="text-xs text-green-500">+4% this week</p> */}
        </div>
        <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />
      </div>

      <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between hover:shadow-[#61A5FA] hover:shadow-md transition-all duration-300 cursor-pointer">
        <div>
          <h4 className="text-gray-500">Approvede</h4>
          <p className="text-3xl font-bold text-black">{approvdCount}</p>
          {/* <p className="text-xs text-green-500">+4% this week</p> */}
        </div>
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
      </div>
      <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between hover:shadow-[#61A5FA] hover:shadow-md transition-all duration-300 cursor-pointer">
        <div>
          <h4 className="text-gray-500">Rejected</h4>
          <p className="text-3xl font-bold text-black">{rejectedCount}</p>
          {/* <p className="text-xs text-green-500">+4% this week</p> */}
        </div>
        <XCircleIcon className="h-6 w-6 text-red-500" />
      </div>
    </div>
  );
}
