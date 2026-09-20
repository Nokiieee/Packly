import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseEnv } from "./env";

/**
 * Refreshes the Supabase session for an incoming request and returns both the
 * response carrying any rotated auth cookies and the authenticated user.
 *
 * The refresh has to happen here rather than in a page, because a Server
 * Component cannot write cookies — a token rotated during render would be
 * dropped, and the next request would rotate again.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = supabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }

        // `headers` is no-store/no-cache. A response that sets auth cookies must
        // never be cached by a CDN, or one user's tokens get served to another.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Must be awaited before the response is produced, otherwise a refresh that
  // lands after the response is committed can't write its cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
