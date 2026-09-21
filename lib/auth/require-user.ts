import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Gate for an authenticated page.
 *
 * Called per page rather than once in the shared layout on purpose: a layout
 * does not re-run when the user navigates between its own child routes, so
 * gating there would leave the other tabs unchecked.
 */
export async function requireUser(pathname: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return user;
}
