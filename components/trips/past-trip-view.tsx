import { type ReactNode, useId } from "react";

import { CheckIcon, FoodIcon, OutfitIcon } from "@/components/nav/nav-icons";
import { plannedDay, type FoodPlace } from "@/lib/food/types";
import type { Outfit, OutfitItem } from "@/lib/outfits/types";
import { isPacked, type PackingItem } from "@/lib/packing/types";
import { tripDays } from "@/lib/trips/dates";
import type { PastTrip } from "@/lib/trips/past-trip";

function count(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function packedSummary(items: PackingItem[]) {
  return `${items.filter(isPacked).length} of ${items.length} packed`;
}

/**
 * A finished trip, read back on one page: its packing list, then every day in
 * order with what was worn and where they ate, then any places saved but never
 * planned. Nothing here can be changed, so it's all rendered on the server.
 *
 * An outfit with nothing in it is left out: every day starts with an empty Day
 * and Night outfit, and a trip's worth of those says nothing about the trip.
 */
export function PastTripView({
  trip,
  packingItems,
  packingCategories,
  outfits,
  outfitItems,
  foodPlaces,
}: PastTrip) {
  const days = tripDays(trip);
  const itemsOf = (outfitId: string) =>
    outfitItems.filter((item) => item.outfitId === outfitId);
  const dayOf = (place: FoodPlace) => plannedDay(place, days.length);
  const unplanned = foodPlaces.filter((place) => dayOf(place) === null);

  // An item whose category isn't in the list is shown ungrouped, as on Packing.
  const categoryIds = new Set(packingCategories.map((category) => category.id));
  const ungrouped = packingItems.filter(
    (item) => item.categoryId === null || !categoryIds.has(item.categoryId),
  );
  const groups = packingCategories
    .map((category) => ({
      category,
      items: packingItems.filter((item) => item.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Packing"
        detail={packingItems.length > 0 ? packedSummary(packingItems) : null}
      >
        {packingItems.length === 0 ? (
          <Note>Nothing was on the packing list.</Note>
        ) : (
          <div className="flex flex-col gap-5">
            {ungrouped.length > 0 ? <PackingCard items={ungrouped} /> : null}
            {groups.map(({ category, items }) => (
              <CategoryGroup
                key={category.id}
                name={category.name}
                items={items}
              />
            ))}
          </div>
        )}
      </Section>

      {days.map((day) => {
        const worn = outfits.filter(
          (outfit) =>
            outfit.day === day.number && itemsOf(outfit.id).length > 0,
        );
        const ate = foodPlaces.filter((place) => dayOf(place) === day.number);
        return (
          <Section
            key={day.number}
            title={
              <>
                Day {day.number}
                <span className="font-semibold text-muted"> · {day.label}</span>
              </>
            }
          >
            {worn.length === 0 && ate.length === 0 ? (
              <Note>Nothing planned for this day.</Note>
            ) : (
              <ul className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
                {worn.map((outfit) => (
                  <li key={outfit.id}>
                    <OutfitBlock outfit={outfit} items={itemsOf(outfit.id)} />
                  </li>
                ))}
                {ate.map((place) => (
                  <li key={place.id}>
                    <PlaceRow place={place} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        );
      })}

      {unplanned.length > 0 ? (
        <Section
          title="Places not planned"
          detail={count(unplanned.length, "place", "places")}
        >
          <ul className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
            {unplanned.map((place) => (
              <li key={place.id}>
                <PlaceRow place={place} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

function Section({
  title,
  detail,
  children,
}: {
  title: ReactNode;
  /** A count at the right of the heading, such as "18 of 20 packed". */
  detail?: string | null;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 id={headingId} className="text-lg font-bold tracking-[-0.01em]">
          {title}
        </h2>
        {detail ? (
          <p className="tabular shrink-0 text-sm font-medium text-muted">
            {detail}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** A card holding one quiet line, for a section with nothing in it. */
function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-3xl bg-surface px-4 py-4 text-[15px] leading-snug text-muted shadow-card">
      {children}
    </p>
  );
}

function CategoryGroup({
  name,
  items,
}: {
  name: string;
  items: PackingItem[];
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3 px-1">
        <h3
          id={headingId}
          className="min-w-0 flex-1 text-base font-bold tracking-[-0.01em] break-words"
        >
          {name}
        </h3>
        <p className="tabular shrink-0 text-sm font-medium text-muted">
          {packedSummary(items)}
        </p>
      </div>
      <PackingCard items={items} />
    </section>
  );
}

function PackingCard({ items }: { items: PackingItem[] }) {
  return (
    <ul className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
      {items.map((item) => (
        <li key={item.id}>
          <PackingRow item={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * A packing item as it was left: the round check filled if it went in the
 * bag, an empty ring if not, and for a bulk item how many of them did.
 */
function PackingRow({ item }: { item: PackingItem }) {
  const packed = isPacked(item);
  const bulk = item.quantity > 1;

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <span
        aria-hidden="true"
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
          packed
            ? "border-brand bg-brand text-brand-ink"
            : "border-field-edge text-transparent",
        ].join(" ")}
      >
        <CheckIcon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-base leading-snug font-semibold break-words text-ink">
          {item.name}
          {bulk ? null : (
            <span className="sr-only">{packed ? ", packed" : ", not packed"}</span>
          )}
        </span>
        {bulk ? (
          <span className="tabular text-sm leading-snug font-medium text-muted">
            {item.packedCount} of {item.quantity} packed
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** An outfit's row (the tee tile, its name and item count), then its items, inset under the name as on Outfits. */
function OutfitBlock({
  outfit,
  items,
}: {
  outfit: Outfit;
  items: OutfitItem[];
}) {
  return (
    <>
      <div className="flex items-center gap-3 py-3.5 pr-4 pl-3.5">
        <Tile>
          <OutfitIcon className="h-6 w-6" />
        </Tile>
        <span className="min-w-0 flex-1 pl-1">
          <span className="block text-base leading-tight font-bold break-words">
            {outfit.name}
          </span>
          <span className="tabular mt-1 block text-sm text-muted">
            {count(items.length, "item", "items")}
          </span>
        </span>
      </div>
      <ul
        aria-label={`In ${outfit.name}`}
        className="ml-20.5 divide-y divide-hair border-t border-hair"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="py-3 pr-4 text-base leading-snug break-words text-ink"
          >
            {item.name}
          </li>
        ))}
      </ul>
    </>
  );
}

/** A food place: the bowl tile and its name. */
function PlaceRow({ place }: { place: FoodPlace }) {
  return (
    <div className="flex items-center gap-3 py-3.5 pr-4 pl-3.5">
      <Tile>
        <FoodIcon className="h-6 w-6" />
      </Tile>
      <span className="min-w-0 flex-1 pl-1 text-base leading-tight font-bold break-words">
        {place.name}
      </span>
    </div>
  );
}

function Tile({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.1rem] bg-brand-soft text-brand-text"
    >
      {children}
    </span>
  );
}
