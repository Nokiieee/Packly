"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { isCalendarDate, isTimeZone } from "@/lib/trips/dates";
import {
  MAX_TRIP_NAME_LENGTH,
  type TripFields,
  type TripFormState,
} from "@/lib/trips/types";

/** Where a saved trip goes when the form wasn't opened from a tab. */
const DEFAULT_RETURN = "/packing";

export async function createTrip(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const values = readTrip(formData);
  const fieldErrors = checkTrip(values);
  if (fieldErrors) return { fieldErrors, values };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again.", values };

  const { error } = await supabase
    .from("trips")
    .insert({ ...toRow(values), user_id: user.id });

  if (error) return { error: "Couldn't save the trip. Try again.", values };

  // Every tab reads the active trip, so all of them are stale now.
  revalidatePath("/", "layout");
  // `redirect` throws, so it must sit outside any try/catch.
  redirect(safeRedirect(readString(formData, "from"), DEFAULT_RETURN));
}

export async function updateTrip(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const values = readTrip(formData);
  const fieldErrors = checkTrip(values);
  if (fieldErrors) return { fieldErrors, values };

  const id = readString(formData, "id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again.", values };

  // Selecting the row back tells "saved" apart from "no trip of yours with
  // that id", which a bare update reports the same way.
  const { data, error } = await supabase
    .from("trips")
    .update(toRow(values))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error || !data?.length) {
    return { error: "Couldn't save the trip. Try again.", values };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(readString(formData, "from"), DEFAULT_RETURN));
}

function readTrip(formData: FormData): TripFields {
  return {
    name: readString(formData, "name"),
    startDate: readString(formData, "startDate"),
    endDate: readString(formData, "endDate"),
    timeZone: readString(formData, "timeZone"),
  };
}

/** The field checks shared by creating and editing; undefined when all pass. */
function checkTrip(values: TripFields): TripFormState["fieldErrors"] {
  const fieldErrors: NonNullable<TripFormState["fieldErrors"]> = {};

  if (!values.name) {
    fieldErrors.name = "Say where you're going.";
  } else if (values.name.length > MAX_TRIP_NAME_LENGTH) {
    fieldErrors.name = `Keep it under ${MAX_TRIP_NAME_LENGTH} characters.`;
  }

  if (!isCalendarDate(values.startDate)) {
    fieldErrors.startDate = "Pick the first day.";
  }
  if (!isCalendarDate(values.endDate)) {
    fieldErrors.endDate = "Pick the last day.";
  } else if (!fieldErrors.startDate && values.endDate < values.startDate) {
    fieldErrors.endDate = "The last day can't come before the first.";
  }

  if (!isTimeZone(values.timeZone)) {
    fieldErrors.timeZone = "Pick a time zone.";
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

function toRow(values: TripFields) {
  return {
    name: values.name,
    start_date: values.startDate,
    end_date: values.endDate,
    time_zone: values.timeZone,
  };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}
