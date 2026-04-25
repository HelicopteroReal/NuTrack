import { GlassCard } from "@/components/GlassCard";
import { RoundedProgressBar } from "@/components/RoundedProgressBar";

type MacroProgressProps = {
  protein: number;
  carbs: number;
  fat: number;
};

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <span className="text-gray-600 dark:text-gray-300">{Math.round(value)}%</span>
      </div>
      <RoundedProgressBar value={value} colorClassName={color} />
    </div>
  );
}

export function MacroProgress({ protein, carbs, fat }: MacroProgressProps) {
  return (
    <GlassCard interactive className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Macro Ratio</h2>
      <Row label="Protein" value={protein} color="bg-emerald-500" />
      <Row label="Carbs" value={carbs} color="bg-sky-500" />
      <Row label="Fat" value={fat} color="bg-amber-500" />
    </GlassCard>
  );
}
