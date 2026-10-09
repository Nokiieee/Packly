import type { TripDay } from "@/lib/trips/dates";

/**
 * One pill per day of the trip, pick one. Native radios under the pills, so
 * inside a form the chosen day is submitted as `name` (its number) with no
 * JavaScript, arrow keys move between days, and the checked pill styles
 * itself through `has-checked`. Wraps onto more rows for a long trip.
 */
export function DayPicker({
  days,
  name = "day",
  legend = "Assign to which day?",
  defaultDay,
}: {
  days: TripDay[];
  name?: string;
  legend?: string;
  /** The day number selected to begin with; none if omitted. */
  defaultDay?: number;
}) {
  return (
    <fieldset>
      <legend className="text-[15px] font-semibold text-muted">{legend}</legend>

      <div className="mt-3 flex flex-wrap gap-2">
        {days.map((day) => (
          <label
            key={day.number}
            className="tabular flex min-h-11 cursor-pointer items-center rounded-full border border-field-edge bg-surface px-4 text-[15px] font-semibold text-ink transition-[background-color,border-color,color,scale] duration-200 ease-out-quint select-none active:scale-95 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-ink has-focus-visible:ring-2 has-focus-visible:ring-brand has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-surface"
          >
            <input
              type="radio"
              name={name}
              value={day.number}
              defaultChecked={day.number === defaultDay}
              className="sr-only"
            />
            Day {day.number}
            {/* The date for screen readers; the pill stays as short as the design. */}
            <span className="sr-only">, {day.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
