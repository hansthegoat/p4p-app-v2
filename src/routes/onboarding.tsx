import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SplashScreen } from "@/components/p4p/SplashScreen";
import {
  ArrowRight, Target, Users, Trophy, Check,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

// ─── Rich SVG visuals (same as before) ───────────────────

function SlideTarget() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <defs>
        <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="ring2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      <motion.circle
        cx="120" cy="120" r="100"
        fill="none" stroke="url(#ring2)" strokeWidth="1.5"
        strokeDasharray="3 8" strokeLinecap="round"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "120px 120px" }}
      />
      <circle cx="120" cy="120" r="72" fill="none" stroke="url(#ring1)" strokeWidth="2" />
      <circle cx="120" cy="120" r="72" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="45 452" strokeLinecap="round" />
      <circle cx="120" cy="120" r="44" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="18" fill="url(#core)" />

      <line x1="120" y1="30" x2="120" y2="42" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="198" x2="120" y2="210" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="120" x2="42" y2="120" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <line x1="198" y1="120" x2="210" y2="120" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />

      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "120px 120px" }}
      >
        <circle cx="120" cy="48" r="5" fill="#22C55E" />
      </motion.g>
    </svg>
  );
}

function SlideTeam() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <defs>
        <linearGradient id="avatar1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="avatar2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#16A34A" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="avatar3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="avatar4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.circle
        cx="120"
        cy="80"
        r="80"
        fill="url(#centerGlow)"
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "120px 80px" }}
      />

      <motion.circle
        cx="120"
        cy="80"
        r="32"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="1.5"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
        style={{ transformOrigin: "120px 80px" }}
      />
      <motion.circle
        cx="120"
        cy="80"
        r="32"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="1.5"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
        style={{ transformOrigin: "120px 80px" }}
      />

      <g stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round">
        <motion.line
          x1="120" y1="80" x2="65" y2="165"
          strokeDasharray="4 6"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="120" y1="80" x2="175" y2="165"
          strokeDasharray="4 6"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="65" y1="165" x2="120" y2="190"
          strokeDasharray="4 6"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="175" y1="165" x2="120" y2="190"
          strokeDasharray="4 6"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </g>

      {/* Central avatar — "you" — pulsing + floating */}
      <motion.g
        animate={{
          scale: [1, 1.06, 1],
          y: [0, -3, 0],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "120px 80px" }}
      >
        <circle cx="120" cy="80" r="32" fill="url(#avatar1)" />
        <circle
          cx="120"
          cy="80"
          r="32"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
        <circle cx="120" cy="72" r="11" fill="#ffffff" fillOpacity="0.9" />
        <path d="M 100 100 Q 120 85 140 100 Z" fill="#ffffff" fillOpacity="0.9" />
      </motion.g>

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        style={{ transformOrigin: "65px 165px" }}
      >
        <circle cx="65" cy="165" r="24" fill="url(#avatar2)" />
        <circle
          cx="65"
          cy="165"
          r="24"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <circle cx="65" cy="159" r="8" fill="#ffffff" fillOpacity="0.9" />
        <path d="M 50 178 Q 65 168 80 178 Z" fill="#ffffff" fillOpacity="0.9" />
      </motion.g>

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ transformOrigin: "175px 165px" }}
      >
        <circle cx="175" cy="165" r="24" fill="url(#avatar3)" />
        <circle
          cx="175"
          cy="165"
          r="24"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <circle cx="175" cy="159" r="8" fill="#ffffff" fillOpacity="0.9" />
        <path d="M 160 178 Q 175 168 190 178 Z" fill="#ffffff" fillOpacity="0.9" />
      </motion.g>

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        style={{ transformOrigin: "120px 190px" }}
      >
        <circle cx="120" cy="190" r="24" fill="url(#avatar4)" />
        <circle
          cx="120"
          cy="190"
          r="24"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <circle cx="120" cy="184" r="8" fill="#ffffff" fillOpacity="0.9" />
        <path d="M 105 203 Q 120 193 135 203 Z" fill="#ffffff" fillOpacity="0.9" />
      </motion.g>
    </svg>
  );
}

function SlideTrophy() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <defs>
        <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="110" r="100" fill="url(#glow)" />

      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 75 55 L 165 55 L 165 100 Q 165 140 120 155 Q 75 140 75 100 Z"
          fill="url(#cupGrad)"
        />
        <path
          d="M 75 55 L 165 55 L 165 100 Q 165 140 120 155 Q 75 140 75 100 Z"
          fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5"
        />
        <path d="M 75 70 Q 50 70 50 95 Q 50 115 75 120" fill="none" stroke="url(#cupGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 165 70 Q 190 70 190 95 Q 190 115 165 120" fill="none" stroke="url(#cupGrad)" strokeWidth="6" strokeLinecap="round" />
        <rect x="112" y="155" width="16" height="24" fill="#D97706" />
        <rect x="90" y="179" width="60" height="10" rx="3" fill="#D97706" />
        <rect x="80" y="189" width="80" height="8" rx="3" fill="#B45309" />
        <path
          d="M 120 85 L 125 95 L 137 96 L 128 104 L 131 116 L 120 110 L 109 116 L 112 104 L 103 96 L 115 95 Z"
          fill="#ffffff" fillOpacity="0.95"
        />
      </motion.g>

      {[
        { x: 60, y: 45, d: 0 },
        { x: 180, y: 55, d: 0.5 },
        { x: 200, y: 130, d: 1 },
        { x: 40, y: 140, d: 1.5 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r="3"
          fill="#FBBF24"
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.d,
          }}
        />
      ))}
    </svg>
  );
}

// ─── Slide data with per-slide background ────────────────

interface Slide {
  id: string;
  icon: typeof Target;
  eyebrow: string;
  headline: string;
  body: string;
  visual: React.ReactNode;
  background: string;
}

const SLIDES: Slide[] = [
  {
    id: "kpis",
    icon: Target,
    eyebrow: "Measure",
    headline: "Your KPIs, clearly defined",
    body: "See exactly what you're measured on — targets, weights, and how each KPI contributes to your score.",
    visual: <SlideTarget />,
    background: "onboarding-1.jpg",
  },
  {
    id: "team",
    icon: Users,
    eyebrow: "Compare",
    headline: "Compare within your team",
    body: "See how you're performing against your department. Celebrate wins, spot patterns, and stay motivated.",
    visual: <SlideTeam />,
    background: "onboarding-2.jpg",
  },
  {
    id: "bonus",
    icon: Trophy,
    eyebrow: "Reward",
    headline: "Performance becomes reward",
    body: "When the cycle is published, your bonus is calculated transparently — every point traced back to real work.",
    visual: <SlideTrophy />,
    background: "onboarding-3.jpg",
  },
];

const SLIDE_DURATION_MS = 5000;

// ─── Main component ──────────────────────────────────────

function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    localStorage.setItem("p4p_onboarding_done", "true");
    localStorage.setItem("p4p_welcome_tour_pending", "true");
    setShowSplash(true);
    window.setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 1600);
  };

  const goTo = (i: number) => {
    if (i < 0 || i >= SLIDES.length) return;
    setIndex(i);
    setProgress(0);
  };

  const next = () => {
    if (isLast) {
      finish();
    } else {
      goTo(index + 1);
    }
  };

  // Auto-advance timer
  useEffect(() => {
    if (paused || showSplash) return;
    if (typeof document !== "undefined" && document.hidden) return;

    const start = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / SLIDE_DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        window.clearInterval(tick);
        if (isLast) {
          finish();
        } else {
          setIndex((i) => i + 1);
          setProgress(0);
        }
      }
    }, 50);

    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, isLast, showSplash]);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col"
      {...pauseHandlers}
    >
      {/* ⭐ Background image stack — crossfades between slides */}
      <div className="absolute inset-0">
<AnimatePresence>
  <motion.img
    key={slide.background}
    src={`${import.meta.env.BASE_URL}${slide.background}`}
    alt=""
    className="absolute inset-0 w-full h-full object-cover"
    initial={{ opacity: 0, scale: 1.08 }}
    animate={{
      opacity: 1,
      scale: [1.08, 1.0, 1.08],
    }}
    exit={{ opacity: 0 }}
    transition={{
      opacity: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
      scale: {
        duration: 16,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.65, 1],
      },
    }}
    draggable={false}
  />
</AnimatePresence>
        {/* Dark black overlay — lighter so the image is visible */}
        <div className="absolute inset-0 bg-black/60" />


        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}logo-mark.png`}
              alt=""
              className="w-8 h-8 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
              draggable={false}
            />
            <span className="text-white/90 font-semibold text-sm tracking-tight">
              P4P Platform
            </span>
          </div>

          <button
            onClick={finish}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-lg text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <div className="w-56 h-56 sm:w-72 sm:h-72 mb-8 relative">
                  {slide.visual}
                </div>

                <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15">
                  <slide.icon className="h-3.5 w-3.5 text-white/80" />
                  <span className="text-[11px] font-medium tracking-wide text-white/80 uppercase">
                    {slide.eyebrow}
                  </span>
                </div>

<h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-white mb-4 [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
                  {slide.headline}
                </h1>
<p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
                  {slide.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="p-6 pb-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                style={{ width: i === index ? "40px" : "8px" }}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span className="absolute inset-0 bg-white/20 rounded-full" />
                {i === index && (
                  <span
                    className="absolute inset-y-0 left-0 bg-white rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                )}
                {i < index && <span className="absolute inset-0 bg-white/60 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full max-w-md">
            {index > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => goTo(index - 1)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 px-5"
              >
                Back
              </Button>
            )}
            <Button
              onClick={next}
              size="lg"
              className="flex-1 gap-2 bg-white text-[#0B2545] hover:bg-white/90 rounded-full h-12 font-semibold"
            >
              {isLast ? (
                <>
                  <Check className="h-4 w-4" />
                  Get started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}