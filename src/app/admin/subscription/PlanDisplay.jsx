import {
  Award,
  CheckCircleIcon,
  Crown,
  Gem,
  Medal,
  Palette,
  Trash2,
  XCircleIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import UpdatePlane from "../../../components/UpdatePlane";
import {
  DocumentIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/supabase/createClient";

const initialState = {
  name: "",
  price: "",
  description: "",
  billing_cycle: "monthly",
  stripe_price_id: "",
  credits: "",
  features: [],
  highlight: true,
};

console.log(initialState);

const PlanPreview = ({ plan }) => {
  if (!plan) return null;
  return (
    <div className="mt-6 mb-8 mx-auto max-w-lg">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="font-semibold text-lg mb-1">
          {plan?.name || "Plan Name"}
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold">₹{plan.price || "0"}</span>
          <span className="text-gray-500 font-semibold text-base">
            / {plan?.billing_cycle === "yearly" ? "year" : "month"}
          </span>
        </div>
        <div className="mb-3 text-gray-700">
          {plan?.description || "Plan description."}
        </div>
        <hr className="my-3" />
        <ul className="space-y-1 mb-2">
          {plan.credits && (
            <li className="flex items-center gap-2">
              <span className="text-green-600">✔</span>
              <span>{plan.credits} Credits</span>
            </li>
          )}
          {plan.features?.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-green-600">✔</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const AddPlanModal = ({ open, onClose, onSave, existingPlans = [] }) => {
  const [form, setForm] = useState(initialState);
  const [featureInput, setFeatureInput] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setShow(true);
      setError("");
      setForm(initialState);
      setFeatureInput("");
    } else {
      setShow(false);
      setError("");
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addFeature = () => {
    if (form.features.length >= 2) {
      toast.error("Maximum only 2 features can be added");
      return;
    }
    if (featureInput.trim()) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (idx) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSave(form);
      setForm(initialState);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  if (!open && !show) return null;

  const planOptions = [
    {
      label: "Control-Hub Bronze",
      value: "Control-Hub Bronze",
      icon: <Award className="w-4 h-4 text-amber-700" />,
    },
    {
      label: "Control-Hub Silver",
      value: "Control-Hub Silver",
      icon: <Medal className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Control-Hub Gold",
      value: "Control-Hub Gold",
      icon: <Crown className="w-4 h-4 text-yellow-500" />,
    },
    {
      label: "Control-Hub Platinum",
      value: "Control-Hub Platinum",
      icon: <Gem className="w-4 h-4 text-cyan-500" />,
    },
  ];
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl border border-cyan-200 shadow-xl w-[900px] max-w-full px-8 py-8 flex flex-row gap-8 items-start animate-fadeInUp`}
        style={{
          minHeight: 520,
          transition: "transform 0.3s cubic-bezier(.4,2,.6,1), opacity 0.3s",
          transform: open ? "translateY(0)" : "translateY(40px)",
          opacity: open ? 1 : 0,
        }}
      >
        <button
          className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
        >
          &times;
        </button>
        {/* Preview Side */}
        <div className="w-1/2">
          <PlanPreview plan={form} />
        </div>
        {/* Form Side */}
        <div className="w-1/2">
          <div className="text-xl font-bold mb-2 text-cyan-700">
            Create New Plan
          </div>
          <p className="text-gray-500 mb-6 text-sm">
            Add a new subscription plan for your users.
          </p>
          {error && (
            <div className="mb-4 text-red-600 font-semibold">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {/* <select
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-1/2 border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400 font-semibold"
                required
                disabled={loading}
              >
                <option value="">Select Plan</option>
                {planOptions.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select> */}

              <select
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-1/2 border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400 font-semibold"
                required
                disabled={loading}
              >
                <option value="">Select Plan</option>
                {planOptions.map((plan) => {
                  const isExisting = existingPlans.some(
                    (existing) => existing.name === plan.value
                  );

                  return (
                    <option
                      key={plan.value}
                      value={plan.value}
                      disabled={isExisting}
                    >
                      {plan.label} {isExisting ? "(Already created)" : ""}
                    </option>
                  );
                })}
              </select>

              {/* Price Input */}
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                className="w-1/2 border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400 font-semibold"
                required
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>
            <textarea
              name="description"
              placeholder="Plan description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400"
              rows={2}
              required
              disabled={loading}
            />
            <div className="flex gap-2">
              <select
                name="credits"
                value={form.credits}
                onChange={handleChange}
                className="w-1/2 border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400"
                disabled={loading}
              >
                <option value="">Select Credits</option>
                <option value="10">10 uploads per month</option>
                <option value="20">20 uploads per month</option>
                <option value="30">30 uploads per month</option>
                <option value="100">100 uploads per month</option>
              </select>
              <select
                name="billing_cycle"
                value={form.billing_cycle}
                onChange={handleChange}
                className="w-1/2 border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400"
                disabled={loading}
                required
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            {/* Features input and preview */}
            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add feature"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  className="w-full border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-cyan-100 text-cyan-700 px-4 rounded font-semibold hover:bg-cyan-200"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <ul className="mb-2 flex flex-wrap gap-2">
                {form.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-1 text-gray-700 bg-cyan-50 px-2 py-1 rounded"
                  >
                    <span className="text-cyan-400">✔</span>
                    <span>{f}</span>
                    <button
                      type="button"
                      className="ml-1 text-red-500 hover:text-red-700"
                      onClick={() => removeFeature(i)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <input
              type="text"
              name="stripe_price_id"
              placeholder="Stripe Price ID"
              value={form.stripe_price_id}
              onChange={handleChange}
              className="w-full border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400"
              required
              disabled={loading}
            />
            {/* <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="highlight"
                checked={form.highlight} // boolean value
                onChange={
                  (e) => setForm({ ...form, highlight: e.target.checked }) // updates boolean
                }
                className="w-4 h-4 text-cyan-400 border-cyan-200 rounded focus:ring-cyan-400"
                disabled={loading}
              />
              <label htmlFor="highlight" className="text-gray-700 font-medium">
                Is Active
              </label>
            </div> */}

            <button
              type="submit"
              className={`w-full py-2 rounded font-semibold transition ${
                loading
                  ? "bg-cyan-300 text-white cursor-not-allowed"
                  : "bg-cyan-400 text-white hover:bg-cyan-500"
              }`}
              style={{ minHeight: "44px" }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Plan"}
            </button>
          </form>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s cubic-bezier(0.4, 2, 0.6, 1);
        }
      `}</style>
    </div>
  );
};

const DeleteConfirmPopup = ({ open, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px] flex flex-col items-center">
        <Trash2 className="text-red-500 mb-3 animate-bounce" size={36} />
        <div className="text-lg font-semibold mb-2 text-gray-800">
          Delete this plan?
        </div>
        <div className="text-gray-500 mb-6 text-center">
          Are you sure you want to delete this plan? This action cannot be
          undone.
        </div>
        <div className="flex gap-4">
          <button
            className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function truncateText(text, maxLength = 20) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
function truncateDesc(text, maxLength = 100) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

const PlanCard = ({
  id,
  name,
  price,
  billing_cycle,
  features = [],
  credits = "",
  highlight = false,
  buttonText = "Update Plan",
  onClick,
  currency = "₹",
  highlightText = "",
  description = "",
  onDelete,
}) => (
  <div
    className={`relative flex flex-col items-center bg-white rounded-2xl border border-gray-200 shadow px-4 pt-6 pb-8 w-60 min-h-[450px] mb-8 transition hover:shadow-lg`}
  >
    {/* Delete Icon */}
    <button
      className="absolute top-3 right-3 p-2 rounded-full bg-red-50 hover:bg-red-200 transition-transform duration-200 hover:scale-110 group"
      title="Delete Plan"
      onClick={() => onDelete && onDelete(id)}
      style={{ zIndex: 2 }}
    >
      <Trash2 className="text-red-500 group-hover:animate-bounce" size={20} />
    </button>

    <div className="w-full flex-1 flex flex-col">
      <div className="text-xl font-semibold mb-2 h-[3.5rem] w-[10.5rem]">
        {name}
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-3xl font-bold">
          {currency}
          {price}
        </span>
        <span className="text-gray-500 font-medium text-base">
          / {billing_cycle}
        </span>
      </div>
      <div className="text-gray-700 text-sm mb-5 whitespace-break-spaces">
        {truncateDesc(description)}
      </div>
      <ul className="mb-4 space-y-3 flex-1 w-full">
        {features &&
          features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="text-cyan-400">✔</span>
              <span>{truncateText(f)}</span>
            </li>
          ))}

        {credits && (
          <li className="flex items-start gap-2 text-gray-700">
            <span className="text-green-600">✔</span>
            <span>{credits} Credits</span>
          </li>
        )}
      </ul>
    </div>
    <button
      className="w-full py-2 rounded font-semibold transition bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
      onClick={onClick}
      style={{ minHeight: "44px" }}
    >
      {buttonText}
    </button>
  </div>
);

const PlanDisplay = () => {
  const [showModal, setShowModal] = useState(false);
  const [plane, setPlane] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add these for update modal loading/error
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Handler to call your Supabase Edge function to create a plan
  const handleSavePlan = async (planData) => {
    const response = await fetch(
      "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/create-plane",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGdhb3dvaWd6YXhxaGd1Z3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTc4NTQsImV4cCI6MjA2OTc3Mzg1NH0.jUgNeUFEHlOMRzeQpXXX3mEv_Wdr7rxUlfJjTFYVgyM",
        },
        body: JSON.stringify({
          name: planData.name,
          price: Number(planData.price),
          description: planData?.description,
          billing_cycle: planData.billing_cycle,
          stripe_price_id: planData?.stripe_price_id,
          features: planData?.features,
          credits: planData.credits,
          highlight: planData.highlight,
        }),
      }
    );

    console.log(planData);

    if (!response.ok) {
      let errMsg = "Failed to create plan";
      try {
        const errData = await response.json();
        if (errData?.error) errMsg = errData.error;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();
    toast.success("Plan created successfully!");
  };

const handleDeletePlan = async (id) => {
  setDeleting(true);

  try {
    // Find the plan by id to get its name
    const plan = plane.find(p => p.id === id);
    if (!plan) {
      toast.error("Plan not found");
      setDeleting(false);
      return;
    }
    const planName = plan.name;

    // Get all purchases with this plan_name
    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("status")
      .eq("plan_name", planName);

    if (error) throw error;

    // Check if any purchase has status 'active'
    const hasActive = purchases.some(p => p.status === "active");

    if (hasActive) {
      toast.error("This plan is currently active for one or more users and cannot be deleted.");
      setDeleting(false);
      return;
    }

    // If no active users, proceed to delete
    setDeleteId(id);
    await confirmDeletePlan();
  } catch (err) {
    toast.error(err.message || "Failed to check plan activity");
  } finally {
    setDeleting(false);
  }
};


  const confirmDeletePlan = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(
        "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/delete-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGdhb3dvaWd6YXhxaGd1Z3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTc4NTQsImV4cCI6MjA2OTc3Mzg1NH0.jUgNeUFEHlOMRzeQpXXX3mEv_Wdr7rxUlfJjTFYVgyM",
          },
          body: JSON.stringify({ id: deleteId }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete plan");
      }
      setPlane((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Plan deleted!");
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setDeleting(false);
    }
  };

  // Handler to call your Supabase Edge function to update a plan
  const handleUpdatePlan = async (planData) => {
    setUpdating(true);
    setUpdateError("");
    try {
      const response = await fetch(
        "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/update-plane",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGdhb3dvaWd6YXhxaGd1Z3hyIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTQxOTc4NTQsImV4cCI6MjA2OTc3Mzg1NH0.jUgNeUFEHlOMRzeQpXXX3mEv_Wdr7rxUlfJjTFYVgyM",
          },
          body: JSON.stringify({
            id: planData.id,
            name: planData.name,
            price: Number(planData.price),
            description: planData?.description,
            billing_cycle: planData.billing_cycle,
            stripe_price_id: planData?.stripe_price_id,
            features: planData?.features,
            credits: planData.credits,
          }),
        }
      );

      setPlane((prev) =>
        prev.map((p) => (p.id === planData.id ? { ...p, ...planData } : p))
      );
      toast.success("Plan updated successfully!");
      setShowUpdate(false);
    } catch (err) {
      setUpdateError(err.message || "Failed to update plan");
    } finally {
      setUpdating(false);
    }
  };

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
      setPlane(Array.isArray(data?.user) ? data.user : []);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* Button Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Service Plan Management
          </h1>
          <p className="text-gray-500 mb-6">Manage your service plans</p>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          Create New Plan
        </button>
      </div>

      {/* Plan Cards */}
      <div className=" flex flex-wrap justify-start items-center gap-4 mb-10">
        {plane.map((plan) => (
          <PlanCard
            key={plan.id}
            {...plan}
            onDelete={handleDeletePlan}
            onClick={() => {
              setSelectedPlan(plan);
              setShowUpdate(true);
            }}
            buttonText="Update Plan"
          />
        ))}
      </div>

      {/* Modal */}
      <AddPlanModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSavePlan}
        existingPlans={plane}
      />

      {/* Delete Confirmation Popup */}
      <DeleteConfirmPopup
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDeletePlan}
      />
      {/* Update Plan Modal with animation and blur */}
      {showUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred background */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowUpdate(false)}
          />
          {/* Animated modal */}
          <div
            className="relative animate-fadeInUp"
            style={{
              zIndex: 60,
              minWidth: 500,
              maxWidth: 900,
              width: "100%",
            }}
          >
            <UpdatePlane
              open={showUpdate}
              onClose={() => setShowUpdate(false)}
              initialData={selectedPlan}
              onUpdate={handleUpdatePlan}
              loading={updating}
              error={updateError}
            />
          </div>
          {/* Animation keyframes */}
          <style jsx global>{`
            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(40px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fadeInUp {
              animation: fadeInUp 0.4s cubic-bezier(0.4, 2, 0.6, 1);
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PlanDisplay;
