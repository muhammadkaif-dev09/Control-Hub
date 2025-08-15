"use client";
const PlanCard = ({
  name,
  price,
  billing_cycle,
  features = [],
  credits = "",
  buttonText = "Select Plan",
  onClick,
  currency = "₹",
  description = "",
}) => (
  <div className="relative flex flex-col items-center bg-white rounded-2xl border border-gray-200 shadow px-4 pt-6 pb-8 w-full max-w-xs min-h-[450px] mb-8 transition hover:shadow-lg">
    <div className="w-full flex-1 flex flex-col">
      <div className="text-xl font-semibold mb-2 h-[3.5rem] w-full truncate">
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
      <div className="text-sm mb-5">{description}</div>
      <ul className="mb-4 space-y-3 flex-1 w-full overflow-hidden max-h-[14rem]">
        {features &&
          features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="text-cyan-400">✔</span>
              <span>{f}</span>
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

export default PlanCard;
