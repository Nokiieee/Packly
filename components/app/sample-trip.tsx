import { FoodIcon, OutfitIcon, PackingIcon } from "@/components/nav/nav-icons";

import type { TodayTrip } from "./today-view";

/**
 * Authored demonstration content for the signed-out landing page's preview of
 * Today. Signed-in users see their real trip; this is only ever shown with a
 * caption saying it's a sample.
 */
export const SAMPLE_TRIP: TodayTrip = {
  name: "Lisbon",
  date: "Wednesday 14 October",
  dates: "12–18 Oct",
  day: 3,
  days: 7,
  startsIn: 0,
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
