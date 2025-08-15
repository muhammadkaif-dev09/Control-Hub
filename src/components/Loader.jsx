"use client";
export default function Loader({ size = "6", color = "border-white" }) {
  return (
    <div
      className={`w-${size} h-${size} border-2 ${color} border-t-transparent rounded-full animate-spin`}
    ></div>
  );
}
