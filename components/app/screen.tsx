import type { ReactNode } from "react";

/**
 * A tab screen: a large bold title with a one-line subtitle, then content, all
 * in the shared reading column. Used by every tab so the four read as one app.
 */
export function Screen({
  title,
  subtitle,
  aside,
  titleHidden = false,
  children,
}: {
  title: string;
  subtitle?: string;
  /**
   * Sits at the right end of the title's row, such as the trip the screen is
   * about. The title keeps its width, so this is what gives way (truncates)
   * on a narrow phone.
   */
  aside?: ReactNode;
  /**
   * Drops the visible header (title, subtitle and aside) so the content starts
   * at the top. The title stays as a screen-reader-only h1, so the page still
   * says what it is.
   */
  titleHidden?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-4">
      {titleHidden ? (
        <h1 className="sr-only">{title}</h1>
      ) : (
        <header className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="shrink-0 text-[2rem] leading-tight font-extrabold tracking-[-0.025em] sm:text-4xl">
              {title}
            </h1>
            {aside}
          </div>
          {subtitle ? (
            <p className="max-w-prose text-[15px] leading-snug text-muted">
              {subtitle}
            </p>
          ) : null}
        </header>
      )}

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
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  /** The one thing to do next, under the copy. */
  action?: ReactNode;
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
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
