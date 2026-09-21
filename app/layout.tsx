import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

// Barlow is drawn from the letterforms of American public signage — the same
// grotesque lineage as the transit type programs this interface is built on.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// The condensed cut is the platform-indicator register: day numerals, tallies,
// anything that has to read as a departure board.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Packly",
  description: "What you're doing, wearing, eating and packing today.",
};

/**
 * Without `viewportFit: "cover"` Next emits the default viewport meta, and
 * `env(safe-area-inset-bottom)` resolves to 0 on notched iPhones — the tab
 * plate's safe-area padding silently collapses and its labels sit under the
 * home indicator.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
