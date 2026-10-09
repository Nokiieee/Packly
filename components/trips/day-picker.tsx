"use client";

import { useLayoutEffect, useRef } from "react";

import type { TripDay } from "@/lib/trips/dates";

/**
 * The trip's days as one row that scrolls sideways, pick one: a calendar
 * strip, so it stays one row tall however long the trip is. Native radios
 * under the pills, so inside a form the chosen day is submitted as `name`
 * (its number) with no JavaScript, arrow keys move between days, and the
 * checked pill styles itself through `has-checked`. The only script scrolls
 * the starting day into view.
 *
 * It bleeds into the screen's side gutters, so it must sit directly in a
 * `Screen` column (`px-5`), not inside a card.
 */
export function DayPicker({
  days,
  name = "day",
  legend = "Trip day",
  defaultDay,
  today,
}: {
  days: TripDay[];
  name?: string;
  /** Read out, not shown: the pills say what they are. */
  legend?: string;
  /** The day number selected to begin with; none if omitted. */
  defaultDay?: number;
  /** Today's day number, marked with a dot; omit outside the trip. */
  today?: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  // Before paint, so a late day doesn't flash in at the start of the row.
  // The day before stays visible, which says the row scrolls both ways.
  useLayoutEffect(() => {
    const row = scroller.current;
    const pill = row?.querySelector("input:checked")?.closest("label");
    if (!row || !(pill instanceof HTMLElement)) return;

    const lead = pill.previousElementSibling ?? pill;
    if (lead instanceof HTMLElement) {
      row.scrollLeft =
        lead.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft);
    }
  }, []);

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>

      <div
        ref={scroller}
        className="relative -mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 py-1.5 [mask-image:linear-gradient(to_right,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => (
          <label
            key={day.number}
            className="group relative flex w-14 shrink-0 cursor-pointer snap-start flex-col items-center rounded-2xl bg-surface pt-2.5 pb-2 text-ink transition-[background-color,color,scale] duration-200 ease-out-quint select-none active:scale-95 has-checked:bg-brand has-checked:text-brand-ink has-focus-visible:ring-2 has-focus-visible:ring-brand has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-ground"
          >
            <input
              type="radio"
              name={name}
              value={day.number}
              defaultChecked={day.number === defaultDay}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="text-xs font-semibold text-muted transition-colors duration-200 ease-out-quint group-has-checked:text-brand-ink"
            >
              {day.weekday}
            </span>
            <span
              aria-hidden="true"
              className="tabular mt-0.5 text-lg leading-6 font-bold"
            >
              {day.dayOfMonth}
            </span>
            {/* Always present so every pill is the same height. */}
            <span
              aria-hidden="true"
              className={[
                "mt-1 h-1 w-1 rounded-full",
                day.number === today
                  ? "bg-brand group-has-checked:bg-brand-ink"
                  : "",
              ].join(" ")}
            />
            <span className="sr-only">
              Day {day.number}, {day.label}
              {day.number === today ? ", today" : ""}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
