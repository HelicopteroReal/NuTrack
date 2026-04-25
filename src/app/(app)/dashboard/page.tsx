import Link from "next/link";
import { CalorieCard } from "@/components/CalorieCard";
import { GlassCard } from "@/components/GlassCard";
import { MacroProgress } from "@/components/MacroProgress";
import { macroPercentages } from "@/lib/calculations";
import { getDateRange } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const { start, end } = getDateRange();

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    include: { food: true },
    orderBy: { createdAt: "desc" },
  });

  const totals = entries.reduce(
    (acc, entry) => {
      acc.calories += entry.food.calories * entry.quantity;
      acc.protein += entry.food.protein * entry.quantity;
      acc.carbs += entry.food.carbs * entry.quantity;
      acc.fat += entry.food.fat * entry.quantity;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remaining = user.calorieTarget - totals.calories;
  const percentages = macroPercentages(totals);

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="grid gap-4 md:grid-cols-2">
        <CalorieCard consumed={totals.calories} remaining={remaining} target={user.calorieTarget} />
        <MacroProgress protein={percentages.protein} carbs={percentages.carbs} fat={percentages.fat} />
      </section>

      <GlassCard className="p-5" interactive>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today&apos;s meals</h2>
          <Link
            href="/diary"
            className="min-h-11 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Quick add food
          </Link>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No food logged yet today. Add your first meal from the diary.</p>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 8).map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-white/20 bg-white/55 p-3 shadow-sm backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-gray-900/55"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">{entry.food.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {entry.mealType} · Qty {entry.quantity} · {Math.round(entry.food.calories * entry.quantity)} kcal
                </p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
