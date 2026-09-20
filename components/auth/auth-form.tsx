"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthFormState } from "@/lib/auth/form-state";
import { initialAuthFormState } from "@/lib/auth/form-state";

import { AuthField } from "./auth-field";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  action: (
    state: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  /** Only meaningful for sign-in; carried through the form as a hidden field. */
  redirectTo?: string;
};

const COPY = {
  "sign-in": {
    submit: "Sign in",
    pending: "Signing in…",
    footer: "New to Packly?",
    footerLink: "Create an account",
    footerHref: "/sign-up",
  },
  "sign-up": {
    submit: "Create account",
    pending: "Creating account…",
    footer: "Already have an account?",
    footerLink: "Sign in",
    footerHref: "/sign-in",
  },
} as const;

export function AuthForm({ mode, action, redirectTo }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAuthFormState,
  );
  const copy = COPY[mode];
  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {state.message}
        </p>
      ) : null}

      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}

      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />

      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        placeholder="••••••••"
        error={state.fieldErrors?.password}
        hint={isSignUp ? "At least 8 characters." : undefined}
      />

      {isSignUp ? (
        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={state.fieldErrors?.confirmPassword}
        />
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950"
      >
        {pending ? copy.pending : copy.submit}
      </button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {copy.footer}{" "}
        <Link
          href={copy.footerHref}
          className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
        >
          {copy.footerLink}
        </Link>
      </p>
    </form>
  );
}
