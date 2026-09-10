import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 text-muted-foreground border border-border/50">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-5">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}