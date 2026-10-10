"use client";

import { useId, useState } from "react";

import { PlusIcon } from "@/components/nav/nav-icons";
import { DayPicker } from "@/components/trips/day-picker";
import type { TripDay } from "@/lib/trips/dates";

/** The outfits every day starts with. */
const DEFAULT_OUTFITS = ["Day outfit", "Night outfit"];

/**
 * A trip's outfits, day by day: the day strip, then the selected day's
 * outfits. The strip starts on today during the trip and on Day 1 before it,
 * as on Food.
 */
export function OutfitDays({
  days,
  today,
}: {
  days: TripDay[];
  /** Today's day number during the trip; omit before it. */
  today?: number;
}) {
  const [selectedDay, setSelectedDay] = useState(today ?? 1);
  const headingId = useId();
  const selected = days[selectedDay - 1];

  return (
    <div className="flex flex-col gap-6">
      <DayPicker
        days={days}
        defaultDay={selectedDay}
        today={today}
        onChange={setSelectedDay}
      />

      <section aria-labelledby={headingId} className="flex flex-col gap-3">
        <h2
          id={headingId}
          className="px-1 text-lg font-bold tracking-[-0.01em]"
        >
          {selectedDay === today ? "Today" : `Day ${selectedDay}`}
          <span className="font-semibold text-muted"> · {selected.label}</span>
        </h2>
        <ul className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
          {DEFAULT_OUTFITS.map((name) => (
            <li key={name}>
              <OutfitRow name={name} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * One outfit of the day. With nothing in it yet, a dashed tile with a plus
 * stands where the outfit will go.
 */
function OutfitRow({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-4 p-3.5 pr-4">
      <span
        aria-hidden="true"
        className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.1rem] border-2 border-dashed border-field-edge text-muted"
      >
        <PlusIcon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base leading-tight font-bold">{name}</span>
        <span className="mt-1 block text-sm text-muted">Not planned yet</span>
      </span>
    </div>
  );
}
