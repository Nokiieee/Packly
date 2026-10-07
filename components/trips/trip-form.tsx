"use client";

import Link from "next/link";
import { useActionState, useSyncExternalStore } from "react";

import { AuthField } from "@/components/auth/auth-field";
import {
  initialTripFormState,
  MAX_TRIP_NAME_LENGTH,
  type Trip,
  type TripFormState,
} from "@/lib/trips/types";

type TripFormProps = {
  action: (state: TripFormState, formData: FormData) => Promise<TripFormState>;
  /** The trip being edited; omitted when planning a new one. */
  trip?: Trip;
  /** Where Cancel goes, and where a save lands. */
  from: string;
  submitLabel: string;
  pendingLabel: string;
};

/**
 * Where and when: the destination, the first and last day, and the time zone
 * the days run in. Shared by planning a trip and editing one.
 */
export function TripForm({
  action,
  trip,
  from,
  submitLabel,
  pendingLabel,
}: TripFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialTripFormState,
  );
  const values = state.values ?? trip;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {trip ? <input type="hidden" name="id" value={trip.id} /> : null}
      <input type="hidden" name="from" value={from} />

      <AuthField
        label="Where are you going?"
        name="name"
        autoComplete="off"
        placeholder="Lisbon"
        maxLength={MAX_TRIP_NAME_LENGTH}
        defaultValue={values?.name}
        error={state.fieldErrors?.name}
      />

      <div className="grid grid-cols-2 gap-3">
        <AuthField
          label="First day"
          name="startDate"
          type="date"
          defaultValue={values?.startDate}
          error={state.fieldErrors?.startDate}
        />
        <AuthField
          label="Last day"
          name="endDate"
          type="date"
          defaultValue={values?.endDate}
          error={state.fieldErrors?.endDate}
        />
      </div>

      <TimeZoneField
        value={values?.timeZone}
        error={state.fieldErrors?.timeZone}
      />

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={from}
          className="rounded-full px-5 py-3.5 text-center text-base leading-none font-bold text-muted transition-[background-color,scale] duration-200 ease-out-quint active:scale-[0.98] active:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-6 py-3.5 text-base leading-none font-bold text-brand-ink shadow-hero transition-[background-color,scale,opacity] duration-200 ease-out-quint hover:bg-brand-deep active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:opacity-60"
        >
          {pending ? `${pendingLabel}…` : submitLabel}
        </button>
      </div>
    </form>
  );
}

const subscribeToNothing = () => () => {};

let zoneList: string[] | undefined;
function allZones() {
  zoneList ??= Intl.supportedValuesOf("timeZone");
  return zoneList;
}

function deviceZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** "America/New_York" reads as "America/New York". */
function zoneLabel(zone: string) {
  return zone.replaceAll("_", " ");
}

/**
 * The time zone picker, preset to the trip's zone or, for a new trip, this
 * device's. The zone list and the device's zone only exist in the browser, so
 * the server renders just the preset and the full list swaps in on hydration.
 */
function TimeZoneField({ value, error }: { value?: string; error?: string }) {
  const zones = useSyncExternalStore(subscribeToNothing, allZones, () => null);
  const device = useSyncExternalStore(
    subscribeToNothing,
    deviceZone,
    () => null,
  );

  const selected = value ?? device ?? "UTC";
  // An alias such as "Asia/Calcutta" can be missing from the canonical list.
  const options =
    zones === null
      ? [selected]
      : zones.includes(selected)
        ? zones
        : [selected, ...zones];

  const errorId = "timeZone-error";
  const hintId = "timeZone-hint";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="timeZone" className="text-sm font-semibold">
        Time zone
      </label>

      {/* Remounts when the preset changes, since a select only reads its defaultValue once. */}
      <select
        key={`${selected}:${zones === null ? "server" : "browser"}`}
        id="timeZone"
        name="timeZone"
        defaultValue={selected}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        className={[
          "w-full rounded-2xl border bg-surface-sunk px-4 py-3 text-base text-ink outline-none",
          "transition-[background-color,border-color,box-shadow] duration-200 ease-out",
          "focus-visible:bg-surface focus-visible:ring-4",
          error
            ? "border-danger focus-visible:ring-danger/20"
            : "border-field-edge focus-visible:border-brand focus-visible:ring-brand/20",
        ].join(" ")}
      >
        {options.map((zone) => (
          <option key={zone} value={zone}>
            {zoneLabel(zone)}
          </option>
        ))}
      </select>

      <p id={hintId} className="text-xs text-muted">
        Where you&apos;re going. It decides when each day of the trip starts.
      </p>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
