import type { ReactNode } from "react";

/**
 * Shared frame for the four tab screens, so headings, measure and rhythm stay
 * identical as real content replaces the placeholders.
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
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {title}
        </h1>
        <p className="max-w-prose text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </header>

      {children}
    </section>
  );
}

/**
 * Placeholder that says what the screen will do, rather than "nothing here".
 * Every one of these is scaffolding — replace it with the real feature.
 */
export function ComingSoon({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mx-auto max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        {children}
      </p>
    </div>
  );
}
