"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { WeightTrendChart } from "@/components/Charts";

type WeightLog = {
  id: string;
  weight: number;
  date: string;
  displayDate: string;
};

type WeightData = {
  logs: WeightLog[];
  currentWeight: number;
};

export default function WeightPage() {
  const [data, setData] = useState<WeightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/weight?limit=30", { cache: "no-store" });
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setSaving(true);
    setError("");

    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: Number(weight), date }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not save weight.");
      return;
    }

    setWeight("");
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/weight/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchData();
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-600 dark:text-gray-300">Loading weight data...</p>;
  }

  const chartData = data?.logs.map((log) => ({
    date: log.displayDate,
    weight: log.weight,
  })) || [];

  const startWeight = data?.logs[0]?.weight || data?.currentWeight || 0;
  const currentWeight = data?.logs[data.logs.length - 1]?.weight || data?.currentWeight || 0;
  const weightChange = currentWeight - startWeight;

  return (
    <div className="space-y-4">
      <GlassCard className="p-5" interactive>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Weight Tracking</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Track your weight progress over time
        </p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4" interactive>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Weight</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {currentWeight.toFixed(1)} kg
          </p>
        </GlassCard>
        <GlassCard className="p-4" interactive>
          <p className="text-sm text-gray-500 dark:text-gray-400">Starting Weight</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {startWeight.toFixed(1)} kg
          </p>
        </GlassCard>
        <GlassCard className="p-4" interactive>
          <p className="text-sm text-gray-500 dark:text-gray-400">Change</p>
          <p className={`text-2xl font-semibold ${weightChange < 0 ? "text-emerald-600 dark:text-emerald-400" : weightChange > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-gray-100"}`}>
            {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
          </p>
        </GlassCard>
      </div>

      {chartData.length > 1 && (
        <WeightTrendChart data={chartData} />
      )}

      <GlassCard className="p-5" interactive>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Log Weight</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Weight (kg)
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70.5"
                className="mt-1 min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
                required
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
              />
            </label>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Log Weight"}
          </button>
        </form>
      </GlassCard>

      {data && data.logs.length > 0 && (
        <GlassCard className="p-5" interactive>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Weight History</h2>
          <div className="space-y-2">
            {[...data.logs].reverse().slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/55 p-3 shadow-sm backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-gray-900/55"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{log.weight.toFixed(1)} kg</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{log.displayDate}</p>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-rose-100 hover:text-rose-500 dark:hover:bg-rose-900/30"
                  aria-label="Delete weight log"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
