import { useEffect, useRef, useState } from "react";

const TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;

// Dropped mousemove — it fires ~60x/sec and thrashes the timers
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

interface SessionTimeoutState {
  showWarning: boolean;
  secondsLeft: number;
  extend: () => void;
  logoutNow: () => void;
}

export function useSessionTimeout(onTimeout: () => void): SessionTimeoutState {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(WARNING_BEFORE_MS / 1000));

  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const showWarningRef = useRef(false);

  // Keep onTimeout fresh without re-running the effect
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearAll = () => {
    if (warningTimerRef.current !== null) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (tickIntervalRef.current !== null) {
      window.clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  };

  const scheduleTimers = () => {
    clearAll();
    showWarningRef.current = false;
    setShowWarning(false);

    // Warning timer
    warningTimerRef.current = window.setTimeout(() => {
      showWarningRef.current = true;
      setShowWarning(true);
      setSecondsLeft(Math.round(WARNING_BEFORE_MS / 1000));

      tickIntervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
      }, 1000);
    }, TIMEOUT_MS - WARNING_BEFORE_MS);

    // Logout timer
    logoutTimerRef.current = window.setTimeout(() => {
      onTimeoutRef.current();
    }, TIMEOUT_MS);
  };

  const extend = () => {
    scheduleTimers();
  };

  const logoutNow = () => {
    clearAll();
    onTimeoutRef.current();
  };

  useEffect(() => {
    const handleActivity = () => {
      // If warning is visible, don't auto-reset — user must click "Stay signed in"
      if (showWarningRef.current) return;
      scheduleTimers();
    };

    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, handleActivity, { passive: true })
    );

    scheduleTimers();

    return () => {
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, handleActivity)
      );
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    showWarning,
    secondsLeft,
    extend,
    logoutNow,
  };
}