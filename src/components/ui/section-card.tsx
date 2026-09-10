import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  description,
  icon,
  action,
  children,
  className = "",
  noPadding = false,
}: SectionCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-base font-semibold text-foreground truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </Card>
  );
}