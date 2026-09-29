import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Clock } from "lucide-react";

const STATUS_MESSAGES = [
  "Loading your profile…",
  "Fetching your KPIs…",
  "Preparing your dashboard…",
  "Almost there…",
];

interface Props {
  status?: "loading" | "timeout";
  onRetry?: () => void;
}

export function SettingUpScreen({ status = "loading", onRetry }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (status === "timeout") return;
    const interval = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, [status]);

  if (status === "timeout") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-lg font-bold mb-2">Taking longer than expected</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
          Your account was created, but we're having trouble loading your
          profile. This is usually temporary.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
        </div>
        <p className="text-[11px] text-muted-foreground mt-6">
          Still stuck? Contact HR at{" "}
          <strong className="text-foreground">hr@aoholdings.net</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      {/* Animated orb */}
      <div className="relative w-32 h-32 mb-6">
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_2.4s_linear_infinite]"
          viewBox="0 0 128 128"
          aria-hidden="true"
        >
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="120 260"
            className="text-primary/60"
          />
        </svg>
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite_reverse]"
          viewBox="0 0 128 128"
          aria-hidden="true"
        >
          <circle
            cx="64"
            cy="64"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40 260"
            className="text-emerald-500/60"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-1.5">Setting up your account</h2>
      <p className="text-sm text-muted-foreground mb-6">
        This usually takes just a few seconds.
      </p>

      <div className="h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-muted-foreground"
          >
            {STATUS_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}