"use client";

import { useRouter } from "next/navigation";
import { BlurNavbar } from "@/components/BlurNavbar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FloatingNavBar } from "@/components/FloatingNavBar";
import { useTheme } from "@/components/ThemeProvider";

type AppShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AppShell({ email, children }: AppShellProps) {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100 transition-all duration-200 dark:bg-gray-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.24),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.18),transparent_30%)] dark:bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1400px] lg:grid lg:grid-cols-[288px_1fr]">
        <FloatingNavBar />

        <div className="min-w-0 px-2 pb-36 pt-1 sm:px-4 lg:pb-8 lg:pr-5">
          <BlurNavbar
            title="Fuel with intention"
            subtitle={email}
            darkMode={resolvedTheme === "dark"}
            onToggleDarkMode={toggleTheme}
          />

          <main className="mx-auto w-full max-w-5xl pb-safe">{children}</main>

          <button
            onClick={onLogout}
            className="fixed right-4 top-24 z-30 hidden rounded-2xl border border-white/20 bg-white/70 px-4 py-2 text-sm text-gray-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-200 lg:inline-flex"
          >
            Logout
          </button>
        </div>
      </div>

      <FloatingActionButton href="/diary" />
      <BottomTabBar />
    </div>
  );
}
