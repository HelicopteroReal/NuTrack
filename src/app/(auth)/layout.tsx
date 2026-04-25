import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#bbf7d0,transparent_35%),radial-gradient(circle_at_bottom_right,#fde68a,transparent_25%),#f8fafc]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
          NuTrack
        </Link>
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-emerald-100">{children}</div>
      </div>
    </div>
  );
}
