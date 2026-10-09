import { FoodIcon, OutfitIcon, PackingIcon } from "@/components/nav/nav-icons";
import { plannedDay, type FoodPlace } from "@/lib/food/types";
import { isPacked, type PackingItem } from "@/lib/packing/types";
import {
  daysBetween,
  formatDay,
  formatTripDates,
  todayIn,
} from "@/lib/trips/dates";
import type { Trip } from "@/lib/trips/types";

import type { TodayTrip } from "./today-view";

type PackingCount = Pick<PackingItem, "quantity" | "packedCount">;
type PlaceSummary = Pick<FoodPlace, "name" | "day">;

/**
 * The Food row's line. During the trip it names today's places; before it,
 * it counts what's saved and how much of that has a day.
 */
function foodDetail(
  places: PlaceSummary[],
  days: number,
  day: number,
  startsIn: number,
): string {
  if (places.length === 0) return "Nothing planned yet";

  if (startsIn > 0) {
    const planned = places.filter(
      (place) => plannedDay(place, days) !== null,
    ).length;
    const saved = `${places.length} ${places.length === 1 ? "place" : "places"} saved`;
    return `${saved} · ${planned} planned`;
  }

  const today = places.filter((place) => plannedDay(place, days) === day);
  return today.length > 0
    ? today.map((place) => place.name).join(", ")
    : "Nothing planned for today";
}

/**
 * Turns the active trip, its packing list and its food places into what the
 * Today screen draws. "Today" is the trip's own today, so the day count flips
 * at midnight where the trip is, not where the server is.
 *
 * Outfits has no data yet, so its row says so rather than invent a plan.
 */
export function buildTodayTrip(
  trip: Trip,
  items: PackingCount[],
  places: PlaceSummary[],
  now: Date = new Date(),
): TodayTrip {
  const today = todayIn(trip.timeZone, now);
  const startsIn = Math.max(0, daysBetween(today, trip.startDate));
  const days = daysBetween(trip.startDate, trip.endDate) + 1;
  const day = startsIn > 0 ? 0 : daysBetween(trip.startDate, today) + 1;

  const total = items.length;
  const packed = items.filter(isPacked).length;
  const left = total - packed;

  const packingRow: TodayTrip["rows"][number] = {
    href: "/packing",
    icon: <PackingIcon className="h-6 w-6" />,
    name: "Packing",
    detail: total === 0 ? "Nothing on the list yet" : `${packed} of ${total} packed`,
    todo: left > 0 ? `${left} left` : undefined,
  };
  const outfitRow: TodayTrip["rows"][number] = {
    href: "/outfits",
    icon: <OutfitIcon className="h-6 w-6" />,
    name: startsIn > 0 ? "Outfits" : "Outfit",
    detail: "Nothing planned yet",
  };
  const mealsRow: TodayTrip["rows"][number] = {
    href: "/food",
    icon: <FoodIcon className="h-6 w-6" />,
    name: startsIn > 0 ? "Food" : "Meals",
    detail: foodDetail(places, days, day, startsIn),
  };

  return {
    name: trip.name,
    date: formatDay(today),
    dates: formatTripDates(trip),
    day,
    days,
    startsIn,
    packing: { packed, total },
    // Before the trip, packing is the job; on it, the day's plan leads.
    rows:
      startsIn > 0
        ? [packingRow, outfitRow, mealsRow]
        : [outfitRow, mealsRow, packingRow],
    editHref: `/trips/${trip.id}/edit?from=${encodeURIComponent("/dashboard")}`,
  };
}
