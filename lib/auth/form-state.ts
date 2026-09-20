/**
 * Shared shape returned by the auth Server Actions and consumed by the form.
 *
 * This lives outside `app/actions/auth.ts` because a `"use server"` module may
 * only export async functions — exporting the initial-state object from there
 * fails the build.
 */
export type AuthFormState = {
  /** Shown above the form. Used for failures that aren't tied to one field. */
  error?: string;
  /** Shown above the form in a success tone, e.g. "check your email". */
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  /** Echoed back so a failed submit doesn't wipe what the user typed. */
  values?: { email?: string };
};

export const initialAuthFormState: AuthFormState = {};
