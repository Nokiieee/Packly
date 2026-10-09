/**
 * Shapes shared by the food Server Actions and the list. Kept out of
 * `app/actions/food.ts` because a `"use server"` module may only export
 * async functions.
 */
export type FoodPlace = {
  id: string;
  name: string;
  /** The day of the trip it's planned for (1 for the first), or null while it isn't. */
  day: number | null;
};

export type FoodActionResult = { error?: string };

/** Mirrors the length check on `food_places.name`. */
export const MAX_PLACE_NAME_LENGTH = 120;

/**
 * The day a place is planned for, or null if it isn't. A day past the trip's
 * last (the trip was shortened) counts as not planned, so the place shows up
 * again instead of vanishing.
 */
export function plannedDay(
  place: Pick<FoodPlace, "day">,
  dayCount: number,
): number | null {
  return place.day !== null && place.day <= dayCount ? place.day : null;
}
