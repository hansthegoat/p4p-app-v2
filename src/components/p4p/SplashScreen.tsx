import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "Loading your workspace…",
  "Fetching your KPIs…",
  "Setting things up…",
  "Almost there…",
];

export function SplashScreen() {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), 1300);
    const hideTimer = window.setTimeout(() => setHidden(true), 1800);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (hidden) return;
    const interval = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 500);
    return () => window.clearInterval(interval);
  }, [hidden]);

  if (hidden) return null;

  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        transitionDuration: "600ms",
        backgroundColor: "#ffffff",
        colorScheme: "light",
      }}
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo + sweeping arcs */}
        <div className="relative flex items-center justify-center w-[28rem] h-[28rem] sm:w-[32rem] sm:h-[32rem]">
          {/* Primary sweep — navy */}
          <svg
            className="absolute inset-0 w-full h-full animate-[spin_2.4s_linear_infinite]"
            viewBox="0 0 200 200"
          >
            <defs>
              <linearGradient id="sweepNavy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B2545" stopOpacity="0" />
                <stop offset="60%" stopColor="#0B2545" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0B2545" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="url(#sweepNavy)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="160 400"
            />
          </svg>

          {/* Accent sweep — green */}
          <svg
            className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite_reverse]"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#22C55E"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="50 400"
              opacity="0.75"
            />
          </svg>

          {/* Logo */}
          <img
            src={logoSrc}
            alt="P4P Platform"
            className="relative w-80 sm:w-[26rem] h-auto object-contain animate-[splashFadeIn_1.4s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            draggable={false}
          />
        </div>

        {/* Cycling status text */}
        <div className="h-6 mt-4 flex items-center justify-center overflow-hidden">
          <p
            key={messageIndex}
            className="text-[13px] tracking-wide animate-[splashTagline_0.4s_ease-out_forwards]"
            style={{ color: "#0B2545", opacity: 0.65 }}
          >
            {STATUS_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}