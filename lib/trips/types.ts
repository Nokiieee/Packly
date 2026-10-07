/**
 * Shapes shared by the trip Server Actions, pages and form. Kept out of
 * `app/actions/trips.ts` because a `"use server"` module may only export
 * async functions.
 */
export type Trip = {
  id: string;
  /** Where it's to, as the user wrote it: "Lisbon". */
  name: string;
  /** First day, `YYYY-MM-DD`. */
  startDate: string;
  /** Last day, `YYYY-MM-DD`; the trip is still on all of this day. */
  endDate: string;
  /** IANA name. Decides when each day of the trip begins. */
  timeZone: string;
};

export type TripFields = Omit<Trip, "id">;

export type TripFormState = {
  /** Shown above the form. Used for failures that aren't tied to one field. */
  error?: string;
  fieldErrors?: Partial<Record<keyof TripFields, string>>;
  /** Echoed back so a failed submit doesn't wipe what the user typed. */
  values?: TripFields;
};

export const initialTripFormState: TripFormState = {};

/** Mirrors the length check on `trips.name`. */
export const MAX_TRIP_NAME_LENGTH = 80;

/** The columns every trip read selects, ready for `toTrip`. */
export const TRIP_COLUMNS = "id, name, start_date, end_date, time_zone";

export function toTrip(row: {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  time_zone: string;
}): Trip {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    timeZone: row.time_zone,
  };
}
