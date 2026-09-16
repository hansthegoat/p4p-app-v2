import { useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import {
  BASE_DRIVER_CONFIG,
  PAGE_TOURS,
  getWelcomeTourForRole,
  resetAllTours,
  isTourDone,
  type Tour,
  type TourStep,
} from "@/lib/p4p/tours";

function filterAvailableSteps(steps: TourStep[]): TourStep[] {
  if (typeof document === "undefined") return [];
  return steps.filter((step) => !step.element || !!document.querySelector(step.element));
}

interface TourReplayButtonProps {
  role: string;
}

export function TourReplayButton({ role }: TourReplayButtonProps) {
  const [open, setOpen] = useState(false);

  const availableTours: { label: string; tour: Tour }[] = [
    { label: "Welcome tour", tour: getWelcomeTourForRole(role) },
    ...Object.entries(PAGE_TOURS).map(([path, tour]) => ({
      label: tour.key.replace("page_", "").replace(/_/g, " "),
      tour,
    })),
  ];

  const startTour = (tour: Tour) => {
    setOpen(false);
    const available = filterAvailableSteps(tour.steps);
    if (available.length === 0) return;

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
    });
    driverObj.drive();
  };

  const handleResetAll = () => {
    resetAllTours();
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        className="w-full justify-start gap-2"
      >
        <Compass className="h-4 w-4" /> Replay tours
      </Button>

      {open && (
        <div className="border border-border rounded-lg p-2 space-y-1 bg-background">
          {availableTours.map((t, i) => (
            <button
              key={i}
              onClick={() => startTour(t.tour)}
              className="w-full text-left text-[13px] px-3 py-2 rounded-md hover:bg-accent transition-colors capitalize"
            >
              {t.label}
              {isTourDone(t.tour.key) && (
                <span className="ml-2 text-[10px] text-muted-foreground">
                  (replay)
                </span>
              )}
            </button>
          ))}
          <div className="border-t border-border pt-1 mt-1">
            <button
              onClick={handleResetAll}
              className="w-full text-left text-[11px] px-3 py-2 rounded-md hover:bg-red-500/10 text-red-600 transition-colors"
            >
              Reset all tours
            </button>
          </div>
        </div>
      )}
    </div>
  );
}