import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const UpdatePlane = ({
  open,
  onClose,
  initialData = {},
  onUpdate,
  loading,
  error,
}) => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    billing_cycle: "monthly",
    features: [],
    stripe_price_id: "",
    ...initialData,
  });

  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    setForm({ ...form, ...initialData });
  }, [initialData]);

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
    if (onUpdate) onUpdate(form);

    const formattedData = {
      ...form,
      id: form.id,
    };

    try {
      const res = await fetch(
        "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/update-plane",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGdhb3dvaWd6YXhxaGd1Z3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTc4NTQsImV4cCI6MjA2OTc3Mzg1NH0.jUgNeUFEHlOMRzeQpXXX3mEv_Wdr7rxUlfJjTFYVgyM",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update API error:", errorText);
        return;
      }

      const result = await res.json();
      // toast.success("Plan is Updated");

      setUserData(result?.user);
    } catch (error) {
      // toast.error("Failed to update plan");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        <div className="text-xl font-bold mb-2 text-cyan-700">Update Plan</div>
        <p className="text-gray-500 mb-6 text-sm">
          Update the subscription plan details.
        </p>
        {error && (
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              name="name"
              placeholder="Plan name"
              value={form.name}
              onChange={handleChange}
              className="w-1/2 border border-cyan-200 rounded px-3 py-2 focus:outline-cyan-400 font-semibold"
              required
              disabled={loading}
            />
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
            {loading ? "Updating..." : "Update Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePlane;
