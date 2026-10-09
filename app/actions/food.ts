"use server";

import { revalidatePath } from "next/cache";

import {
  MAX_PLACE_NAME_LENGTH,
  type FoodActionResult,
} from "@/lib/food/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Drops the cached copies of every page that shows places: Food itself, and
 * Today's Meals row, which the dock has prefetched and would otherwise keep
 * for up to five minutes.
 */
function revalidateFood() {
  revalidatePath("/food");
  revalidatePath("/dashboard");
}

/** The name checks shared by adding and renaming a place. */
function checkName(
  rawName: unknown,
): { name: string; error?: undefined } | { error: string } {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) return { error: "Give the place a name." };
  if (name.length > MAX_PLACE_NAME_LENGTH) {
    return { error: `Keep it under ${MAX_PLACE_NAME_LENGTH} characters.` };
  }
  return { name };
}

/**
 * Saves a place to a trip, not planned for any day yet. The composite foreign
 * key rejects a trip the user doesn't own.
 */
export async function addFoodPlace(
  tripId: string,
  rawName: string,
): Promise<FoodActionResult> {
  const checked = checkName(rawName);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (typeof tripId !== "string") {
    return { error: "Couldn't add that place. Try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("food_places")
    .insert({ name, trip_id: tripId, user_id: user.id });

  if (error) return { error: "Couldn't add that place. Try again." };

  revalidateFood();
  return {};
}

/** Renames a place. Its day stays as it is. */
export async function updateFoodPlace(
  id: string,
  rawName: string,
): Promise<FoodActionResult> {
  const checked = checkName(rawName);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (typeof id !== "string") return { error: "Couldn't save that place." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("food_places")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't save that place. Try again." };

  revalidateFood();
  return {};
}

export async function deleteFoodPlace(id: string): Promise<FoodActionResult> {
  if (typeof id !== "string") return { error: "Couldn't delete that place." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("food_places")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't delete that place. Try again." };

  revalidateFood();
  return {};
}

/** The highest value `food_places.day` (a smallint) can hold. */
const MAX_DAY = 32767;

/**
 * Plans a place for a day of its trip, or back to not planned with null. A
 * day past the trip's end isn't rejected here: the list already reads it as
 * not planned (`plannedDay()`), and the picker never offers one.
 */
export async function setFoodPlaceDay(
  id: string,
  day: number | null,
): Promise<FoodActionResult> {
  if (
    typeof id !== "string" ||
    (day !== null && !(Number.isInteger(day) && day >= 1 && day <= MAX_DAY))
  ) {
    return { error: "Couldn't change the day for that place." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("food_places")
    .update({ day })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Couldn't change the day for that place. Try again." };
  }

  revalidateFood();
  return {};
}
