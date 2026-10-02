import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Gate for an authenticated page.
 *
 * Called per page rather than once in the shared layout on purpose: a layout
 * does not re-run when the user navigates between its own child routes, so
 * gating there would leave the other tabs unchecked.
 *
 * Uses getClaims(), which verifies the JWT's signature locally rather than
 * round-tripping to Supabase Auth on every tab change. Returns the verified
 * claims; the user's id is `sub`.
 */
export async function requireUser(pathname: string) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return data.claims;
}
