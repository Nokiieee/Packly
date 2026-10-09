"use client";

import { useEffect, useId, useRef } from "react";

import { CloseIcon } from "@/components/nav/nav-icons";
import type { TripDay } from "@/lib/trips/dates";

/**
 * The "Pick a day" sheet. A native modal `<dialog>`, so it sits in the top
 * layer above the dock, keeps focus inside while open, closes on Escape, and
 * hands focus back to the button that opened it. It rises from the bottom on
 * a phone and centres on a wider screen; a tap on the dimmed page closes it.
 *
 * One tap on a day picks it. A place that already has a day also gets a way
 * back to "Not planned yet".
 */
export function PickDaySheet({
  placeName,
  currentDay,
  days,
  today,
  onPick,
  onClose,
}: {
  /** The place being planned; the sheet is open while this is set. */
  placeName: string | null;
  /** The place's day now, highlighted; null if it isn't planned. */
  currentDay: number | null;
  days: TripDay[];
  /** Today's day number, marked with a dot; omit outside the trip. */
  today?: number;
  onPick: (day: number | null) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const open = placeName !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      // Escape, the close button and picking all end in the dialog's own
      // close event, so this is the one place the parent hears about it.
      onClose={onClose}
      // The dialog's padding is zero and its content fills it, so a click
      // that lands on the dialog itself was on the dimmed page around it.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="mt-auto mb-0 w-full max-w-none rounded-t-3xl bg-surface p-0 text-ink shadow-lift backdrop:bg-scrim sm:m-auto sm:max-w-md sm:rounded-3xl"
    >
      {open ? (
        <div className="max-h-[85dvh] overflow-y-auto px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2
                id={headingId}
                className="text-lg font-bold tracking-[-0.01em]"
              >
                Pick a day
              </h2>
              <p className="mt-0.5 text-[15px] leading-snug break-words text-muted">
                {placeName}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
              className="-mt-1.5 -mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-[background-color,scale] duration-200 ease-out-quint active:scale-90 active:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <ul className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {days.map((day) => {
              const current = day.number === currentDay;
              return (
                <li key={day.number}>
                  <button
                    type="button"
                    data-current={current ? "" : undefined}
                    onClick={() => onPick(day.number)}
                    className="group flex w-full flex-col items-center rounded-2xl bg-ground pt-2.5 pb-2 text-ink transition-[background-color,color,scale] duration-200 ease-out-quint select-none active:scale-95 data-current:bg-brand data-current:text-brand-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                  >
                    <span
                      aria-hidden="true"
                      className="text-xs font-semibold text-muted group-data-current:text-brand-ink"
                    >
                      {day.weekday}
                    </span>
                    <span
                      aria-hidden="true"
                      className="tabular mt-0.5 text-lg leading-6 font-bold"
                    >
                      {day.dayOfMonth}
                    </span>
                    {/* Always present so every pill is the same height. */}
                    <span
                      aria-hidden="true"
                      className={[
                        "mt-1 h-1 w-1 rounded-full",
                        day.number === today
                          ? "bg-brand group-data-current:bg-brand-ink"
                          : "",
                      ].join(" ")}
                    />
                    <span className="sr-only">
                      Day {day.number}, {day.label}
                      {day.number === today ? ", today" : ""}
                      {current ? ", planned now" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {currentDay !== null ? (
            <button
              type="button"
              onClick={() => onPick(null)}
              className="mt-4 w-full rounded-full bg-brand-soft py-3 text-base font-bold text-brand-text transition-[scale] duration-200 ease-out-quint active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
            >
              Move back to Not planned yet
            </button>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
