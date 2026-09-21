import { signOut } from "@/app/actions/auth";
import { BottomNav } from "@/components/nav/bottom-nav";
import { Roundel } from "@/components/signage/roundel";

/**
 * Shell for the four signed-in tabs. Auth is *not* checked here — a layout does
 * not re-run when navigating between its own children, so each page calls
 * `requireUser()` for itself.
 *
 * The header is a slim enamel plate; where a screen opens with its own plate the
 * two stack into one continuous sign assembly, divided by a white rule.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-plate text-plate-ink">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 py-3">
          <Roundel className="text-[15px]">Packly</Roundel>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-[2px] px-2.5 py-1.5 font-condensed text-[13px] leading-none font-semibold tracking-[0.12em] text-plate-muted uppercase transition-colors duration-200 ease-out hover:bg-plate-rule/10 hover:text-plate-ink focus-visible:ring-2 focus-visible:ring-plate-rule focus-visible:ring-offset-2 focus-visible:ring-offset-plate focus-visible:outline-none"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/*
        `main` carries no column of its own: a screen that opens with a
        full-bleed plate needs the full width, so each screen pads itself.
        Bottom padding clears the tab plate, which is out of flow.
      */}
      <main className="flex-1 pb-36">{children}</main>

      <BottomNav />
    </div>
  );
}
