type RoundedProgressBarProps = {
  value: number;
  colorClassName?: string;
};

export function RoundedProgressBar({ value, colorClassName = "bg-emerald-500" }: RoundedProgressBarProps) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200/80 dark:bg-gray-700/70">
      <div
        className={`h-full rounded-full transition-all duration-200 ${colorClassName}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
