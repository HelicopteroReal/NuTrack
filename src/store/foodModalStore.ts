"use client";

import { create } from "zustand";
import { MealType } from "@/lib/types";

type FoodModalState = {
  isOpen: boolean;
  mealType: MealType;
  open: (mealType: MealType) => void;
  close: () => void;
};

export const useFoodModalStore = create<FoodModalState>((set) => ({
  isOpen: false,
  mealType: "breakfast",
  open: (mealType) => set({ isOpen: true, mealType }),
  close: () => set({ isOpen: false }),
}));
