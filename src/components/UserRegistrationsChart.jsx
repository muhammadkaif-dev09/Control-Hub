"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  }
  return days;
}

export default function UserRegistrationsChart({ regData = [] }) {
  // Count registrations per day for last 7 days
  const days = getLast7Days();
  const counts = days.map(day => {
    const count = regData.filter(r => {
      const d = new Date(r.created_at);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === day;
    }).length;
    return { name: day, users: count };
  });

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="mb-8">
        <h4 className="text-2xl text-black tracking-tight">
          User Registrations
        </h4>
        <span className="text-zinc-400 text-sm">
          Track new user signups over time
        </span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={counts}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis
            dataKey="name"
            stroke="#999"
            axisLine={{ stroke: "#999" }}
            tickLine={false}
          />
          <YAxis
            stroke="#999"
            axisLine={{ stroke: "#999" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip />
          <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
