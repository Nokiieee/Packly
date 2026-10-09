"use server";

import { revalidatePath } from "next/cache";

import {
  MAX_PLACE_NAME_LENGTH,
  type FoodActionResult,
} from "@/lib/food/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Saves a place to a trip, not planned for any day yet. The composite foreign
 * key rejects a trip the user doesn't own.
 *
 * Only Food shows places so far; once Today's Meals row does, this must
 * revalidate `/dashboard` too.
 */
export async function addFoodPlace(
  tripId: string,
  rawName: string,
): Promise<FoodActionResult> {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (typeof tripId !== "string") {
    return { error: "Couldn't add that place. Try again." };
  }
  if (!name) return { error: "Give the place a name." };
  if (name.length > MAX_PLACE_NAME_LENGTH) {
    return { error: `Keep it under ${MAX_PLACE_NAME_LENGTH} characters.` };
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

  revalidatePath("/food");
  return {};
}
