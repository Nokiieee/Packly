"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FoodIcon,
  OutfitIcon,
  PackingIcon,
  TodayIcon,
} from "./nav-icons";

export const TABS = [
  { href: "/dashboard", label: "Today", Icon: TodayIcon },
  { href: "/packing", label: "Packing", Icon: PackingIcon },
  { href: "/outfits", label: "Outfits", Icon: OutfitIcon },
  { href: "/food", label: "Food", Icon: FoodIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      // The wrapper spans the viewport so the bar stays centred, but only the
      // pill itself takes pointer events — otherwise it would swallow taps on
      // the content either side of it.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="pointer-events-auto flex w-full max-w-sm items-center gap-1 rounded-full border border-white/10 bg-zinc-900 p-1.5 shadow-[0_8px_28px_-6px_rgb(9_9_11_/_0.45)]">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-full px-1 py-2",
                  "transition-colors duration-200 ease-out",
                  "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:outline-none",
                  active
                    ? "bg-white text-zinc-900"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] leading-none font-medium tracking-tight">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
