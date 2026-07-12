"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyActivityPoint } from "@/lib/api-client/admin";

export interface ActivityChartProps {
  data: DailyActivityPoint[];
}

const dateFormatter = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" });

export function ActivityChart({ data }: ActivityChartProps) {
  const points = data.map((point) => ({
    ...point,
    label: dateFormatter.format(new Date(point.day)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 13 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend
          formatter={(value) => (value === "new_users" ? "Нові користувачі" : "Створені меню")}
          wrapperStyle={{ fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="new_users"
          stroke="#378add"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="new_menus"
          stroke="#2fa968"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
