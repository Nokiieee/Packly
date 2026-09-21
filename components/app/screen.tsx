import type { ReactNode } from "react";

/**
 * A screen nameplate: the destination set large in condensed caps over a thick
 * rule, the way a platform is named. Shared by every tab so the four read as
 * one system.
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
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-7">
      <header className="flex flex-col gap-2 border-b-[3px] border-ink pb-3">
        <h1 className="font-condensed text-4xl leading-none font-bold tracking-[0.02em] uppercase sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-prose text-sm text-muted">{subtitle}</p>
      </header>

      {children}
    </section>
  );
}

/**
 * An empty board. It teaches the screen rather than announcing that nothing is
 * here — the pictogram is set in chalk at board scale so the panel reads as an
 * unfilled sign, not a missing one.
 */
export function EmptyBoard({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 border-2 border-ink/20 px-6 py-14 text-center">
      <span className="text-chalk">{icon}</span>
      <p className="max-w-xs text-sm text-muted">{children}</p>
    </div>
  );
}
