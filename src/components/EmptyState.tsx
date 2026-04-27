"use client";

import { ReactNode } from "react";
import { GlassCard } from "@/components/GlassCard";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <GlassCard className="p-8 text-center" interactive>
      {icon && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="min-h-11 rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </GlassCard>
  );
}
