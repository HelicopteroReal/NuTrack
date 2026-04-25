import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { getDateRange } from "@/lib/date";

export async function GET(req: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const url = new URL(req.url);
  const { date, start, end } = getDateRange(url.searchParams.get("date") || undefined);

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: auth.user.id, date: { gte: start, lte: end } },
    include: { food: true },
    orderBy: { createdAt: "desc" },
  });

  const totals = entries.reduce(
    (acc, entry) => {
      acc.calories += entry.food.calories * entry.quantity;
      acc.protein += entry.food.protein * entry.quantity;
      acc.carbs += entry.food.carbs * entry.quantity;
      acc.fat += entry.food.fat * entry.quantity;
      acc.fiber += (entry.food.fiber || 0) * entry.quantity;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  return NextResponse.json({
    date,
    entries,
    totals,
    target: auth.user.calorieTarget,
  });
}
