"use client";

import { usePathname } from "next/navigation";

import { TABS } from "@/components/nav/bottom-nav";

import { Logo, LogoTile, WORDMARK_CLASS } from "./logo";

/**
 * The signed-in header's top-left. On Packing, Outfits and Food it names the
 * tab in place of the app: the tab's own icon on the emerald tile, and its
 * name where "Packly" would be. Today is the app's home, and the trip forms
 * aren't tabs, so they keep the Packly mark.
 *
 * A client component because the layout it sits in doesn't re-render when
 * the user moves between tabs; the pathname does change.
 */
export function PageLogo() {
  const pathname = usePathname();
  const tab = TABS.find(
    ({ href }) =>
      href !== "/dashboard" &&
      (pathname === href || pathname.startsWith(`${href}/`)),
  );

  if (!tab) return <Logo />;

  const { Icon, label } = tab;
  return (
    // Hidden from screen readers: each page already has its own (sr-only) h1
    // with the same name, so reading it here too would say it twice.
    <span aria-hidden="true" className="inline-flex items-center gap-2.5">
      <LogoTile className="h-9 w-9">
        <Icon strokeWidth={2} className="h-[62%] w-[62%]" />
      </LogoTile>
      <span className={WORDMARK_CLASS}>{label}</span>
    </span>
  );
}
