import { FoodIcon, OutfitIcon, PackingIcon } from "@/components/nav/nav-icons";

import type { TodayTrip } from "./today-view";

/**
 * Authored demonstration content. No trip model exists yet, so this stands in
 * for one — replace it wholesale once trips are real. It is labelled as sample
 * data on screen so nobody mistakes it for a loaded trip.
 */
export const SAMPLE_TRIP: TodayTrip = {
  name: "Lisbon",
  date: "Wednesday, 14 October",
  dates: "12–18 Oct",
  day: 3,
  days: 7,
  packing: { packed: 14, total: 22 },
  rows: [
    {
      href: "/outfits",
      icon: <OutfitIcon className="h-6 w-6" />,
      name: "Outfit",
      detail: "Linen shirt, chinos, canvas sneakers",
    },
    {
      href: "/food",
      icon: <FoodIcon className="h-6 w-6" />,
      name: "Meals",
      detail: "Time Out Market, then Pastéis de Belém",
    },
    {
      href: "/packing",
      icon: <PackingIcon className="h-6 w-6" />,
      name: "Packing",
      detail: "14 of 22 packed",
      todo: "8 left",
    },
  ],
};

export const SAMPLE_TRIP_NOTE =
  "Sample trip — Packly has no trip model yet, so this day is authored demonstration data.";
