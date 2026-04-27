"use client";

import { useTheme } from "@/components/ThemeProvider";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";

type DailyPoint = { date: string; calories: number };
type WeightPoint = { date: string; weight: number };

export function DailyCalorieChart({ data }: { data: DailyPoint[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`h-72 rounded-2xl p-4 shadow-sm ring-1 ${isDark ? "bg-gray-900/70 ring-white/10" : "bg-white ring-emerald-100"}`}>
      <h3 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Daily Calories</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#404854" : "#e2e8f0"} />
          <XAxis dataKey="date" stroke={isDark ? "#9ca3af" : "#64748b"} />
          <YAxis stroke={isDark ? "#9ca3af" : "#64748b"} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: isDark ? "#f3f4f6" : "#1f2937",
            }}
          />
          <Area type="monotone" dataKey="calories" stroke="#059669" fillOpacity={1} fill="url(#colorCalories)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MacroBreakdownChart({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const data = [
    { name: "Protein", value: protein, color: "#10b981" },
    { name: "Carbs", value: carbs, color: "#0ea5e9" },
    { name: "Fat", value: fat, color: "#f59e0b" },
  ];

  return (
    <div className={`h-72 rounded-2xl p-4 shadow-sm ring-1 ${isDark ? "bg-gray-900/70 ring-white/10" : "bg-white ring-emerald-100"}`}>
      <h3 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Macro Breakdown (g)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={95} innerRadius={55}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: isDark ? "#f3f4f6" : "#1f2937",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeightTrendChart({ data }: { data: WeightPoint[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`h-72 rounded-2xl p-4 shadow-sm ring-1 ${isDark ? "bg-gray-900/70 ring-white/10" : "bg-white ring-emerald-100"}`}>
      <h3 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Weight Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#404854" : "#e2e8f0"} />
          <XAxis dataKey="date" stroke={isDark ? "#9ca3af" : "#64748b"} />
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke={isDark ? "#9ca3af" : "#64748b"} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: isDark ? "#f3f4f6" : "#1f2937",
            }}
          />
          <Line type="monotone" dataKey="weight" stroke={isDark ? "#60a5fa" : "#0f172a"} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
