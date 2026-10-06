import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 600,
  suffix = "",
  prefix = "",
  className,
}: Props) {
  const [display, setDisplay] = useState(value);
  const startRef = useRef<number | null>(null);
  const startValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip animation entirely for reduced-motion users
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    startValueRef.current = display;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current =
        startValueRef.current + (value - startValueRef.current) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  // Screen readers get the final value once, without animation chatter.
  // The animated visual is aria-hidden; the SR-only text carries meaning.
  const srValue = `${prefix}${value.toFixed(decimals)}${suffix}`;

  return (
    <>
      <span className={className} aria-hidden="true">
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">{srValue}</span>
    </>
  );
}