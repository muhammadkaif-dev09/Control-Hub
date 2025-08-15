"use client";
import { useState } from "react";

export default function FilterButton({ label, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-5 py-2 border border-zinc-300 cursor-pointer bg-gray-100 text-sm rounded-md"
      >
        {selected && selected !== "All" ? selected : label}
      </button>

      {open && (
        <div className="absolute mt-1 w-40 bg-white border border-zinc-300 rounded-md shadow-md z-10">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                selected === option ? "bg-blue-100 font-medium" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
