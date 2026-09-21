import { FoodIcon, OutfitIcon, PackingIcon } from "@/components/nav/nav-icons";

import type { TodayTrip } from "./today-view";

/**
 * Authored demonstration content. No trip model exists yet, so this stands in
 * for one — replace it wholesale once trips are real. It is labelled as sample
 * data on screen so nobody mistakes it for a loaded trip.
 */
export const SAMPLE_TRIP: TodayTrip = {
  name: "Lisbon",
  dates: "12–18 Oct",
  day: 3,
  days: 7,
  rows: [
    {
      href: "/outfits",
      icon: <OutfitIcon className="h-6 w-6" />,
      name: "Outfit",
      status: "Linen shirt, chinos, canvas sneakers",
    },
    {
      href: "/food",
      icon: <FoodIcon className="h-6 w-6" />,
      name: "Meals",
      status: "Time Out Market, then Pastéis de Belém",
    },
    {
      href: "/packing",
      icon: <PackingIcon className="h-6 w-6" />,
      name: "Packing",
      tally: "14 of 22 packed",
      attention: true,
    },
  ],
};

export const SAMPLE_TRIP_NOTE =
  "Sample trip — Packly has no trip model yet, so this day is authored demonstration data.";
