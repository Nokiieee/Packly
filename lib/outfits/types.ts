/**
 * Shapes shared by the outfit Server Actions and the list. Kept out of
 * `app/actions/outfits.ts` because a `"use server"` module may only export
 * async functions.
 */
export type Outfit = {
  id: string;
  /** The day of the trip it's for, 1 for the first. */
  day: number;
  name: string;
};

/** Something worn in an outfit, typed in freely. */
export type OutfitItem = {
  id: string;
  outfitId: string;
  name: string;
};

export type OutfitActionResult = { error?: string };

/** Mirrors the length check on `outfits.name`. */
export const MAX_OUTFIT_NAME_LENGTH = 60;

/** Mirrors the length check on `outfit_items.name`. */
export const MAX_OUTFIT_ITEM_NAME_LENGTH = 80;
