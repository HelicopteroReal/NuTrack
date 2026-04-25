"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type NavbarProps = {
  email: string;
};

export function Navbar({ email }: NavbarProps) {
  const router = useRouter();

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-100/70 bg-white/90 px-5 py-3 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus Today</p>
        <h1 className="text-lg font-semibold text-slate-900">Fuel with intention</h1>
      </div>
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-slate-600 sm:block">{email}</p>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}
