import { AccountMenu } from "@/components/app/account-menu";
import { Logo } from "@/components/brand/logo";
import { BottomNav } from "@/components/nav/bottom-nav";
import { createClient } from "@/lib/supabase/server";

/**
 * Shell for the four signed-in tabs. Auth is *not* checked here — a layout does
 * not re-run when navigating between its own children, so each page calls
 * `requireUser()` for itself. The user is read here only to label the avatar.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Logo />
        <AccountMenu email={user?.email ?? null} />
      </header>

      {/*
        Each screen owns its own reading column. Bottom padding clears the
        floating dock, which is out of flow.
      */}
      <main className="flex-1 pb-36">{children}</main>

      <BottomNav />
    </div>
  );
}
