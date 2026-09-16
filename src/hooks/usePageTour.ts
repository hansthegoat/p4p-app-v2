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

/**
 * Re-triggers the popover entrance animation on every step change.
 */
function replayPopoverAnimation() {
  const popover = document.querySelector(".p4p-tour-popover") as HTMLElement | null;
  if (!popover) return;
  popover.classList.remove("p4p-tour-enter");
  void popover.offsetWidth;
  popover.classList.add("p4p-tour-enter");
}

/**
 * Multi-colored celebration: 2 side bursts + continuous rain for ~2.5s.
 */
function fireCelebration() {
  const colors = [
    "#FF6B6B", // coral red
    "#FFD93D", // yellow
    "#6BCB77", // green
    "#4D96FF", // blue
    "#B983FF", // purple
    "#FF9F1C", // orange
    "#00D9C0", // teal
    "#FF6FB5", // pink
    "#0B2545", // brand navy
    "#22C55E", // brand green
  ];

  // Side bursts — left and right
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

  // Continuous rain from top
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

export function usePageTour(tour: Tour | null, enabled = true) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!tour || !enabled) return;
    if (hasRunRef.current) return;
    if (isTourDone(tour.key)) return;

    let cancelled = false;

    const tryRun = () => {
      if (cancelled) return;

      const available = filterAvailableSteps(tour.steps);

      if (available.length === 0) {
        markTourDone(tour.key);
        return;
      }

      hasRunRef.current = true;

      // Declare first, assign after — lets callbacks reference the instance
      let driverObj: ReturnType<typeof driver>;

      driverObj = driver({
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
          // Close the tour first so confetti lands on a clean page
          driverObj.destroy();
          fireCelebration();
        },
        onDestroyed: () => {
          markTourDone(tour.key);
        },
      });

      driverObj.drive();
    };

    const t1 = window.setTimeout(tryRun, 800);
    const t2 = window.setTimeout(() => {
      if (!hasRunRef.current && !isTourDone(tour.key) && !cancelled) {
        tryRun();
      }
    }, 1400);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.key, enabled]);
}