"use client";

import { DiaryEntryDTO } from "@/lib/types";

type DiaryFoodItemProps = {
  entry: DiaryEntryDTO;
  onQuantityChange: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

export function DiaryFoodItem({ entry, onQuantityChange, onRemove }: DiaryFoodItemProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/20 bg-white/55 p-3 shadow-sm backdrop-blur-xl transition-all duration-200 sm:grid-cols-[1fr_auto_auto] sm:items-center dark:border-white/10 dark:bg-gray-900/55">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{entry.food.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {Math.round(entry.food.calories * entry.quantity)} kcal · P {Math.round(entry.food.protein * entry.quantity)}g · C {Math.round(entry.food.carbs * entry.quantity)}g · F {Math.round(entry.food.fat * entry.quantity)}g
        </p>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        Qty
        <input
          type="number"
          min="0.1"
          step="0.1"
          defaultValue={entry.quantity}
          className="min-h-11 w-24 rounded-xl border border-white/20 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-gray-800/70"
          onBlur={(e) => onQuantityChange(entry.id, Number(e.target.value))}
        />
      </label>
      <button
        onClick={() => onRemove(entry.id)}
        className="min-h-11 rounded-xl border border-rose-200/70 px-3 py-2 text-sm text-rose-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] dark:border-rose-300/20 dark:text-rose-300"
      >
        Remove
      </button>
    </div>
  );
}
