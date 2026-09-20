import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Today · Packly",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Re-verified here on purpose. Proxy gating is a convenience redirect, not a
  // security boundary — it can be bypassed by a matcher change or a direct hit
  // on a route the matcher misses, so the page checks for itself.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirectTo=/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
            Packly
          </p>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Today
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Signed in as {user.email}
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No trip yet. Outfit, food and packing for today will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}
