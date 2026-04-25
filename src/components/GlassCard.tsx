import clsx from "clsx";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
};

export function GlassCard({ children, className, interactive = false }: GlassCardProps) {
  return (
    <section
      className={clsx(
        "rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-gray-900/70",
        interactive && "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {children}
    </section>
  );
}
