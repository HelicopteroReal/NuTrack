export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type FoodDTO = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  servingSize?: string;
  source?: "default" | "api" | "custom";
};

export type DiaryEntryDTO = {
  id: string;
  date: string;
  mealType: MealType;
  quantity: number;
  food: FoodDTO;
};

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];
