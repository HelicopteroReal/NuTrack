"use client";

import { Moon, Sun } from "lucide-react";
import { IOSSwitch } from "@/components/IOSSwitch";

type BlurNavbarProps = {
  title: string;
  subtitle?: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

export function BlurNavbar({ title, subtitle, darkMode, onToggleDarkMode }: BlurNavbarProps) {
  return (
    <header className="sticky top-0 z-20 px-3 pb-2 pt-3 sm:px-6">
      <div className="rounded-3xl border border-white/20 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-gray-900/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">NuTrack</p>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
          <div className="inline-flex items-center gap-2">
            <Sun size={15} className="text-gray-500 dark:text-gray-400" />
            <IOSSwitch checked={darkMode} onChange={onToggleDarkMode} />
            <Moon size={15} className="text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
