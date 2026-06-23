"use client";

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
}

export function PieChartComponent({ data, size = 200 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={size}>
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={size / 2 - 20}
          innerRadius={size / 2 - 50}
          dataKey="value"
          strokeWidth={2}
          stroke="var(--surface)"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
          }}
        />
      </RePieChart>
    </ResponsiveContainer>
  );
}
