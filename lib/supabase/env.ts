/**
 * Next.js only inlines `process.env.NEXT_PUBLIC_*` for the browser bundle when
 * the property is accessed statically. Reading it dynamically (e.g.
 * `process.env[name]`) leaves it `undefined` on the client, so these two reads
 * must stay exactly as written.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Lets Proxy skip session handling before the project is configured, so the app
 * still boots on a fresh clone. This never widens access: anything that needs a
 * user calls `supabaseEnv()` and fails closed with the message below.
 */
export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

export function supabaseEnv() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and set " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server.",
    );
  }

  return { url, anonKey };
}
