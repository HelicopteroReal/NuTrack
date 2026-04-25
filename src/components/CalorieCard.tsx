import { GlassCard } from "@/components/GlassCard";

type CalorieCardProps = {
  consumed: number;
  remaining: number;
  target: number;
};

export function CalorieCard({ consumed, remaining, target }: CalorieCardProps) {
  return (
    <GlassCard interactive className="p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Today</p>
      <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{Math.round(consumed)} kcal</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/20 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
          <p className="text-gray-600 dark:text-gray-300">Remaining</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{Math.round(remaining)}</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
          <p className="text-gray-600 dark:text-gray-300">Target</p>
          <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">{Math.round(target)}</p>
        </div>
      </div>
    </GlassCard>
  );
}
