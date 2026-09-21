"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FoodIcon, OutfitIcon, PackingIcon, TodayIcon } from "./nav-icons";

export const TABS = [
  { href: "/dashboard", label: "Today", Icon: TodayIcon },
  { href: "/packing", label: "Packing", Icon: PackingIcon },
  { href: "/outfits", label: "Outfits", Icon: OutfitIcon },
  { href: "/food", label: "Food", Icon: FoodIcon },
] as const;

/**
 * The tab bar is an enamel plate bolted to the bottom edge — a fixture, not a
 * floating control. The plate runs off the viewport, so its white rule reads
 * along the top edge only, the way a sign's band does where it meets a wall.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t-[3px] border-plate-rule bg-plate text-plate-ink"
    >
      <ul className="mx-auto flex w-full max-w-2xl items-stretch gap-1.5 px-2.5 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-[3px] px-1 py-2",
                  "transition-colors duration-200 ease-out",
                  "focus-visible:ring-2 focus-visible:ring-plate-rule focus-visible:ring-offset-2 focus-visible:ring-offset-plate focus-visible:outline-none",
                  active
                    ? "bg-plate-rule text-plate"
                    : "text-plate-muted hover:bg-plate-rule/10 hover:text-plate-ink",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
                <span className="font-condensed text-[13px] leading-none font-semibold tracking-[0.1em] uppercase">
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
