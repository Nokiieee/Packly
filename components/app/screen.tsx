import type { ReactNode } from "react";

/**
 * A tab screen: a large bold title with a one-line subtitle, then content, all
 * in the shared reading column. Used by every tab so the four read as one app.
 */
export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-4">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-[-0.025em] text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-prose text-[15px] leading-snug text-muted">
          {subtitle}
        </p>
      </header>

      {children}
    </section>
  );
}

/**
 * An empty state. It teaches the screen rather than announcing that nothing is
 * here: a large tinted icon tile, then what will live on this screen and how it
 * connects to the rest of the trip.
 */
export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-surface px-6 pt-10 pb-11 text-center shadow-card">
      <span className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-brand-soft text-brand-text">
        {icon}
      </span>
      <h2 className="mt-5 text-lg font-bold tracking-[-0.01em]">{title}</h2>
      <p className="mt-1.5 max-w-xs text-[15px] leading-relaxed text-muted">
        {children}
      </p>
    </div>
  );
}
