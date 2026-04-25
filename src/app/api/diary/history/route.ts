import { NextResponse } from "next/server";
import { format, startOfDay, subDays } from "date-fns";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const start = startOfDay(subDays(new Date(), 29));

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: auth.user.id, date: { gte: start } },
    include: { food: true },
    orderBy: { date: "asc" },
  });

  const byDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number }>();

  for (const entry of entries) {
    const key = format(entry.date, "yyyy-MM-dd");
    const previous = byDay.get(key) || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    previous.calories += entry.food.calories * entry.quantity;
    previous.protein += entry.food.protein * entry.quantity;
    previous.carbs += entry.food.carbs * entry.quantity;
    previous.fat += entry.food.fat * entry.quantity;
    previous.fiber += (entry.food.fiber || 0) * entry.quantity;
    byDay.set(key, previous);
  }

  const history = Array.from(byDay.entries()).map(([date, values]) => ({
    date,
    ...values,
  }));

  return NextResponse.json({ history });
}
