import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Shield, Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  mode: "login" | "register";
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* ─── LEFT: Video brand panel ──────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <span className="text-sm font-bold tracking-tight">P4P</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">P4P Platform</span>
          </div>

          <div className="flex flex-col items-start gap-8 max-w-md">
            <div className="relative w-32 h-32">
              <motion.svg
                className="absolute inset-0 w-full h-full text-white/25"
                viewBox="0 0 128 128"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "center" }}
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
              </motion.svg>

              <motion.div
                className="absolute inset-0"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "center" }}
              >
                <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.9)]" />
              </motion.div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-white" />
                </div>
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

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} P4P Platform. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Form side ─────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">P4P</span>
            </div>
            <span className="text-base font-semibold">P4P Platform</span>
          </div>

{/* Toggle pill */}
<div className="flex justify-center mb-4">
  <div className="relative inline-grid grid-cols-2 p-1 rounded-lg bg-muted border border-border">
    {/* Sliding indicator */}
    <div
      className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-out ${
        mode === "register" ? "translate-x-full" : "translate-x-0"
      }`}
    />
    <Link
      to="/login"
      className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-md transition-colors text-center ${
        mode === "login"
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Sign in
    </Link>
    <Link
      to="/register"
      className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-md transition-colors text-center ${
        mode === "register"
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Create account
    </Link>
  </div>
</div>
          {/* The current route's form renders here — the layout stays mounted */}
          {children}
        </div>
      </div>
    </div>
  );
}