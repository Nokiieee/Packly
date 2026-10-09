"use client";

import {
  type ReactNode,
  useId,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  addFoodPlace,
  deleteFoodPlace,
  setFoodPlaceDay,
  updateFoodPlace,
} from "@/app/actions/food";
import {
  cancelClass,
  errorClass,
  fieldClass,
  saveClass,
  submitClass,
} from "@/components/app/form-styles";
import { ItemMenu } from "@/components/app/item-menu";
import { EmptyState } from "@/components/app/screen";
import { DayPicker } from "@/components/trips/day-picker";
import {
  CalendarIcon,
  FoodIcon,
  PlusIcon,
} from "@/components/nav/nav-icons";
import {
  MAX_PLACE_NAME_LENGTH,
  plannedDay,
  type FoodPlace,
} from "@/lib/food/types";
import type { TripDay } from "@/lib/trips/dates";

import { PickDaySheet } from "./pick-day-sheet";

/** Ids for rows the server hasn't confirmed yet. */
const PENDING_PREFIX = "pending-";

let pendingCount = 0;
function pendingId() {
  pendingCount += 1;
  return `${PENDING_PREFIX}${pendingCount}`;
}

type Change =
  | { type: "add"; place: FoodPlace }
  | { type: "day"; id: string; day: number | null }
  | { type: "edit"; id: string; name: string }
  | { type: "delete"; id: string };

function applyChange(places: FoodPlace[], change: Change): FoodPlace[] {
  switch (change.type) {
    case "add":
      return [...places, change.place];
    case "day":
      return places.map((place) =>
        place.id === change.id ? { ...place, day: change.day } : place,
      );
    case "edit":
      return places.map((place) =>
        place.id === change.id ? { ...place, name: change.name } : place,
      );
    case "delete":
      return places.filter((place) => place.id !== change.id);
  }
}

function placeCount(count: number) {
  return `${count} ${count === 1 ? "place" : "places"}`;
}

/**
 * A trip's food places: the day strip, the places planned for the day it
 * shows, then "Not planned yet" with the field to add another. A new place
 * starts not planned; its "Pick a day" button opens the sheet, and picking
 * moves it to that day. Each row's ⋮ menu edits or deletes it, as on Packing.
 *
 * The strip starts on today during the trip and on Day 1 before it. Changes
 * show at once and settle when the server re-renders the page with the saved
 * list; a failure rolls back and says so.
 */
export function FoodPlaces({
  tripId,
  places,
  days,
  today,
}: {
  tripId: string;
  places: FoodPlace[];
  /** The trip's days; a place's day past the last reads as not planned. */
  days: TripDay[];
  /** Today's day number during the trip; omit before it. */
  today?: number;
}) {
  const [optimistic, applyOptimistic] = useOptimistic(places, applyChange);
  const [selectedDay, setSelectedDay] = useState(today ?? 1);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  // The row whose ⋮ button takes focus back once its edit closes.
  const [returnFocusId, setReturnFocusId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const dayHeadingId = useId();
  const unplannedId = useId();

  const dayOf = (place: FoodPlace) => plannedDay(place, days.length);
  const selected = days[selectedDay - 1];
  const onSelectedDay = optimistic.filter(
    (place) => dayOf(place) === selectedDay,
  );
  const unplanned = optimistic.filter((place) => dayOf(place) === null);
  const picking = optimistic.find((place) => place.id === pickingId) ?? null;

  /** Runs inside the add form's action, so the optimistic row is allowed. */
  async function addPlace(name: string) {
    setError(null);
    applyOptimistic({ type: "add", place: { id: pendingId(), name, day: null } });
    const result = await addFoodPlace(tripId, name);
    return result.error;
  }

  /** The sheet closes at once; a failed save rolls back and says so. */
  function pickDay(day: number | null) {
    if (!picking) return;
    const { id } = picking;
    setPickingId(null);
    if (day === dayOf(picking)) return;

    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: "day", id, day });
      const result = await setFoodPlaceDay(id, day);
      if (result.error) setError(result.error);
    });
  }

  function startEdit(id: string) {
    setError(null);
    setReturnFocusId(null);
    setEditingId(id);
  }

  function cancelEdit(id: string, restoreFocus: boolean) {
    setEditingId((current) => (current === id ? null : current));
    if (restoreFocus) setReturnFocusId(id);
  }

  /** The edit field closes at once; a failed save rolls back and says so. */
  function editPlace(id: string, name: string) {
    setError(null);
    cancelEdit(id, true);
    startTransition(async () => {
      applyOptimistic({ type: "edit", id, name });
      const result = await updateFoodPlace(id, name);
      if (result.error) setError(result.error);
    });
  }

  function deletePlace(id: string) {
    setError(null);
    cancelEdit(id, false);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const result = await deleteFoodPlace(id);
      if (result.error) setError(result.error);
    });
  }

  function rows(list: FoodPlace[]) {
    return (
      <ul className="divide-y divide-hair">
        {list.map((place) => {
          const day = dayOf(place);
          return (
            <li key={place.id}>
              {editingId === place.id ? (
                <EditPlaceForm
                  place={place}
                  onSave={(name) => editPlace(place.id, name)}
                  onCancel={(restoreFocus) =>
                    cancelEdit(place.id, restoreFocus)
                  }
                />
              ) : (
                <PlaceRow
                  place={place}
                  day={day === null ? null : days[day - 1]}
                  returnFocus={returnFocusId === place.id}
                  onPickDay={() => setPickingId(place.id)}
                  onEdit={() => startEdit(place.id)}
                  onDelete={() => deletePlace(place.id)}
                />
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DayPicker
        days={days}
        defaultDay={selectedDay}
        today={today}
        onChange={setSelectedDay}
      />

      {error ? (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}

      {optimistic.length === 0 ? (
        <EmptyState
          icon={<FoodIcon className="h-10 w-10" />}
          title="No places saved yet"
        >
          Add somewhere you want to eat and pin it to a day when you decide.
        </EmptyState>
      ) : (
        <section aria-labelledby={dayHeadingId} className="flex flex-col gap-3">
          <SectionHeading id={dayHeadingId} count={onSelectedDay.length}>
            {selectedDay === today ? "Today" : `Day ${selectedDay}`}
            <span className="font-semibold text-muted"> · {selected.label}</span>
          </SectionHeading>
          <div className="overflow-hidden rounded-3xl bg-surface shadow-card">
            {onSelectedDay.length > 0 ? (
              rows(onSelectedDay)
            ) : (
              <p className="px-4 py-4 text-[15px] leading-snug text-muted">
                Nothing planned for this day yet.
                {unplanned.length > 0
                  ? " Tap Pick a day on a place below to add it here."
                  : null}
              </p>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby={unplannedId} className="flex flex-col gap-3">
        <SectionHeading id={unplannedId} count={unplanned.length}>
          Not planned yet
        </SectionHeading>
        <div className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
          {unplanned.length > 0 ? rows(unplanned) : null}
          <AddPlaceForm onAdd={addPlace} />
        </div>
      </section>

      <PickDaySheet
        placeName={picking?.name ?? null}
        currentDay={picking ? dayOf(picking) : null}
        days={days}
        today={today}
        onPick={pickDay}
        onClose={() => setPickingId(null)}
      />
    </div>
  );
}

function SectionHeading({
  id,
  count,
  children,
}: {
  id: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between px-1">
      <h2 id={id} className="text-lg font-bold tracking-[-0.01em]">
        {children}
      </h2>
      {count > 0 ? (
        <p className="tabular text-sm font-medium text-muted">
          {placeCount(count)}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A place: its name, a button that opens the sheet, and the ⋮ menu. The day
 * button says "Pick a day" until it has one, then which day it is. A place
 * the server hasn't confirmed yet can't be planned, edited or deleted.
 */
function PlaceRow({
  place,
  day,
  returnFocus,
  onPickDay,
  onEdit,
  onDelete,
}: {
  place: FoodPlace;
  day: TripDay | null;
  returnFocus: boolean;
  onPickDay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pending = place.id.startsWith(PENDING_PREFIX);

  return (
    <div
      className={[
        "flex items-center gap-2 py-2 pl-4 transition-opacity duration-200 ease-out-quint",
        pending ? "opacity-60" : "",
      ].join(" ")}
    >
      <span className="min-w-0 flex-1 py-1.5 text-base leading-snug font-semibold break-words text-ink">
        {place.name}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={onPickDay}
        aria-label={
          day
            ? `Change the day for ${place.name}, now Day ${day.number}, ${day.label}`
            : `Pick a day for ${place.name}`
        }
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-3.5 text-sm font-bold text-brand-text transition-[scale,opacity] duration-200 ease-out-quint active:scale-95 disabled:opacity-40 disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
      >
        <CalendarIcon className="h-4.5 w-4.5" />
        <span className="tabular">{day ? `Day ${day.number}` : "Pick a day"}</span>
      </button>
      <ItemMenu
        itemName={place.name}
        disabled={pending}
        autoFocus={returnFocus}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

/**
 * A place's edit field, in place of its row: the name, with Cancel and Save,
 * as on Packing. Saving closes it straight away; the list shows the new name
 * while the server catches up. Escape cancels.
 */
function EditPlaceForm({
  place,
  onSave,
  onCancel,
}: {
  place: FoodPlace;
  onSave: (name: string) => void;
  onCancel: (restoreFocus: boolean) => void;
}) {
  const id = useId();
  const [name, setName] = useState(place.name);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the place a name.");
      return;
    }
    if (trimmed === place.name) {
      onCancel(true);
      return;
    }
    onSave(trimmed);
  }

  return (
    <form
      action={submit}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        onCancel(true);
      }}
      aria-label={`Edit ${place.name}`}
      className="flex flex-col gap-2.5 bg-surface-sunk p-3"
    >
      <label htmlFor={`${id}-name`} className="sr-only">
        Place name
      </label>
      <input
        id={`${id}-name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={MAX_PLACE_NAME_LENGTH}
        autoFocus
        autoComplete="off"
        enterKeyHint="done"
        placeholder="Restaurant, café or dish"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 ${fieldClass}`}
      />

      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onCancel(true)}
          className={cancelClass}
        >
          Cancel
        </button>
        <button type="submit" className={saveClass}>
          Save
        </button>
      </div>
    </form>
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
