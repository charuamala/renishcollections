"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  /** Doubles as alt text — the artwork carries its own headline. */
  title: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
}

const AUTOPLAY_MS = 6000;
const SIZES = "(min-width: 1280px) 1232px, 100vw";

function SlideImages({ slide, first }: { slide: HeroSlide; first: boolean }) {
  return (
    <>
      {/* Blurred copy fills the frame so artwork is shown whole — never cropped — at any aspect ratio. */}
      <Image
        src={slide.imageUrl}
        alt=""
        aria-hidden
        fill
        sizes={SIZES}
        loading={first ? "eager" : "lazy"}
        className="scale-110 object-cover opacity-70 blur-2xl"
      />
      <Image
        src={slide.imageUrl}
        alt={slide.title}
        fill
        sizes={SIZES}
        loading={first ? "eager" : "lazy"}
        fetchPriority={first ? "high" : undefined}
        className="object-contain"
      />
    </>
  );
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = (index + slides.length) % slides.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [slides.length, reducedMotion],
  );

  // Autoplay — off with reduced motion, while hovered/focused, and when the tab is hidden.
  useEffect(() => {
    if (slides.length < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(active + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [active, paused, reducedMotion, slides.length, goTo]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="relative overflow-hidden rounded-card bg-maroon-900">
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const track = e.currentTarget;
            setActive(Math.round(track.scrollLeft / track.clientWidth));
          }}
        >
          {slides.map((slide, index) => {
            const frame = "relative block aspect-[3/2] w-full shrink-0 snap-center sm:aspect-[16/9]";
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}`}
                className="w-full shrink-0"
              >
                {slide.linkUrl ? (
                  <Link href={slide.linkUrl} className={frame} tabIndex={index === active ? 0 : -1}>
                    <SlideImages slide={slide} first={index === 0} />
                  </Link>
                ) : (
                  <div className={frame}>
                    <SlideImages slide={slide} first={index === 0} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(active - 1)}
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-charcoal shadow-[0_8px_24px_-8px_rgba(36,31,28,0.35)] transition-colors hover:bg-ivory sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(active + 1)}
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-charcoal shadow-[0_8px_24px_-8px_rgba(36,31,28,0.35)] transition-colors hover:bg-ivory sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-2 flex justify-center gap-1">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === active}
              onClick={() => goTo(index)}
              className="flex h-8 w-8 items-center justify-center"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === active ? "w-6 bg-maroon-600" : "w-1.5 bg-ink-400",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
