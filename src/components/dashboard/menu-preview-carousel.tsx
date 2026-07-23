"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

/** Slide dwell time. Four slides at 4s is a ~16s full cycle — long enough to read a layout, short enough to see all four without waiting. */
const SLIDE_DURATION_MS = 4000;
/** Matches the CSS transition below; used only to park the outgoing slide once it has finished leaving. */
const TRANSITION_MS = 800;

/**
 * Width the slide content is authored at, before scaling.
 *
 * The engines lay out against a real pixel width (Grid switches column
 * counts, Modern's leader dots measure themselves), so the preview renders
 * at one honest desktop-ish width and is then scaled down as a whole. That
 * keeps every slide showing the same proportions on every screen — a
 * responsive re-layout at 340px would show a *different* menu than the one
 * the user will actually get.
 */
const SOURCE_WIDTH = 720;

export interface MenuPreviewSlide {
  id: string;
  /** Template name, shown under the stage so the layout on screen is identifiable. */
  label: string;
  /** Server-rendered menu. Arrives as an already-rendered RSC payload, so no engine code reaches the client bundle. */
  content: ReactNode;
}

export interface MenuPreviewCarouselProps {
  slides: MenuPreviewSlide[];
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The OS "reduce motion" setting, as an external store rather than
 * effect-plus-state.
 *
 * `matchMedia` is exactly what useSyncExternalStore is for: it is a live
 * source outside React that can change while the page is open, and a
 * carousel that keeps spinning after the user asked motion to stop is the
 * precise complaint that setting exists to register. The server snapshot is
 * `false` because the preference is unknowable during SSR; the first client
 * render corrects it before any autoplay timer is ever armed.
 */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Auto-advancing preview of the layout engines, for the "no menus yet"
 * empty state.
 *
 * Client-side only for the *controls*: the slides themselves are server
 * components handed down as `content`, which is what lets a four-layout
 * carousel cost nothing but this file in the client bundle.
 *
 * The transition is a plain CSS 3D transform (GPU-composited, no library):
 * the outgoing slide swings away to rotateY(-35deg) scale(.88) as the
 * incoming one arrives from rotateY(35deg). Slides that are neither sit
 * parked at the entry angle with transitions disabled, so they don't
 * visibly drift while off-stage.
 */
export function MenuPreviewCarousel({ slides }: MenuPreviewCarouselProps) {
  const t = useTranslations("dashboard.myMenus.preview");
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const parkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setPrevious((current) => (current === next ? null : index));
      setIndex(next);
      // Once the leave animation is over the outgoing slide is parked back
      // at the entry angle. Without this it would keep its "leaving"
      // transform and swing the wrong way on its next turn.
      if (parkTimer.current) clearTimeout(parkTimer.current);
      parkTimer.current = setTimeout(() => setPrevious(null), TRANSITION_MS);
    },
    [index],
  );

  const step = useCallback(
    (delta: number) => goTo((index + delta + slides.length) % slides.length, delta),
    [goTo, index, slides.length],
  );

  // Autoplay. Deliberately skipped entirely under reduced motion — the dots
  // and arrows still work, so all four layouts stay reachable by hand
  // rather than three of them being hidden.
  useEffect(() => {
    if (reducedMotion || isPaused || slides.length < 2) return;
    const timer = setTimeout(() => step(1), SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [reducedMotion, isPaused, step, slides.length, index]);

  useEffect(() => {
    return () => {
      if (parkTimer.current) clearTimeout(parkTimer.current);
    };
  }, []);

  function slideStyle(position: number): React.CSSProperties {
    const isActive = position === index;
    const isLeaving = position === previous;
    if (reducedMotion) {
      return { opacity: isActive ? 1 : 0, transition: "none" };
    }
    const angle = 35 * direction;
    const transform = isActive
      ? "rotateY(0deg) scale(1)"
      : isLeaving
        ? `rotateY(${-angle}deg) scale(.88)`
        : `rotateY(${angle}deg) scale(.88)`;
    return {
      opacity: isActive ? 1 : 0,
      transform,
      // A parked slide must snap, not glide: animating it would show a
      // stray menu swinging around behind the active one.
      transition:
        isActive || isLeaving
          ? `transform ${TRANSITION_MS}ms cubic-bezier(.4,0,.2,1), opacity ${TRANSITION_MS}ms cubic-bezier(.4,0,.2,1)`
          : "none",
    };
  }

  const current = slides[index];

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      // Focus pauses too: a keyboard user tabbing to the arrows needs the
      // slide to hold still while they decide, exactly as hover does.
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative">
        <div
          className="border-border bg-surface-secondary relative h-[300px] overflow-hidden rounded-xl border sm:h-[400px] lg:h-[440px]"
          style={{ perspective: 1200 }}
        >
          {slides.map((slide, position) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 flex justify-center",
                position === index ? "" : "pointer-events-none",
              )}
              style={slideStyle(position)}
              aria-hidden={position === index ? undefined : true}
            >
              {/* shrink-0 is load-bearing: this is a flex item, so without
                  it a narrow stage squashes the 720px layout box instead of
                  letting the transform do the scaling — the engines would
                  then lay out against the wrong width and the preview would
                  render several times too small. Measured at 375px: the box
                  collapsed to ~222px and the slide drew at 98px. */}
              <div
                className="shrink-0 origin-top [--preview-scale:0.4] sm:[--preview-scale:0.58] lg:[--preview-scale:0.66]"
                style={{ width: SOURCE_WIDTH, transform: "scale(var(--preview-scale))" }}
              >
                {slide.content}
              </div>
            </div>
          ))}

          {/* The slide is a full menu clipped by the stage; without this it
              ends on a hard horizontal cut that reads as a broken image
              rather than as a menu continuing below the fold. */}
          <div
            className="from-surface-secondary pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent"
            aria-hidden="true"
          />
        </div>

        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t("previous")}
          className="border-border bg-surface text-foreground-secondary hover:text-foreground focus-visible:ring-ring absolute top-1/2 left-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:outline-none sm:flex"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={t("next")}
          className="border-border bg-surface text-foreground-secondary hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:outline-none sm:flex"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <p className="text-body-sm text-foreground-secondary min-w-24 text-end font-medium">
          {current?.label}
        </p>
        <div className="flex items-center gap-1.5">
          {slides.map((slide, position) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(position, position >= index ? 1 : -1)}
              aria-label={slide.label}
              aria-current={position === index}
              className={cn(
                "focus-visible:ring-ring duration-fast size-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                position === index ? "bg-accent-600" : "bg-border hover:bg-foreground-tertiary",
              )}
            />
          ))}
        </div>
        <span className="min-w-24" aria-hidden="true" />
      </div>
    </div>
  );
}
