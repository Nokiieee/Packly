import { FoodIcon, OutfitIcon, PackingIcon } from "@/components/nav/nav-icons";
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

/**
 * Turns the active trip and its packing list into what the Today screen
 * draws. "Today" is the trip's own today, so the day count flips at midnight
 * where the trip is, not where the server is.
 *
 * Outfits and Food have no data yet, so their rows say so rather than invent
 * a plan.
 */
export function buildTodayTrip(
  trip: Trip,
  items: PackingCount[],
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
    detail: "Nothing planned yet",
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
