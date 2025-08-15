// RegistrationTrendsChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jul 24", total: 2 },
  { name: "Jul 25", total: 4 },
  { name: "Jul 26", total: 8 },
  { name: "Jul 27", total: 14 },
  { name: "Jul 28", total: 18 },
  { name: "Jul 29", total: 21 },
  { name: "Jul 30", total: 30 },
];

export default function RegistrationTrendsChart() {
  return (
    <div className="bg-white shadow rounded-lg p-5">
      <h4 className="font-semibold mb-4">Registration Trends</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}