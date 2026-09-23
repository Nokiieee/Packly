import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

// One friendly, open sans for everything. Variable, so headings and labels pick
// any weight without another download.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Packly",
  description: "What you're doing, wearing, eating and packing today.",
};

/**
 * Without `viewportFit: "cover"` Next emits the default viewport meta, and
 * `env(safe-area-inset-bottom)` resolves to 0 on notched iPhones — the floating
 * dock's safe-area offset silently collapses and it sits on the home indicator.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1512" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
