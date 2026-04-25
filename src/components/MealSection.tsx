"use client";

import { DiaryEntryDTO, MealType } from "@/lib/types";
import { DiaryFoodItem } from "@/components/DiaryFoodItem";
import { GlassCard } from "@/components/GlassCard";

type MealSectionProps = {
  mealType: MealType;
  entries: DiaryEntryDTO[];
  onAddFood: (mealType: MealType) => void;
  onQuantityChange: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

const LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

export function MealSection({ mealType, entries, onAddFood, onQuantityChange, onRemove }: MealSectionProps) {
  const mealCalories = entries.reduce((sum, entry) => sum + entry.food.calories * entry.quantity, 0);

  return (
    <GlassCard className="space-y-3 p-4" interactive>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{LABELS[mealType]}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round(mealCalories)} kcal</p>
        </div>
        <button
          onClick={() => onAddFood(mealType)}
          className="min-h-11 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Quick add food
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/25 bg-white/50 p-3 text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-400">No foods logged yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <DiaryFoodItem key={entry.id} entry={entry} onQuantityChange={onQuantityChange} onRemove={onRemove} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
