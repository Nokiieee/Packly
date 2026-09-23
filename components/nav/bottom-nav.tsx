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
 * A floating dock in the iOS register: a frosted rounded bar that hovers above
 * the home indicator with content scrolling beneath it. The active tab turns
 * brand-coloured, its icon fills, and a soft pill settles behind it.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="pointer-events-auto mx-auto flex w-full max-w-md items-stretch gap-1 rounded-[1.75rem] border border-hair/70 bg-(--dock-bg) p-1.5 shadow-lift backdrop-blur-xl backdrop-saturate-150">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                data-active={active ? "" : undefined}
                className={[
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.375rem] px-1 py-1.5",
                  "transition-[background-color,color,scale] duration-200 ease-out-quint active:scale-95",
                  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
                  active
                    ? "bg-brand-soft text-brand-text"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
                <span
                  className={`text-[11px] leading-none ${active ? "font-bold" : "font-semibold"}`}
                >
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
