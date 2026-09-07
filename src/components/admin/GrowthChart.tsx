"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GrowthChartProps {
  data: { date: string; nya: number; avslutade: number }[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4a3a2c" />
        <XAxis dataKey="date" stroke="#c9bba3" fontSize={12} tickMargin={8} />
        <YAxis stroke="#c9bba3" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#241c17",
            border: "1px solid #4a3a2c",
            borderRadius: 4,
            color: "#f1e8d8",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#c9bba3" }} />
        <Line type="monotone" dataKey="nya" name="Nya medlemmar" stroke="#d9b667" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="avslutade" name="Avslutade konton" stroke="#a8556b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
