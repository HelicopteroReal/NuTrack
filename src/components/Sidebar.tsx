"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, LayoutDashboard, ScrollText, UserRound } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/diary", label: "Diary", icon: ScrollText },
  { href: "/history", label: "History", icon: ChartColumn },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r border-emerald-100/60 bg-white lg:w-64">
      <div className="flex items-center gap-2 border-b border-emerald-100/60 px-5 py-4">
        <div className="h-8 w-8 rounded-full bg-emerald-500" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">NuTrack</p>
          <p className="text-sm font-semibold text-slate-800">Nutrition Tracker</p>
        </div>
      </div>

      <nav className="grid grid-cols-2 gap-2 p-3 lg:grid-cols-1">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
