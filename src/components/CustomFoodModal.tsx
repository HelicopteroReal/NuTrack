"use client";

import { useState } from "react";
import { BottomSheetModal } from "@/components/BottomSheetModal";

type CustomFoodModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

const INITIAL = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
  servingSize: "100 g",
};

export function CustomFoodModal({ open, onClose, onCreated }: CustomFoodModalProps) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof INITIAL, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/foods/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        calories: Number(form.calories || 0),
        protein: Number(form.protein || 0),
        carbs: Number(form.carbs || 0),
        fat: Number(form.fat || 0),
        fiber: form.fiber ? Number(form.fiber) : null,
        servingSize: form.servingSize,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not create food.");
      return;
    }

    setForm(INITIAL);
    await onCreated();
    onClose();
  };

  return (
    <BottomSheetModal open={open} onClose={onClose} title="Create custom food">
      <div className="space-y-3">
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Food name"
          className="min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.calories}
            onChange={(e) => update("calories", e.target.value)}
            placeholder="Calories"
            className="min-h-12 rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
          <input
            value={form.servingSize}
            onChange={(e) => update("servingSize", e.target.value)}
            placeholder="Serving size"
            className="min-h-12 rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
          <input
            value={form.protein}
            onChange={(e) => update("protein", e.target.value)}
            placeholder="Protein (g)"
            className="min-h-12 rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
          <input
            value={form.carbs}
            onChange={(e) => update("carbs", e.target.value)}
            placeholder="Carbs (g)"
            className="min-h-12 rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
          <input
            value={form.fat}
            onChange={(e) => update("fat", e.target.value)}
            placeholder="Fat (g)"
            className="min-h-12 rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
          <input
            value={form.fiber}
            onChange={(e) => update("fiber", e.target.value)}
            placeholder="Fiber (g)"
            className="min-h-12 rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="min-h-12 w-full rounded-2xl bg-emerald-500 px-4 py-2 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create food"}
        </button>
      </div>
    </BottomSheetModal>
  );
}
