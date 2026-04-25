"use client";

import { useMemo } from "react";
import { FoodSearchModal } from "@/components/FoodSearchModal";
import { GlassCard } from "@/components/GlassCard";
import { MealSection } from "@/components/MealSection";
import { MEAL_TYPES, MealType } from "@/lib/types";
import { useDiary } from "@/hooks/useDiary";
import { useFoodModalStore } from "@/store/foodModalStore";

export default function DiaryPage() {
  const { data, loading, refresh } = useDiary();
  const { isOpen, mealType, open, close } = useFoodModalStore();

  const grouped = useMemo(() => {
    const map: Record<MealType, NonNullable<typeof data>["entries"]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    if (!data) return map;
    for (const entry of data.entries) {
      map[entry.mealType].push(entry);
    }
    return map;
  }, [data]);

  const onQuantityChange = async (id: string, quantity: number) => {
    await fetch(`/api/diary/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await refresh();
  };

  const onRemove = async (id: string) => {
    await fetch(`/api/diary/${id}`, { method: "DELETE" });
    await refresh();
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-4" interactive>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Diary</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {loading ? "Loading..." : `${Math.round(data?.totals.calories || 0)} kcal today · Target ${data?.target || 0}`}
        </p>
      </GlassCard>

      {MEAL_TYPES.map((type) => (
        <MealSection
          key={type}
          mealType={type}
          entries={grouped[type] || []}
          onAddFood={open}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}

      <FoodSearchModal open={isOpen} mealType={mealType} onClose={close} onAdded={refresh} />
    </div>
  );
}
