"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthFormState } from "@/lib/auth/form-state";
import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

const MIN_PASSWORD_LENGTH = 8;

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const redirectTo = safeRedirect(readString(formData, "redirectTo"));

  const fieldErrors: NonNullable<AuthFormState["fieldErrors"]> = {};
  if (!email) fieldErrors.email = "Enter your email.";
  if (!password) fieldErrors.password = "Enter your password.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately vague: saying which half was wrong tells an attacker which
    // email addresses have accounts.
    return {
      error: "That email and password combination didn't work.",
      values: { email },
    };
  }

  revalidatePath("/", "layout");
  // `redirect` throws, so it must sit outside any try/catch.
  redirect(redirectTo);
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const confirmPassword = readString(formData, "confirmPassword");

  const fieldErrors: NonNullable<AuthFormState["fieldErrors"]> = {};
  if (!email) {
    fieldErrors.email = "Enter your email.";
  } else if (!email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    fieldErrors.password = "Choose a password.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords don't match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback` },
  });

  if (error) {
    return { error: error.message, values: { email } };
  }

  // Supabase returns a user with an empty `identities` array when the address is
  // already registered, rather than erroring, so sign-up can't be used to probe
  // for existing accounts. Mirror the success copy to keep that property.
  const alreadyRegistered = data.user?.identities?.length === 0;

  if (!data.session || alreadyRegistered) {
    return {
      message: `Check ${email} for a confirmation link to finish setting up your account.`,
    };
  }

  // Email confirmation is switched off, so sign-up returned a live session.
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();

  // Proxy matchers don't cover Server Actions reliably — a matcher change or a
  // move to another route silently drops that protection — so re-check here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/sign-in");
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

/**
 * Origin for the confirmation link. Prefers an explicitly configured site URL,
 * since `x-forwarded-host` is attacker-controllable in some deployments.
 */
async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}
