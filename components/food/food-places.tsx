"use client";

import { useId, useOptimistic, useRef, useState } from "react";

import { addFoodPlace } from "@/app/actions/food";
import {
  errorClass,
  fieldClass,
  submitClass,
} from "@/components/app/form-styles";
import { EmptyState } from "@/components/app/screen";
import { FoodIcon, PlusIcon } from "@/components/nav/nav-icons";
import {
  MAX_PLACE_NAME_LENGTH,
  plannedDay,
  type FoodPlace,
} from "@/lib/food/types";

/** Ids for rows the server hasn't confirmed yet. */
const PENDING_PREFIX = "pending-";

let pendingCount = 0;
function pendingId() {
  pendingCount += 1;
  return `${PENDING_PREFIX}${pendingCount}`;
}

/**
 * A trip's food places. So far that's "Not planned yet": every place without
 * a day, then a field to add another. A new place is saved without a day and
 * shows at once, settling when the server re-renders the page with the saved
 * list; a failure rolls back and puts the name back in the field.
 */
export function FoodPlaces({
  tripId,
  places,
  dayCount,
}: {
  tripId: string;
  places: FoodPlace[];
  /** How many days the trip has, so a day past its end reads as not planned. */
  dayCount: number;
}) {
  const [optimistic, addOptimistic] = useOptimistic(
    places,
    (current: FoodPlace[], place: FoodPlace) => [...current, place],
  );
  const unplanned = optimistic.filter(
    (place) => plannedDay(place, dayCount) === null,
  );
  const headingId = useId();

  /** Runs inside the add form's action, so the optimistic row is allowed. */
  async function addPlace(name: string) {
    addOptimistic({ id: pendingId(), name, day: null });
    const result = await addFoodPlace(tripId, name);
    return result.error;
  }

  return (
    <div className="flex flex-col gap-6">
      {optimistic.length === 0 ? (
        <EmptyState
          icon={<FoodIcon className="h-10 w-10" />}
          title="No places saved yet"
        >
          Add somewhere you want to eat and pin it to a day when you decide.
        </EmptyState>
      ) : null}

      <section aria-labelledby={headingId} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 id={headingId} className="text-lg font-bold tracking-[-0.01em]">
            Not planned yet
          </h2>
          {unplanned.length > 0 ? (
            <p className="tabular text-sm font-medium text-muted">
              {unplanned.length} {unplanned.length === 1 ? "place" : "places"}
            </p>
          ) : null}
        </div>

        <div className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
          {unplanned.length > 0 ? (
            <ul className="divide-y divide-hair">
              {unplanned.map((place) => (
                <li
                  key={place.id}
                  className={[
                    "px-4 py-3.5 text-base leading-snug font-semibold break-words text-ink transition-opacity duration-200 ease-out-quint",
                    place.id.startsWith(PENDING_PREFIX) ? "opacity-60" : "",
                  ].join(" ")}
                >
                  {place.name}
                </li>
              ))}
            </ul>
          ) : null}

          <AddPlaceForm onAdd={addPlace} />
        </div>
      </section>
    </div>
  );
}

/**
 * The add field: a name and Add. It clears and keeps focus after adding, so
 * several places can go in a row.
 */
function AddPlaceForm({
  onAdd,
}: {
  onAdd: (name: string) => Promise<string | undefined>;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the place a name.");
      return;
    }

    setError(null);
    setName("");
    inputRef.current?.focus();

    const message = await onAdd(trimmed);
    if (message) {
      setError(message);
      setName(trimmed);
    }
  }

  return (
    <form action={submit} className="flex flex-col gap-2.5 p-3">
      <div className="flex gap-2.5">
        <label htmlFor={`${id}-name`} className="sr-only">
          Place name
        </label>
        <input
          ref={inputRef}
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_PLACE_NAME_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Restaurant, café or dish"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-w-0 flex-1 px-4 ${fieldClass}`}
        />
        <button type="submit" className={submitClass}>
          <PlusIcon className="h-5 w-5" />
          <span className="pr-2 max-sm:sr-only">Add</span>
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
