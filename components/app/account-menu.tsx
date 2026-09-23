import { signOut } from "@/app/actions/auth";
import { SignOutIcon } from "@/components/nav/nav-icons";

import { DismissableDetails } from "./dismissable-details";

/**
 * The avatar in the top bar. A `<details>` disclosure that works without
 * JavaScript and dismisses on an outside tap or Escape once hydrated. The
 * panel names the signed-in account and holds sign-out.
 */
export function AccountMenu({ email }: { email: string | null }) {
  const initial = (email?.trim()[0] ?? "P").toUpperCase();

  return (
    <DismissableDetails className="group relative">
      <summary
        aria-label="Account"
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-surface text-sm font-bold text-brand-text shadow-card transition-[scale,box-shadow] duration-200 ease-out-quint select-none active:scale-95 group-open:ring-2 group-open:ring-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none [&::-webkit-details-marker]:hidden"
      >
        {initial}
      </summary>

      <div className="absolute top-12 right-0 z-50 w-64 origin-top-right rounded-2xl bg-surface p-2 shadow-lift">
        {email ? (
          <div className="px-3 pt-2 pb-3">
            <p className="text-xs font-medium text-muted">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-semibold">{email}</p>
          </div>
        ) : null}

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink transition-colors duration-200 ease-out hover:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            <SignOutIcon className="h-5 w-5 text-muted" />
            Sign out
          </button>
        </form>
      </div>
    </DismissableDetails>
  );
}
