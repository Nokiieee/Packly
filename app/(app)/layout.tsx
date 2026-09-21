import { signOut } from "@/app/actions/auth";
import { BottomNav } from "@/components/nav/bottom-nav";

/**
 * Shell for the four signed-in tabs. Auth is *not* checked here — a layout
 * does not re-run when navigating between its own children, so each page calls
 * `requireUser()` for itself.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-3.5">
          <p className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
            Packly
          </p>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full px-3 py-1.5 text-sm text-zinc-600 transition-colors duration-200 ease-out hover:bg-zinc-200/70 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Bottom padding clears the floating tab bar, which is out of flow. */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-6 pb-32">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
