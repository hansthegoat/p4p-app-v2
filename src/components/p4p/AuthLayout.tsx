import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  mode: "login" | "register";
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* ─── LEFT: Image panel ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        {/* Background image */}
        <img
          src={`${import.meta.env.BASE_URL}auth-bg.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Dark mask for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/55 via-blue-950/35 to-slate-950/55" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 text-white">
          {/* Top brand mark — white version via filter */}
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo-mark.png`}
              alt="P4P"
              className="w-10 h-10 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
              draggable={false}
            />
            <span className="text-lg font-semibold tracking-tight">
              P4P Platform
            </span>
          </div>

          {/* Middle hero */}
          <div className="flex flex-col items-start gap-8 max-w-md">
            {/* Orbit visual */}
            <div className="relative w-32 h-32">
              <svg
                className="absolute inset-0 w-full h-full text-white/25 animate-[spin_30s_linear_infinite]"
                viewBox="0 0 128 128"
              >
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 animate-[spin_6s_linear_infinite]">
                <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.9)]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}logo-mark.png`}
                  alt="P4P"
                  className="w-14 h-14 object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                  draggable={false}
                />
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold tracking-tight leading-tight drop-shadow-lg">
                Pay for performance.
                <br />
                <span className="text-blue-300">Reward what matters.</span>
              </h2>
              <p className="mt-4 text-sm text-white/70 leading-relaxed drop-shadow">
                Track KPIs, run appraisals, and turn performance into fair,
                transparent rewards — all in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Trusted by teams that measure what matters</span>
            </div>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} P4P Platform. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Form panel ─────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo — transparent, no white card */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="P4P Platform"
              className="w-72 sm:w-80 h-auto object-contain"
              draggable={false}
            />
          </div>

          {/* Toggle pill */}
          <div className="flex justify-center mb-4">
            <div className="relative inline-grid grid-cols-2 p-1 rounded-full bg-muted border border-border w-full max-w-sm">
              <div
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm transition-transform duration-300 ease-out ${
                  mode === "register" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <Link
                to="/login"
                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors text-center ${
                  mode === "login"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors text-center ${
                  mode === "register"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create account
              </Link>
            </div>
          </div>

          {/* Form (from child routes) — only this cross-fades, nothing else */}
          <div key={mode} className="auth-form-enter">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}