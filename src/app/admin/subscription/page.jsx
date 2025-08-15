"use client";
import { useState } from "react";
import Layout from "@/components/Layout";
import PlanDisplay from "./PlanDisplay";

const PlanCardPreview = ({ plan }) => {
  if (!plan) return null;

  // console.log("Data", plan);
  const features = plan.features || [];
  const missing = plan.missing || [];
  const credits = plan.credits || "";

  return (
    <div className="mt-8 mx-auto">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="font-semibold text-lg mb-1">
          {plan.name || "Plan Name"}
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
          {credits && (
            <li className="flex items-center gap-2">
              <span className="text-green-600">✔</span>
              <span>{credits} Credits</span>
            </li>
          )}
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-green-600">✔</span>
              <span>{f}</span>
            </li>
          ))}
          {missing.map((m, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-red-500">✖</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const initialState = {
  name: "",
  description: "",
  price: "",
  billing_cycle: "monthly",
  stripe_price_id: "",
  credits: "",
  features: [],
  missing: [],
};

const PlanForm = ({ onSave, onClose }) => {
  const [form, setForm] = useState(initialState);
  const [featureInput, setFeatureInput] = useState("");
  const [missingInput, setMissingInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  const addMissing = () => {
    if (missingInput.trim()) {
      setForm({ ...form, missing: [...form.missing, missingInput.trim()] });
      setMissingInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm(initialState);
    onClose();
  };

  console.log(form)

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => {
          e.stopPropagation(); // prevent modal close on form click
          handleSubmit(e);
        }}
        className="bg-white max-w-xl w-full p-6 rounded shadow relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-2">Create New Plan</h2>
        <p className="text-gray-500 mb-4 text-sm">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Reprehenderit incidunt natus quisquam.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            name="name"
            placeholder="Enter plan name"
            value={form.name}
            onChange={handleChange}
            className="w-1/2 border px-2 py-1 rounded"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Enter plan price"
            value={form.price}
            onChange={handleChange}
            className="w-1/2 border px-2 py-1 rounded"
            required
          />
        </div>
        <div className="mb-3">
          <textarea
            name="description"
            placeholder="Enter plan description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            rows={2}
            required
          />
        </div>
        <div className="flex gap-2 mb-3">
          <select
            name="credits"
            value={form.credits}
            onChange={handleChange}
            className="w-1/2 border px-2 py-1 rounded"
          >
            <option value="">Select Credits</option>
            <option value="10">10 Credits</option>
            <option value="50">50 Credits</option>
            <option value="100">100 Credits</option>
            <option value="1000">1000 Credits</option>
          </select>
          <select
            name="billing_cycle" // <-- snake_case
            value={form.billing_cycle}
            onChange={handleChange}
            className="w-1/2 border px-2 py-1 rounded"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Enter feature"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
          <button
            type="button"
            onClick={addFeature}
            className="bg-gray-200 px-3 rounded"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Enter Missing"
            value={missingInput}
            onChange={(e) => setMissingInput(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
          <button
            type="button"
            onClick={addMissing}
            className="bg-gray-200 px-3 rounded"
          >
            Add
          </button>
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="stripe_price_id" // <-- snake_case
            placeholder="Enter Stripe Price ID"
            value={form.stripe_price_id}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded font-semibold"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          &times;
        </button>
      </form>
    </div>
  );
};

const Page = () => {
  const [createdPlan, setCreatedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (plan) => {
    setCreatedPlan(plan);
  };

  return (
    <Layout>
      <div className="relative">
        {isModalOpen && (
          <PlanForm onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        )}
        <PlanCardPreview plan={createdPlan} />
        <PlanDisplay />
      </div>
    </Layout>
  );
};

export default Page;
