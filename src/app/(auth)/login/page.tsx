import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main>
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600">Log in to track meals and macros.</p>

      {error && <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}

      <form action={loginAction} className="mt-5 space-y-4">
        <label className="block text-sm text-slate-700">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="block text-sm text-slate-700">
          Password
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <button className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600">Log in</button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-emerald-700">
          Register
        </Link>
      </p>
    </main>
  );
}
