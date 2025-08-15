"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/supabase/createClient";
import { Loader2, Newspaper, XCircleIcon } from "lucide-react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchPurchases = async (pageNumber = 0) => {
    setLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select("*")
      .order("payment_date", { ascending: false })
      .range(from, to);

    if (purchasesError) {
      console.error("❌ Error fetching purchases:", purchasesError.message);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(purchasesData.map((p) => p.user_id))];

    if (userIds.length === 0) {
      setPurchases([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    const { data: usersData, error: usersError } = await supabase
      .from("user_profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (usersError) {
      console.error("❌ Error fetching user profiles:", usersError.message);
      setLoading(false);
      return;
    }

    const userMap = {};
    usersData.forEach((user) => {
      userMap[user.id] = user.full_name;
    });

    const mergedPurchases = purchasesData.map((purchase) => ({
      ...purchase,
      user_name: userMap[purchase.user_id] || "Unknown User",
    }));

    setPurchases(mergedPurchases);
    setHasMore(purchasesData.length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    fetchPurchases(page);
  }, [page]);

  const totalRevenue = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.amount_paid || 0),
    0
  );

  const now = new Date();
  // const activePlansCount = purchases.filter((p) => {
  //   const expiry = new Date(p.expiry_date);
  //   return p.status === "active" && expiry >= now;
  // }).length;

  const activePlansCount = purchases.filter(
    (p) => p.status === "active"
  ).length;

  const cancelledPlansCount = purchases.filter(
    (p) => p.status === "cancelled"
  ).length;

  const expiredPlansCount = purchases.filter(
    (p) => p.status === "expired"
  ).length;

  const handleViewReceipt = (receiptUrl) => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank");
    } else {
      alert("No receipt available.");
    }
  };

  // Filter logic
  const filteredPurchases =
    filterStatus === "All"
      ? purchases
      : purchases.filter((p) => p.status === filterStatus);

  const isSelected = (status) => filterStatus === status;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-semibold text-gray-800 mb-1">
        Your Revenue
      </h1>
      <p className="text-gray-500 mb-6">Recent Transactions and their status</p>

      <div className="purchase-details mt-4 p-4 rounded bg-white shadow-sm mx-auto">
        <h3 className="font-semibold text-gray-800 text-xl">
          Purchase Details
        </h3>
        <div className="p-3 mx-auto space-y-6 bg-white rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div
              className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer ${
                isSelected("All") ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setFilterStatus("All")}
              title="Show all purchases"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">{totalRevenue}₹</p>
              </div>
              <DocumentIcon className="h-6 w-6 text-gray-400" />
            </div>

            <div
              className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer ${
                isSelected("active") ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setFilterStatus("active")}
              title="Show active plans"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Active Plan
                </p>
                <p className="text-2xl font-bold">{activePlansCount}</p>
              </div>
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>

            <div
              className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer ${
                isSelected("cancelled") ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setFilterStatus("cancelled")}
              title="Show cancelled plans"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Cancelled Plan
                </p>
                <p className="text-2xl font-bold">{cancelledPlansCount}</p>
              </div>
              <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div
              className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer ${
                isSelected("expired") ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setFilterStatus("expired")}
              title="Show cancelled plans"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Expired Plan
                </p>
                <p className="text-2xl font-bold">{expiredPlansCount}</p>
              </div>
              <XCircleIcon className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        {filteredPurchases.length === 0 ? (
          <p className="mt-4 text-center text-gray-500">No purchases found.</p>
        ) : (
          <>
            <table className="w-full border-collapse mt-3">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                  <th className="px-2 py-2 text-left">Sr No.</th>
                  <th className="px-2 py-2 text-center">Plan</th>
                  <th className="px-4 py-2 text-center">User Name</th>
                  <th className="px-4 py-2 text-center">Payment Date</th>
                  <th className="px-4 py-2 text-center">Amount Paid</th>
                  <th className="px-4 py-2 text-center">Credits</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Expired At</th>
                  <th className="px-4 py-2 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(
                  (
                    {
                      id,
                      plan_name,
                      payment_date,
                      amount_paid,
                      credit,
                      expiry_date,
                      paymentReceipt,
                      status,
                      user_name,
                    },
                    index
                  ) => {
                    const expiry = new Date(expiry_date);
                    return (
                      <tr
                        key={id}
                        className="odd:bg-white even:bg-gray-50 text-sm"
                      >
                        <td className="px-2 py-2 text-left">
                          {page * PAGE_SIZE + index + 1}
                        </td>
                        <td className="py-2 px-2 text-left max-w-[160px] truncate">
                          {plan_name}
                        </td>
                        <td className="py-2 px-2 text-center max-w-[140px] truncate">
                          {user_name}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {new Date(payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {Number(amount_paid).toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-center">{credit}</td>
                        <td className="py-2 px-2 capitalize text-center">
                          {status}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {expiry.toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleViewReceipt(paymentReceipt)}
                            className="text-gray-600 hover:text-gray-900 transition p-1 rounded"
                            title="View Payment Receipt"
                          >
                            <Newspaper size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {/* Pagination buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className={`px-4 py-2 rounded ${
                  page === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Previous
              </button>
              <button
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
                className={`px-4 py-2 rounded ${
                  !hasMore
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PurchasesPage;
