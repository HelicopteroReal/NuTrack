"use client";

type IOSSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export function IOSSwitch({ checked, onChange, label }: IOSSwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      {label && <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 rounded-full border border-white/30 transition-all duration-200 ${
          checked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}
