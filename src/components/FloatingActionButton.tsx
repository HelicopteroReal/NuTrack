"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

type FloatingActionButtonProps = {
  href?: string;
  onClick?: () => void;
};

export function FloatingActionButton({ href = "/diary", onClick }: FloatingActionButtonProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="fixed bottom-6 right-6 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] lg:inline-flex"
      >
        <Plus size={24} />
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="fixed bottom-6 right-6 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] lg:inline-flex"
      aria-label="Add food"
    >
      <Plus size={24} />
    </Link>
  );
}
