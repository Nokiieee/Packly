import type { FoodPlace } from "@/lib/food/types";
import type { Outfit, OutfitItem } from "@/lib/outfits/types";
import type { PackingCategory, PackingItem } from "@/lib/packing/types";
import { createClient } from "@/lib/supabase/server";

import { isTripOver } from "./dates";
import { TRIP_COLUMNS, isTripId, toTrip, type Trip } from "./types";

/** A finished trip and everything planned on it, for reading back. */
export type PastTrip = {
  trip: Trip;
  packingItems: PackingItem[];
  packingCategories: PackingCategory[];
  outfits: Outfit[];
  outfitItems: OutfitItem[];
  foodPlaces: FoodPlace[];
};

/**
 * One of the signed-in user's finished trips with its packing list, outfits
 * and food places, each in the order its own tab lists them. Null if there's
 * no such trip, it isn't the user's, or it isn't over yet: a live trip is
 * read on the tabs, not here.
 */
export async function getPastTrip(id: string): Promise<PastTrip | null> {
  // Postgres rejects a malformed uuid outright; that's a missing trip too.
  if (!isTripId(id)) return null;

  // RLS limits every read to the signed-in user's rows, so another user's id
  // finds nothing.
  const supabase = await createClient();
  const { data: tripRow, error: tripError } = await supabase
    .from("trips")
    .select(TRIP_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (tripError) throw new Error(`Couldn't load the trip: ${tripError.message}`);
  if (!tripRow) return null;

  const trip = toTrip(tripRow);
  if (!isTripOver(trip)) return null;

  const [items, categories, outfits, outfitItems, places] = await Promise.all([
    supabase
      .from("packing_items")
      .select("id, name, quantity, packed_count, category_id")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("packing_categories")
      .select("id, name")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("outfits")
      .select("id, day, name")
      .eq("trip_id", trip.id)
      .order("seq", { ascending: true }),
    supabase
      .from("outfit_items")
      .select("id, outfit_id, name")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("food_places")
      .select("id, name, day")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
  ]);

  const error =
    items.error ??
    categories.error ??
    outfits.error ??
    outfitItems.error ??
    places.error;
  if (error) throw new Error(`Couldn't load the trip: ${error.message}`);

  return {
    trip,
    packingItems: (items.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      packedCount: row.packed_count,
      categoryId: row.category_id,
    })),
    packingCategories: (categories.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    })),
    outfits: (outfits.data ?? []).map((row) => ({
      id: row.id,
      day: row.day,
      name: row.name,
    })),
    outfitItems: (outfitItems.data ?? []).map((row) => ({
      id: row.id,
      outfitId: row.outfit_id,
      name: row.name,
    })),
    foodPlaces: (places.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      day: row.day,
    })),
  };
}
