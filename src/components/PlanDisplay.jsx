"use client";
import { useState, useEffect } from "react";
import PlanCard from "./PlanCard"; // adjust path if needed

const PlanDisplay = ({ onSelect, activePlans = [] }) => {
  const [plans, setPlans] = useState([]);

  console.log(plans)

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/fetch-all-planes",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGdhb3dvaWd6YXhxaGd1Z3hyIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTQxOTc4NTQsImV4cCI6MjA2OTc3Mzg1NH0.jUgNeUFEHlOMRzeQpXXX3mEv_Wdr7rxUlfJjTFYVgyM",
          },
        }
      );
      const data = await response.json();
      setPlans(Array.isArray(data?.user) ? data.user : []);
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-wrap justify-start items-center gap-4 overflow-auto h-auto">
      {plans.map((plan) => {
        const isOwned = activePlans.includes(plan.name); // assuming plan.name is unique

        return (
          <PlanCard
            key={plan.id}
            {...plan}
            buttonText={isOwned ? "Already Purchased" : "Select Plan"}
            disabled={isOwned}
            onClick={() => {
              if (!isOwned) onSelect(plan);
            }}
          />
        );
      })}
    </div>
  );
};

export default PlanDisplay;
