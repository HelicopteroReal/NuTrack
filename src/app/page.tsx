import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#86efac,transparent_20%),radial-gradient(circle_at_85%_20%,#fcd34d,transparent_24%),#f8fafc] p-5">
      <div className="w-full max-w-2xl rounded-3xl bg-white/90 p-8 text-center shadow-xl ring-1 ring-emerald-100 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">NuTrack</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Track your nutrition with clarity</h1>
        <p className="mt-3 text-slate-600">
          Log meals, monitor macros, and hit your goals with a clean Cronometer-style workflow.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white hover:bg-emerald-600">
            Create account
          </Link>
          <Link href="/login" className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
