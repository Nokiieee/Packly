import type { ReactNode } from "react";

import { PlatformRow } from "@/components/signage/platform-row";
import { RoundelMark } from "@/components/signage/roundel";

export type TodayTrip = {
  name: string;
  dates: string;
  day: number;
  days: number;
  rows: {
    href: string;
    icon: ReactNode;
    name: string;
    status?: string;
    tally?: string;
    attention?: boolean;
  }[];
};

/**
 * The Today screen's view, separated from its auth gate so the composition can
 * be rendered from data alone.
 */
export function TodayView({ trip, note }: { trip: TodayTrip; note?: string }) {
  const { name, dates, day, days, rows } = trip;

  return (
    <>
      {/*
        Full-bleed, so it butts straight onto the header plate and the two read
        as one stacked sign assembly rather than a header plus a card. The white
        rule between them is the seam of the assembly.
      */}
      <section className="border-t-[3px] border-plate-rule bg-plate text-plate-ink">
        <div className="mx-auto w-full max-w-2xl px-5 pt-6 pb-7">
          <p className="flex items-center gap-2.5 text-plate-ink">
            <RoundelMark className="h-[1.15rem] w-[1.15rem] shrink-0" />
            <span className="font-condensed text-sm leading-none font-semibold tracking-[0.2em] uppercase">
              {name} · {dates}
            </span>
          </p>

          <p className="mt-4 flex items-end gap-4">
            <span className="tabular font-condensed text-[5.5rem] leading-[0.78] font-bold">
              {String(day).padStart(2, "0")}
            </span>
            <span className="pb-2.5 font-condensed text-lg leading-none font-semibold tracking-[0.16em] text-plate-muted uppercase">
              of {String(days).padStart(2, "0")} days
            </span>
          </p>

          <ol
            className="mt-6 flex items-center gap-1.5"
            aria-label={`Day ${day} of ${days}`}
          >
            {Array.from({ length: days }, (_, i) => {
              const n = i + 1;
              const state = n < day ? "past" : n === day ? "current" : "ahead";

              return (
                <li
                  key={n}
                  aria-current={state === "current" ? "step" : undefined}
                  className={[
                    "flex-1 rounded-[1px]",
                    state === "current"
                      ? "h-3 bg-plate-rule"
                      : state === "past"
                        ? "h-1.5 bg-plate-muted"
                        : "h-1.5 bg-tick-ahead",
                  ].join(" ")}
                />
              );
            })}
          </ol>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-5 pt-7">
        <section>
          <h1 className="sr-only">Today</h1>
          <ul>
            {rows.map((row) => (
              <li key={row.href}>
                <PlatformRow {...row} />
              </li>
            ))}
          </ul>
        </section>

        {note ? <p className="text-xs text-muted">{note}</p> : null}
      </div>
    </>
  );
}
