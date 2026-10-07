import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import confetti from "canvas-confetti";
import {
  BASE_DRIVER_CONFIG,
  isTourDone,
  markTourDone,
  type Tour,
  type TourStep,
} from "@/lib/p4p/tours";

function filterAvailableSteps(steps: TourStep[]): TourStep[] {
  if (typeof document === "undefined") return [];
  return steps.filter((step) => {
    if (!step.element) return true;
    return !!document.querySelector(step.element);
  });
}

function replayPopoverAnimation() {
  const popover = document.querySelector(
    ".p4p-tour-popover",
  ) as HTMLElement | null;
  if (!popover) return;
  popover.classList.remove("p4p-tour-enter");
  void popover.offsetWidth;
  popover.classList.add("p4p-tour-enter");
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fireCelebration() {
  // Respect users who have reduced motion enabled at the OS level.
  if (prefersReducedMotion()) return;

  const colors = [
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#B983FF",
    "#FF9F1C",
    "#00D9C0",
    "#FF6FB5",
    "#0B2545",
    "#22C55E",
  ];

  confetti({
    particleCount: 80,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.7 },
    colors,
    scalar: 1.1,
  });
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.7 },
    colors,
    scalar: 1.1,
  });

  const duration = 2500;
  const end = Date.now() + duration;

  const interval = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 8,
      angle: 90,
      spread: 220,
      startVelocity: 14,
      gravity: 0.55,
      decay: 0.94,
      origin: { x: Math.random(), y: -0.1 },
      colors,
      scalar: 0.95,
      ticks: 220,
    });
  }, 120);
}

export function usePageTour(
  tour: Tour | null,
  enabled = true,
  onComplete?: () => void,
) {
  const hasRunRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  // Keep the callback ref fresh without re-triggering the effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!tour || !enabled) return;
    if (hasRunRef.current) return;

    // Test/dev kill switch: skip all tours when explicitly disabled.
    // Used by Playwright setups to prevent tour overlays from blocking
    // clicks during automated tests. Never set in production.
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem("p4p_disable_tours") === "true"
    ) {
      return;
    }

    if (isTourDone(tour.key)) return;

    let cancelled = false;

    const tryRun = () => {
      if (cancelled) return;

      const available = filterAvailableSteps(tour.steps);

      if (available.length === 0) {
        markTourDone(tour.key);
        onCompleteRef.current?.();
        return;
      }

      hasRunRef.current = true;

      const driverObj = driver({
        ...BASE_DRIVER_CONFIG,
        steps: available.map((s) => ({
          element: s.element,
          popover: {
            title: s.popover.title,
            description: s.popover.description,
            side: s.popover.side,
            align: s.popover.align,
          },
        })),
        onHighlighted: () => {
          requestAnimationFrame(replayPopoverAnimation);
        },
        onDoneClick: () => {
          driverObj.destroy();
          fireCelebration();
        },
        onDestroyed: () => {
          markTourDone(tour.key);
          driverRef.current = null;
          onCompleteRef.current?.();
        },
      });

      driverRef.current = driverObj;
      driverObj.drive();
    };

    const t1 = window.setTimeout(tryRun, 1200);
    const t2 = window.setTimeout(() => {
      if (!hasRunRef.current && !isTourDone(tour.key) && !cancelled) {
        tryRun();
      }
    }, 2200);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      // If the component unmounts while the tour is active, tear it down so
      // the overlay and focus trap don't get stuck on the page.
      if (driverRef.current) {
        try {
          driverRef.current.destroy();
        } catch {
          /* driver may already be destroyed */
        }
        driverRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.key, enabled]);
}