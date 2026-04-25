"use client";

import clsx from "clsx";

type Option<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex w-full rounded-2xl border border-white/20 bg-white/70 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
            value === option.value
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100"
              : "text-gray-600 dark:text-gray-300"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
