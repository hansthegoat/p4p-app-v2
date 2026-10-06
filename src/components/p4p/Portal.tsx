import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

interface PortalProps {
  children: ReactNode;
  /** Optional: only mount when true. Defaults to always. */
  enabled?: boolean;
}

/**
 * Renders children into document.body, escaping any ancestor with a
 * transform/will-change/filter containing block. Ensures `position: fixed`
 * reaches the actual viewport edges.
 */
export function Portal({ children, enabled = true }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !enabled) return null;

  return createPortal(children, document.body);
}