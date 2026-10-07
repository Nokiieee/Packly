import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/app/screen";

/**
 * A tab's empty state when there is no current or upcoming trip. Everything
 * belongs to a trip, so the only thing to do is plan one; saving it comes
 * back to this tab.
 */
export function PlanTripPrompt({
  icon,
  title,
  from,
  children,
}: {
  icon: ReactNode;
  title: string;
  from: string;
  children: ReactNode;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      action={
        <Link
          href={`/trips/new?from=${encodeURIComponent(from)}`}
          className="inline-flex rounded-full bg-brand px-6 py-3.5 text-base leading-none font-bold text-brand-ink shadow-hero transition-[background-color,scale] duration-200 ease-out-quint hover:bg-brand-deep active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
        >
          Plan a trip
        </Link>
      }
    >
      {children}
    </EmptyState>
  );
}
