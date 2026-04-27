"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChartColumn, LayoutDashboard, Scale, ScrollText, UserRound } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/diary", label: "Diary", icon: ScrollText },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/history", label: "History", icon: ChartColumn },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function FloatingNavBar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block lg:w-72 lg:px-4 lg:py-4">
      <div className="sticky top-4 rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70">
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-sky-500/90 p-4 text-white">
          <p className="text-xs uppercase tracking-[0.2em]">NuTrack</p>
          <p className="text-base font-semibold">Nutrition Tracker</p>
        </div>
        <nav className="space-y-2">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "text-gray-700 hover:bg-white/70 dark:text-gray-200 dark:hover:bg-gray-800/60"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
