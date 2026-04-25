"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChartColumn, LayoutDashboard, Plus, ScrollText, UserRound } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/diary", label: "Diary", icon: ScrollText },
  { href: "/history", label: "History", icon: ChartColumn },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 lg:hidden">
      <div className="relative mx-auto max-w-lg rounded-3xl border border-white/20 bg-white/70 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70">
        <div className="grid grid-cols-5 items-center gap-1">
          {links.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex min-h-12 flex-col items-center justify-center rounded-2xl text-xs transition-all duration-200",
                  active ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/diary"
            aria-label="Add food"
            className="mx-auto -mt-7 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={24} />
          </Link>

          {links.slice(2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex min-h-12 flex-col items-center justify-center rounded-2xl text-xs transition-all duration-200",
                  active ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
