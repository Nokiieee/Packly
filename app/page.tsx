import type { Metadata } from "next";
import Link from "next/link";

import { SAMPLE_TRIP } from "@/components/app/sample-trip";
import { TodayView } from "@/components/app/today-view";
import { Logo } from "@/components/brand/logo";
import { ArrowRightIcon } from "@/components/nav/nav-icons";

export const metadata: Metadata = {
  title: "Packly · Your trip, one day at a time",
};

const primaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-brand-ink shadow-hero transition-[background-color,scale] duration-200 ease-out-quint hover:bg-brand-deep active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ground focus-visible:outline-none sm:w-auto";

const secondaryButton =
  "inline-flex w-full items-center justify-center rounded-full bg-surface px-7 py-3.5 text-base font-bold text-ink shadow-card transition-[box-shadow,scale] duration-200 ease-out-quint hover:shadow-lift active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ground focus-visible:outline-none sm:w-auto";

/**
 * The signed-out front door. Signed-in visitors never see it: the proxy sends
 * `/` straight to Today. The preview is the real Today composition rendered
 * from the sample trip, so the page can't promise a screen the app doesn't
 * draw.
 */
export default function Home() {
  return (
    // The mint disc behind the preview is wider than a phone; clip it rather
    // than let it widen the page.
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2 lg:px-8">
        <Logo />
      </header>

      <main className="flex-1 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <section className="mx-auto grid w-full max-w-6xl gap-14 px-5 pt-8 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-center lg:gap-20 lg:px-8 lg:pt-14 lg:pb-24">
          <div className="max-w-xl">
            <h1 className="text-[2.625rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[4rem]">
              Your trip, one day at a time.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-muted">
              Packly answers the four questions every trip morning asks: what
              you&apos;re doing, what you&apos;re wearing, what you&apos;re
              eating and what to bring. One calm screen for each day away.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className={primaryButton}>
                Sign up
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link href="/sign-in" className={secondaryButton}>
                Log in
              </Link>
            </div>
          </div>

          <TodayPreview />
        </section>

        <section
          aria-labelledby="closing-heading"
          className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 lg:items-center lg:px-8 lg:text-center"
        >
          <h2
            id="closing-heading"
            className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.025em] text-balance sm:text-4xl"
          >
            Ready when your trip is.
          </h2>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/sign-up" className={primaryButton}>
              Sign up
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/sign-in" className={secondaryButton}>
              Log in
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * The Today screen held up for inspection: a white bezel around the real view
 * on a soft mint disc. `inert` keeps its links out of the tab order and its
 * content out of the accessibility tree; the caption says what it shows.
 */
function TodayPreview() {
  return (
    <figure className="relative isolate -mx-3 w-[calc(100%+1.5rem)] max-w-[25rem] sm:mx-auto sm:w-full">
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[125%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft/70"
      />

      <div className="rounded-[2.75rem] bg-surface p-2 shadow-lift">
        <div
          inert
          className="overflow-hidden rounded-[2.25rem] bg-ground pt-4 pb-6 select-none"
        >
          <div className="px-5 pb-1">
            <Logo size="h-8 w-8" />
          </div>
          <TodayView trip={SAMPLE_TRIP} titleAs="p" />
        </div>
      </div>

      <figcaption className="mt-5 text-center text-sm leading-snug text-pretty text-muted">
        Sample trip: a made-up day in Lisbon, shown on Packly&apos;s Today
        screen.
      </figcaption>
    </figure>
  );
}
