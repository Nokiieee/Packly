import { createBrowserClient } from "@supabase/ssr";

import { supabaseEnv } from "./env";

/**
 * Supabase client for Client Components. `createBrowserClient` is a singleton
 * by default, so calling this on every render is cheap.
 */
export function createClient() {
  const { url, anonKey } = supabaseEnv();

  return createBrowserClient(url, anonKey);
}
