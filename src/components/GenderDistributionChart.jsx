"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

function getGenderCounts(genderData = []) {
  const counts = { Male: 0, Female: 0, Other: 0 };
  genderData.forEach(({ gender }) => {
    if (gender === "Male") counts.Male++;
    else if (gender === "Female") counts.Female++;
    else counts.Other++;
  });
  return [
    { name: "Male", value: counts.Male },
    { name: "Female", value: counts.Female },
    { name: "Other", value: counts.Other },
  ];
}

export default function GenderDistributionChart({ genderData = [] }) {
  const data = getGenderCounts(genderData);
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="mb-8">
        <h4 className="text-2xl text-black tracking-tight">
          Gender Distribution
        </h4>
        <span className="text-zinc-400 text-sm">
          User demographics breakdown
        </span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Bottom legend with colored dots */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-zinc-600">Male:{Math.round((data[0].value / total) * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span>
          <span className="text-zinc-600">Female:{Math.round((data[1].value / total) * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
          <span className="text-zinc-500">Other:{Math.round((data[2].value / total) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
