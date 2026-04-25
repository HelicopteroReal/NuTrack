"use client";

import { useMemo, useState } from "react";
import { FoodDTO } from "@/lib/types";
import { BottomSheetModal } from "@/components/BottomSheetModal";

type AddFoodModalProps = {
  food: FoodDTO | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (foodId: string, quantity: number) => Promise<void>;
};

export function AddFoodModal({ food, open, onClose, onConfirm }: AddFoodModalProps) {
  const [quantity, setQuantity] = useState(1);

  const preview = useMemo(() => {
    if (!food) return null;
    return {
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      carbs: food.carbs * quantity,
      fat: food.fat * quantity,
    };
  }, [food, quantity]);

  if (!open || !food || !preview) return null;

  return (
    <BottomSheetModal open={open} onClose={onClose} title={`Add ${food.name}`}>
      <div className="space-y-4">
        <label className="block text-sm text-gray-700 dark:text-gray-200">
          <span className="mb-1 block">Quantity</span>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-white/10 dark:bg-gray-900/60"
          />
        </label>

        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 text-sm text-gray-700 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-200">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{Math.round(preview.calories)} kcal</p>
          <p className="mt-1">
            P {Math.round(preview.protein)}g • C {Math.round(preview.carbs)}g • F {Math.round(preview.fat)}g
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="min-h-12 rounded-2xl border border-white/20 bg-white/60 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(food.id, quantity)}
            className="min-h-12 rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Add to meal
          </button>
        </div>
      </div>
    </BottomSheetModal>
  );
}
