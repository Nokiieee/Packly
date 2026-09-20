import type { Metadata } from "next";

import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in · Packly",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const params = await searchParams;
  const redirectTo = safeRedirect(first(params.redirectTo));
  const notice = first(params.error);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to pick up today&apos;s trip plan.
        </p>
      </div>

      {notice ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
        >
          {notice === "auth-code-error"
            ? "That confirmation link is invalid or has expired. Try signing in, or sign up again to get a fresh link."
            : "Something went wrong. Please try again."}
        </p>
      ) : null}

      <AuthForm mode="sign-in" action={signIn} redirectTo={redirectTo} />
    </div>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
