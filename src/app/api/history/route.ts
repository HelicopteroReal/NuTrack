import { NextResponse } from "next/server";
import { format, startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const start = startOfDay(subDays(new Date(), 13));

  const entries = await prisma.diaryEntry.findMany({
    where: {
      userId: auth.user.id,
      date: { gte: start },
    },
    include: { food: true },
    orderBy: { date: "asc" },
  });

  const byDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

  for (const entry of entries) {
    const key = format(entry.date, "MMM d");
    const previous = byDay.get(key) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    previous.calories += entry.food.calories * entry.quantity;
    previous.protein += entry.food.protein * entry.quantity;
    previous.carbs += entry.food.carbs * entry.quantity;
    previous.fat += entry.food.fat * entry.quantity;
    byDay.set(key, previous);
  }

  const dailyCalories = Array.from(byDay.entries()).map(([date, values]) => ({
    date,
    calories: Math.round(values.calories),
  }));

  const macroTotals = Array.from(byDay.values()).reduce(
    (acc, item) => {
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );

  const weeklyAverage =
    dailyCalories.length === 0
      ? 0
      : dailyCalories.reduce((sum, day) => sum + day.calories, 0) / Math.min(7, dailyCalories.length);

  const weightRows = await prisma.weightLog.findMany({
    where: { userId: auth.user.id },
    orderBy: { date: "asc" },
    take: 20,
  });

  const weights =
    weightRows.length > 0
      ? weightRows.map((row) => ({ date: format(row.date, "MMM d"), weight: row.weight }))
      : [{ date: format(new Date(), "MMM d"), weight: auth.user.weight }];

  return NextResponse.json({
    dailyCalories,
    weeklyAverage,
    macroTotals: {
      protein: Math.round(macroTotals.protein),
      carbs: Math.round(macroTotals.carbs),
      fat: Math.round(macroTotals.fat),
    },
    weights,
  });
}
