"use client";

import Sidebar from "@/components/Sidebar";
import TotalCards from "@/components/TotalCards";
import UserRegistrationsChart from "@/components/UserRegistrationsChart";
import GenderDistributionChart from "@/components/GenderDistributionChart";
import { useEffect, useState } from "react";
import RegistrationTrendsChart from "@/components/RegistrationTrendsChart";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (data.success) {
          setDashboardData(data);
        } else {
          setError(data.message || "Failed to load dashboard data");
        }
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600">
        <Loader />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mb-6">
          Monitor your user analytics and insights
        </p>

        {error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <>
            <TotalCards
              totalUsers={dashboardData.totalUsers}
              todaysRegistrations={dashboardData.todaysRegistrations}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <UserRegistrationsChart regData={dashboardData.regData} />
              <GenderDistributionChart genderData={dashboardData.genderData} />
            </div>

            <div className="mt-6">
              <RegistrationTrendsChart />
            </div>
          </>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
