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
        <button
          onClick={() => onAddFood(mealType)}
          className="w-full rounded-2xl border border-dashed border-emerald-300/50 bg-emerald-50/50 p-4 text-center transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-700/30 dark:bg-emerald-900/10 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20"
        >
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Add your first {mealType} item</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tap to search and add food</p>
        </button>
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
