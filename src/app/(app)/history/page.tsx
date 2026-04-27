"use client";

import { useEffect, useState } from "react";
import { DailyCalorieChart, MacroBreakdownChart, WeightTrendChart } from "@/components/Charts";
import { CardSkeleton, ChartSkeleton } from "@/components/LoadingSkeleton";

type HistoryResponse = {
  dailyCalories: Array<{ date: string; calories: number }>;
  weeklyAverage: number;
  macroTotals: { protein: number; carbs: number; fat: number };
  weights: Array<{ date: string; weight: number }>;
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/history", { cache: "no-store" });
      if (res.ok) {
        setData(await res.json());
      }
    };
    load();
  }, []);

  if (!data) {
    return (
      <div className="space-y-4">
        <section className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </section>
        <ChartSkeleton />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm text-slate-500">Weekly average</p>
          <p className="text-3xl font-semibold text-slate-900">{Math.round(data.weeklyAverage)} kcal</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm text-slate-500">Days tracked</p>
          <p className="text-3xl font-semibold text-slate-900">{data.dailyCalories.length}</p>
        </div>
      </section>

      <DailyCalorieChart data={data.dailyCalories} />
      <div className="grid gap-4 lg:grid-cols-2">
        <MacroBreakdownChart
          protein={data.macroTotals.protein}
          carbs={data.macroTotals.carbs}
          fat={data.macroTotals.fat}
        />
        <WeightTrendChart data={data.weights} />
      </div>
    </div>
  );
}
