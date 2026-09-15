import * as Sentry from "@sentry/react";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  if (typeof window === "undefined") return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn("⚠️ VITE_SENTRY_DSN not set — Sentry disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,   // "development" | "production"
    enabled: import.meta.env.PROD,        // only send errors in production
    debug: false,
    tracesSampleRate: 0.1,                // 10% of transactions for perf
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend(event) {
      const msg = event.exception?.values?.[0]?.value || "";
      if (
        msg.includes("ResizeObserver loop") ||
        msg.includes("Non-Error promise rejection") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        return null;
      }
      return event;
    },
  });

  initialized = true;
  console.log("✅ Sentry initialized");

  // Expose to window in dev for manual testing
  if (import.meta.env.DEV) {
    (window as any).Sentry = Sentry;
  }
}

export function setSentryUser(
  user: { id: string; email?: string; name?: string } | null
) {
  if (!initialized) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email, username: user.name });
  } else {
    Sentry.setUser(null);
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error("Reported to Sentry:", error);
  Sentry.captureException(error, { extra: context });
}

export { Sentry };