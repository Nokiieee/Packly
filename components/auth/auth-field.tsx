import type { ComponentPropsWithoutRef } from "react";

type AuthFieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "name" | "className">;

/**
 * One labelled input: a soft rounded field on the sunk surface that lifts to
 * white with a brand ring on focus. Errors are wired through `aria-describedby` /
 * `aria-invalid` so a screen reader announces them with the field.
 */
export function AuthField({
  label,
  name,
  error,
  hint,
  required = true,
  ...inputProps
}: AuthFieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-semibold"
      >
        {label}
      </label>

      <input
        {...inputProps}
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-2xl border bg-surface-sunk px-4 py-3 text-base text-ink outline-none",
          "transition-[background-color,border-color,box-shadow] duration-200 ease-out placeholder:text-muted",
          "focus-visible:bg-surface focus-visible:ring-4",
          error
            ? "border-danger focus-visible:ring-danger/20"
            : "border-field-edge focus-visible:border-brand focus-visible:ring-brand/20",
        ].join(" ")}
      />

      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
