import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/proxy";

/** Route prefixes that require a signed-in user. */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Routes a signed-in user has no reason to see. */
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  // Before .env.local exists there is no session to refresh. Let the request
  // through so the app still runs; protected pages call Supabase directly and
  // surface the "not configured" error themselves.
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user && isProtected) {
    return redirectPreservingCookies(request, response, "/sign-in", {
      redirectTo: pathname,
    });
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    return redirectPreservingCookies(request, response, "/dashboard");
  }

  return response;
}

/**
 * A fresh `NextResponse.redirect` would discard the rotated auth cookies that
 * `updateSession` just wrote, silently signing the user out on the next hop.
 */
function redirectPreservingCookies(
  request: NextRequest,
  source: NextResponse,
  pathname: string,
  params?: Record<string, string>,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  const redirect = NextResponse.redirect(url);

  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }

  return redirect;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets. Auth logic must not run on CSS, JS or
     * images, or a redirect can blank out the page it redirects to.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
