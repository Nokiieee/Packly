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
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.025em]">
          Welcome back
        </h1>
        <p className="text-[15px] text-balance text-muted">
          Pick up today&apos;s trip plan where you left it.
        </p>
      </div>

      {notice ? (
        <p
          role="alert"
          className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          {notice === "auth-code-error"
            ? "That confirmation link is invalid or has expired. Sign up again to get a fresh one."
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
