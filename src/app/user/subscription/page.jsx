"use client";
import PlanDisplay from "../../../components/PlanDisplay";
import UserLayout from "@/components/UserLayout";
const Page = () => {
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  return (
    <UserLayout>
      <h1 className="text-3xl font-semibold text-gray-800 mb-1">
       Available Plans
      </h1>
      <p className="text-gray-500 mb-6">Select the plane and increase the upload limit</p>
      <div className="relative">
        <PlanDisplay onSelectPlan={handleSelectPlan} />
      </div>
    </UserLayout>
  );
};

export default Page;
