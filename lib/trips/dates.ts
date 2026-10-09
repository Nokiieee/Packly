import type { Trip } from "./types";

/**
 * Trip dates are plain calendar days (`YYYY-MM-DD`), so they compare as
 * strings. "Today" is the only moving part, and it depends on where the trip
 * is: the last evening in Lisbon is already the next morning in Manila.
 */

/** Today's calendar date in `timeZone`, as `YYYY-MM-DD`. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
  } catch {
    // A zone this runtime doesn't know: UTC is at most a day out.
    return now.toISOString().slice(0, 10);
  }
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/**
 * The trip the tabs are about: the one on today, else the next to start, else
 * none. Expects `trips` ordered by start date; with two on at once, the one
 * that started first wins.
 */
export function pickActiveTrip(
  trips: Trip[],
  now: Date = new Date(),
): Trip | null {
  let upcoming: Trip | null = null;
  for (const trip of trips) {
    const today = todayIn(trip.timeZone, now);
    if (trip.endDate < today) continue;
    if (trip.startDate <= today) return trip;
    upcoming ??= trip;
  }
  return upcoming;
}

/** Whole days from `from` to `to` (both `YYYY-MM-DD`); negative if `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/**
 * The earliest end date a trip that isn't over yet can have. Every zone's
 * today is within a day of UTC's, so this is a safe lower bound for the query;
 * `pickActiveTrip` makes the exact call per trip.
 */
export function earliestLiveEndDate(now: Date = new Date()): string {
  return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects 2026-02-30, which Date would quietly roll into March.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function isTimeZone(value: string): boolean {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const rangeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "Wednesday 14 October". */
export function formatDay(date: string): string {
  return dayFormat.format(new Date(`${date}T00:00:00Z`));
}

const shortDayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** One day of a trip: its number from 1, its date, and that date as "Thu 8 Oct". */
export type TripDay = { number: number; date: string; label: string };

/** Every day of the trip, first to last. */
export function tripDays(trip: Pick<Trip, "startDate" | "endDate">): TripDay[] {
  const count = daysBetween(trip.startDate, trip.endDate) + 1;
  const start = Date.parse(`${trip.startDate}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(start + i * 24 * 60 * 60 * 1000);
    return {
      number: i + 1,
      date: day.toISOString().slice(0, 10),
      label: shortDayFormat.format(day),
    };
  });
}

/**
 * Which day of the trip today is (1 for the first), by the trip's own clock,
 * so it moves on at midnight where the trip is. Null before or after the trip.
 */
export function currentTripDay(
  trip: Pick<Trip, "startDate" | "endDate" | "timeZone">,
  now: Date = new Date(),
): number | null {
  const today = todayIn(trip.timeZone, now);
  if (today < trip.startDate || today > trip.endDate) return null;
  return daysBetween(trip.startDate, today) + 1;
}

/** "12–18 Oct", "28 Oct – 3 Nov", or "12 Oct" for a one-day trip. */
export function formatTripDates(
  trip: Pick<Trip, "startDate" | "endDate">,
): string {
  return rangeFormat.formatRange(
    new Date(`${trip.startDate}T00:00:00Z`),
    new Date(`${trip.endDate}T00:00:00Z`),
  );
}
