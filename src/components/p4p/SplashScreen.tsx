import { useEffect, useState } from "react";

export function SplashScreen() {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Total: ~1.3s on screen, 500ms fade out
    const fadeTimer = window.setTimeout(() => setFading(true), 1300);
    const hideTimer = window.setTimeout(() => setHidden(true), 1800);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#ffffff",
        colorScheme: "light",
        transitionDuration: "500ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Logo — fades in with a subtle scale + blur removal */}
      <img
        src={logoSrc}
        alt="P4P Platform"
        className="w-56 sm:w-64 h-auto object-contain animate-[splashFadeIn_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        draggable={false}
        style={{ opacity: 0 }}
      />

      {/* Thin progress line — draws once, disappears */}
      <div className="mt-12 w-44 h-[2px] bg-slate-100/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0B2545] rounded-full animate-[splashProgress_1.2s_cubic-bezier(0.65,0,0.35,1)_forwards]"
          style={{ width: "0%" }}
        />
      </div>

      {/* Optional refined tagline — remove if logo already has it */}
      <p
        className="mt-8 text-[10px] tracking-[0.25em] uppercase text-[#0B2545]/40 animate-[splashTagline_0.8s_cubic-bezier(0.16,1,0.3,1)_0.3s_forwards]"
        style={{ opacity: 0 }}
      >
        Precision Performance
      </p>
    </div>
  );
}