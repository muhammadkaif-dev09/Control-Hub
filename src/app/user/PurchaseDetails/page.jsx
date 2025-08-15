"use client";

import { Loader2, Newspaper } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserProvider";
import { supabase } from "@/supabase/createClient";
import PlanDisplay from "@/components/PlanDisplay";
import toast from "react-hot-toast";

export default function PurchaseDetails() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const userId = user?.id;

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  console.log(purchases);

  const updateExpiredPlans = async (plans) => {
    const now = new Date();

    for (const plan of plans) {
      const expiry = new Date(plan.expiry_date);
      if (
        expiry < now &&
        plan.status !== "expired" &&
        plan.status !== "cancelled"
      ) {
        // Update status to expired
        const { error } = await supabase
          .from("purchases")
          .update({ status: "expired" })
          .eq("id", plan.id);

        if (error) {
          console.error("Failed to update expired status:", error.message);
        }
      }
    }
  };

  const fetchPurchases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("Error fetching purchases:", error.message);
    } else {
      // Update expired status on the fly
      await updateExpiredPlans(data);
      // Fetch again after update to get fresh data
      const { data: refreshedData, error: refreshedError } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false });

      if (!refreshedError) {
        setPurchases(refreshedData);
      }
    }
    setLoading(false);
  };

  // fetch purchases
  // const fetchPurchases = async () => {
  //   setLoading(true);
  //   const { data, error } = await supabase
  //     .from("purchases")
  //     .select("*")
  //     .eq("user_id", userId)
  //     .order("payment_date", { ascending: false });

  //   if (error) {
  //     console.error("Error fetching purchases:", error.message);
  //   } else {
  //     setPurchases(data);
  //   }
  //   setLoading(false);
  // };

  useEffect(() => {
    if (userId) fetchPurchases();
  }, [userId]);

  // Making the user account zero when user cancel the last plan
  // const handleCancel = async (id) => {
  //   const activePlans = purchases.filter((p) => {
  //     const expiry = new Date(p.expiry_date);
  //     const now = new Date();
  //     return expiry >= now && p.status.toLowerCase() !== "cancelled";
  //   });

  //   const isOnlyActivePlan = activePlans.length === 1;

  //   let proceed = true;

  //   if (isOnlyActivePlan) {
  //     proceed = window.confirm(
  //       "This is your only active plan. If you cancel it, your remaining credits will be reset to 0. Do you want to proceed?"
  //     );
  //   }

  //   if (!proceed) return;

  //   const cancelDate = new Date().toISOString().split("T")[0];

  //   // 1. Cancel the plan (update expiry_date and optionally status)
  //   const { error: updateError } = await supabase
  //     .from("purchases")
  //     .update({
  //       status: "cancelled",
  //       expiry_date: cancelDate,
  //     })
  //     .eq("id", id);

  //   if (updateError) {
  //     console.error("Failed to cancel the plan:", updateError.message);
  //     alert("Failed to cancel the subscription. Please try again.");
  //     return;
  //   }

  //   // 2. If only plan, reset user's credits to 0
  //   if (isOnlyActivePlan && user?.id) {
  //     const { error: creditError } = await supabase
  //       .from("user_profiles")
  //       .update({ remainingCredits: 0 })
  //       .eq("id", user.id);

  //     if (creditError) {
  //       console.error("Failed to reset credits:", creditError.message);
  //       alert("Plan cancelled, but failed to reset credits.");
  //     }
  //   }

  //   alert("Subscription cancelled successfully.");
  //   fetchPurchases();
  // };

  // Cancel the plan only, credit are still remaining
  const handleCancel = async (id) => {
    const activePlans = purchases.filter((p) => {
      const expiry = new Date(p.expiry_date);
      const now = new Date();
      return expiry >= now && p.status.toLowerCase() !== "cancelled";
    });

    // You no longer need to warn about resetting credits,
    // so you can remove this check or keep just a simple confirmation if you want.
    let proceed = true;
    // Optionally, if you want a simple confirmation on canceling any plan:
    proceed = window.confirm(
      "Are you sure you want to cancel this subscription?"
    );

    if (!proceed) return;

    const cancelDate = new Date().toISOString().split("T")[0];

    // Cancel the plan (update expiry_date and status)
    const { error: updateError } = await supabase
      .from("purchases")
      .update({
        status: "cancelled",
        expiry_date: cancelDate,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to cancel the plan:", updateError.message);
      alert("Failed to cancel the subscription. Please try again.");
      return;
    }

    // Removed resetting user credits entirely!

    alert("Subscription cancelled successfully.");
    fetchPurchases();
  };

  const handleUpgrade = (id) => {
    console.log("Upgrade clicked for ID:", id);
    setShowSubscribeModal(true);
  };

  const handleViewReceipt = (receiptUrl) => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank");
    } else {
      alert("No receipt available.");
    }
  };

  const handlePlanSelect = async (plan) => {
    setShowSubscribeModal(false);

    toast.success(
      `Redirecting to upgrade with plan: ${plan?.name || plan?.title}`
    );

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          userId: userId,
          name: plan?.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout session creation failed.");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      toast.error("Something went wrong initiating payment.");
    }
  };

  // --- UI ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  // Get active plan names
  const activePlanNames = purchases
    .filter((p) => {
      const expiry = new Date(p.expiry_date);
      const now = new Date();
      return expiry >= now && p.status.toLowerCase() !== "cancelled";
    })
    .map((p) => p.plan_name); // assuming you store plan name in this field

  return (
    <div className="purchase-details mt-4 p-4 rounded bg-white shadow-sm mx-auto">
      <h3 className="mb-3 font-semibold text-gray-800 text-xl">
        Purchase Details
      </h3>
      {purchases.length === 0 ? (
        <p>No purchases found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Plan Name</th>
                <th className="px-4 py-2 text-left">Payment Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Credits</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Expires</th>
                <th className="px-4 py-2 text-left">Receipt</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {purchases.map(
                (
                  {
                    id,
                    plan_name,
                    payment_date,
                    amount_paid,
                    status,
                    credit,
                    expiry_date,
                    paymentReceipt,
                  },
                  index
                ) => {
                  const now = new Date();
                  const expiry = new Date(expiry_date);
                  const displayStatus = expiry < now ? "expired" : "active";

                  return (
                    <tr key={id} className="odd:bg-white even:bg-gray-50">
                      <td className="px-4 py-2">{index + 1}</td>

                      <td
                        className="px-4 py-2 max-w-[160px] truncate whitespace-nowrap overflow-hidden"
                        title={plan_name}
                      >
                        {plan_name}
                      </td>

                      <td className="px-4 py-2">
                        {new Date(payment_date).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-2">
                        ₹{Number(amount_paid).toFixed(2)}
                      </td>

                      <td className="px-4 py-2">{credit}</td>

                      <td className="px-4 py-2 capitalize">{status}</td>

                      <td className="px-4 py-2">
                        {expiry.toLocaleDateString()}
                      </td>

                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleViewReceipt(paymentReceipt)}
                          className="text-gray-600 hover:text-gray-900 transition p-1 rounded"
                          title="View Payment Receipt"
                        >
                          <Newspaper size={18} />
                        </button>
                      </td>

                      <td className="px-4 py-2">
                        {displayStatus === "active" && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleCancel(id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                            >
                              Cancel
                            </button>
                            {index === 0 && (
                              <button
                                onClick={() => handleUpgrade(id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                              >
                                Upgrade
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Show Plan Display */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg max-w-3xl h-[37rem] w-full p-6 pl-[3rem] relative overflow-auto">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-2">
              Upgrade your subscription
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose a new plan to continue using our services.
            </p>

            <PlanDisplay
              onSelect={handlePlanSelect}
              activePlans={activePlanNames}
            />
          </div>
        </div>
      )}
    </div>
  );
}
