import { NextResponse, type NextRequest } from "next/server";

import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends the user after they click the confirmation link in their
 * email. The link carries a one-time `code` that has to be exchanged for a
 * session here — without this route, confirming an email lands on a 404 and the
 * account is never usable.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("next"));
  const origin = requestOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth-code-error`);
}

function requestOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return request.nextUrl.origin;

  const protocol = request.headers.get("x-forwarded-proto") ?? "https";

  return `${protocol}://${forwardedHost}`;
}
