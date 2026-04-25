import { GoalType, GenderType } from "@prisma/client";

type Macro = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export function calculateCalorieTarget(params: {
  weight: number;
  height: number;
  age: number;
  gender: GenderType;
  goal: GoalType;
}) {
  const { weight, height, age, gender, goal } = params;
  const base =
    10 * weight +
    6.25 * height -
    5 * age +
    (gender === "male" ? 5 : gender === "female" ? -161 : -78);

  const maintenance = Math.round(base * 1.35);

  if (goal === "lose") return Math.max(1200, maintenance - 350);
  if (goal === "gain") return maintenance + 300;
  return maintenance;
}

export function round(value: number, precision = 1) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function sumMacros(items: Array<Partial<Macro>>) {
  return items.reduce(
    (acc: Macro, item) => {
      acc.calories += Number(item.calories || 0);
      acc.protein += Number(item.protein || 0);
      acc.carbs += Number(item.carbs || 0);
      acc.fat += Number(item.fat || 0);
      acc.fiber += Number(item.fiber || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function macroPercentages({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const totalCalories = protein * 4 + carbs * 4 + fat * 9;
  if (!totalCalories) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  return {
    protein: Math.round(((protein * 4) / totalCalories) * 100),
    carbs: Math.round(((carbs * 4) / totalCalories) * 100),
    fat: Math.round(((fat * 9) / totalCalories) * 100),
  };
}
