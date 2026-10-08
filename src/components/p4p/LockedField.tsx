import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LockedFieldProps {
  /** Field label, e.g. "Department" */
  label: string;
  /** The field's current source, e.g. "external:ao-hrms" or "manual" */
  source: string;
  /** Fired when HR clicks the Override button */
  onOverride: () => void;
  /** Optional helper text shown below the field */
  hint?: string;
  /** The field control itself (Input, Select, etc.) */
  children: ReactNode;
  /** Optional: force locked state even if source is manual (edge case) */
  forceLocked?: boolean;
}

/**
 * Renders a labeled field. If the field's source is external (i.e. it
 * came from an HRMS sync), the label shows a lock icon, the children
 * are wrapped in a container that disables pointer events, and an
 * "Override" button appears so HR can take ownership of the field.
 *
 * The children are still rendered (dimmed) rather than replaced, so
 * the value stays visible for context.
 */
export function LockedField({
  label,
  source,
  onOverride,
  hint,
  children,
  forceLocked = false,
}: LockedFieldProps) {
  const isLocked = forceLocked || source.startsWith("external:");

  // Provider name from source string: "external:ao-hrms" → "AO HRMS"
  const providerName = isLocked ? prettyProviderName(source) : "";

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs">{label}</Label>
          {isLocked && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground cursor-help">
                    <Lock className="h-3 w-3" />
                    {providerName}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-[11px]">
                  Synced from {providerName}. Locked to prevent conflicts with
                  the source system.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {isLocked && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOverride}
            className="h-6 px-2 text-[10.5px] text-muted-foreground hover:text-foreground"
          >
            Override
          </Button>
        )}
      </div>

      <div
        className={
          isLocked
            ? "mt-1.5 opacity-60 pointer-events-none select-none"
            : "mt-1.5"
        }
        aria-disabled={isLocked}
      >
        {children}
      </div>

      {hint && (
        <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}

/**
 * Turns a source string into a readable provider name.
 * "external:ao-hrms" → "AO HRMS"
 * "external:bamboo-hr" → "Bamboo HR"
 */
function prettyProviderName(source: string): string {
  const raw = source.replace(/^external:/, "");
  return raw
    .split(/[-_]/)
    .map((s) => s.toUpperCase() === s ? s : s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}