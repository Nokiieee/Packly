import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseEnv } from "./env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Always create a new client per request — never hoist one to module scope, or
 * one visitor's session leaks into another's request.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components render after headers are sent, so cookies are
          // read-only there and this throws. Safe to swallow: proxy.ts refreshes
          // the session on every matched request, so the tokens stay current.
        }
      },
    },
  });
}
