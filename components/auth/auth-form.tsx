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
      {/* Palette law: a failure is a red plate, never red type on navy. */}
      {state.error ? (
        <p
          role="alert"
          className="rounded-[2px] bg-signal px-3 py-2.5 text-sm font-medium text-signal-ink"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-[2px] border-2 border-ink px-3 py-2.5 text-sm"
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
        className="mt-2 w-full rounded-[2px] bg-plate px-4 py-3 font-condensed text-base leading-none font-semibold tracking-[0.14em] text-plate-ink uppercase transition-colors duration-200 ease-out hover:bg-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground focus-visible:outline-none disabled:opacity-55"
      >
        {pending ? `${copy.pending}…` : copy.submit}
      </button>

      <p className="text-center text-sm text-muted">
        {copy.footer}{" "}
        <Link
          href={copy.footerHref}
          className="font-medium text-ink underline underline-offset-4 decoration-2"
        >
          {copy.footerLink}
        </Link>
      </p>
    </form>
  );
}
