import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon, ChevronRightIcon } from "@/components/nav/nav-icons";

import { SuitcaseArt } from "./suitcase-art";

export type TodayTrip = {
  name: string;
  /** Today's date, already formatted for display. */
  date: string;
  dates: string;
  day: number;
  days: number;
  packing: { packed: number; total: number };
  rows: PlanRowProps[];
};

/**
 * The Today screen's view, separated from its auth gate so the composition can
 * be rendered from data alone.
 */
export function TodayView({
  trip,
  note,
  titleAs: Title = "h1",
}: {
  trip: TodayTrip;
  note?: string;
  /** A preview inside another page renders the title as a `p`, so that page keeps its own h1. */
  titleAs?: "h1" | "p";
}) {
  const { name, date, dates, day, days, packing, rows } = trip;
  const left = packing.total - packing.packed;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-5 pt-4">
      <header>
        <p className="text-[15px] font-medium text-muted">{date}</p>
        <Title className="mt-1 text-[2rem] leading-tight font-extrabold tracking-[-0.025em] text-balance sm:text-4xl">
          Day {day} in {name}
        </Title>
      </header>

      <section
        aria-label="Trip progress"
        className="relative mt-5 isolate overflow-hidden rounded-[1.75rem] bg-linear-to-br from-(--hero-from) to-(--hero-to) p-5 text-hero-ink shadow-hero sm:p-6"
      >
        {/* Soft light shapes behind the art, as in a lit product shot. */}
        <span
          aria-hidden="true"
          className="absolute -top-16 -right-12 -z-10 h-56 w-56 rounded-full bg-white/10"
        />
        <span
          aria-hidden="true"
          className="absolute -right-4 -bottom-24 -z-10 h-44 w-44 rounded-full bg-white/[0.07]"
        />

        <SuitcaseArt className="absolute right-1 bottom-3 w-[38%] max-w-44 sm:right-5" />

        <div className="max-w-[62%]">
          <p className="text-sm font-semibold text-hero-muted">
            {name} · {dates}
          </p>
          <p className="tabular mt-1.5 text-2xl leading-tight font-bold tracking-[-0.02em] text-balance">
            {left > 0
              ? `${left} ${left === 1 ? "item" : "items"} left to pack`
              : "Everything's packed"}
          </p>

          <div
            role="progressbar"
            aria-label="Packed"
            aria-valuemin={0}
            aria-valuemax={packing.total}
            aria-valuenow={packing.packed}
            aria-valuetext={`${packing.packed} of ${packing.total} packed`}
            className="mt-3 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-hero-ink/25"
          >
            <div
              className="h-full rounded-full bg-hero-ink"
              style={{ width: `${(packing.packed / packing.total) * 100}%` }}
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <ol aria-hidden="true" className="flex items-center gap-1.5">
              {Array.from({ length: days }, (_, i) => {
                const n = i + 1;
                return (
                  <li
                    key={n}
                    className={[
                      "h-2 rounded-full",
                      n === day
                        ? "w-6 bg-hero-ink"
                        : n < day
                          ? "w-2 bg-hero-ink/70"
                          : "w-2 bg-hero-ink/30",
                    ].join(" ")}
                  />
                );
              })}
            </ol>
            <p className="tabular text-xs font-semibold whitespace-nowrap text-hero-muted">
              Day {day} of {days}
            </p>
          </div>

          <Link
            href="/packing"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-hero-ink px-4 py-2.5 text-sm font-bold text-(--hero-to) shadow-card transition-[scale] duration-200 ease-out-quint active:scale-95 focus-visible:ring-2 focus-visible:ring-hero-ink focus-visible:ring-offset-2 focus-visible:ring-offset-(--hero-to) focus-visible:outline-none"
          >
            Open packing list
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold tracking-[-0.01em]">
          Today&apos;s plan
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.href}>
              <PlanRow {...row} />
            </li>
          ))}
        </ul>
      </section>

      {note ? <p className="mt-6 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

type PlanRowProps = {
  href: string;
  icon: ReactNode;
  name: string;
  detail: string;
  /** A short "still to do" label. The only thing that may turn amber. */
  todo?: string;
};

/**
 * One line of today's plan: a tinted icon tile, what it is, the detail, and an
 * amber chip when something is still to do. The whole card is the tap target.
 */
function PlanRow({ href, icon, name, detail, todo }: PlanRowProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl bg-surface p-3.5 pr-4 shadow-card transition-[scale,box-shadow] duration-200 ease-out-quint hover:shadow-lift active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
    >
      <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.1rem] bg-brand-soft text-brand-text">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-base leading-tight font-bold">{name}</span>
        <span className="tabular mt-1 line-clamp-2 text-sm text-pretty text-muted">
          {detail}
        </span>
      </span>

      {todo ? (
        <span className="tabular shrink-0 rounded-full bg-todo-soft px-2.5 py-1 text-xs font-bold text-todo-text">
          {todo}
        </span>
      ) : null}

      <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 ease-out-quint group-hover:translate-x-0.5" />
    </Link>
  );
}
