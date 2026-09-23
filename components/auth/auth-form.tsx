"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthFormState } from "@/lib/auth/form-state";
import { initialAuthFormState } from "@/lib/auth/form-state";

import { AuthField } from "./auth-field";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  /** Only meaningful for sign-in; carried through the form as a hidden field. */
  redirectTo?: string;
};

const COPY = {
  "sign-in": {
    submit: "Sign in",
    pending: "Signing in",
    footer: "New to Packly?",
    footerLink: "Create an account",
    footerHref: "/sign-up",
  },
  "sign-up": {
    submit: "Create account",
    pending: "Creating account",
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
          className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-text"
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
        className="mt-2 w-full rounded-full bg-brand px-4 py-3.5 text-base leading-none font-bold text-brand-ink shadow-hero transition-[background-color,scale,opacity] duration-200 ease-out-quint hover:bg-brand-deep active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? `${copy.pending}…` : copy.submit}
      </button>

      <p className="text-center text-sm text-muted">
        {copy.footer}{" "}
        <Link
          href={copy.footerHref}
          className="font-bold text-brand-text underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {copy.footerLink}
        </Link>
      </p>
    </form>
  );
}
