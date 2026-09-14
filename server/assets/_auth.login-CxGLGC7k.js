import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { s as supabase } from "./router-w7c543WJ.js";
import { AlertTriangle } from "lucide-react";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}
const KEY_PREFIX = "p4p_login_attempts_";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1e3;
const LOCKOUT_MS = 15 * 60 * 1e3;
function readRecord(email) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + email.toLowerCase());
    if (!raw) return { attempts: [] };
    const parsed = JSON.parse(raw);
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      lockedUntil: parsed.lockedUntil
    };
  } catch {
    return { attempts: [] };
  }
}
function writeRecord(email, rec) {
  try {
    localStorage.setItem(KEY_PREFIX + email.toLowerCase(), JSON.stringify(rec));
  } catch {
  }
}
function checkLockout(email) {
  const rec = readRecord(email);
  if (!rec.lockedUntil) return { locked: false, minutesLeft: 0 };
  const now = Date.now();
  if (now >= rec.lockedUntil) {
    writeRecord(email, { attempts: [] });
    return { locked: false, minutesLeft: 0 };
  }
  const minutesLeft = Math.ceil((rec.lockedUntil - now) / 6e4);
  return { locked: true, minutesLeft };
}
function recordFailure(email) {
  const now = Date.now();
  const rec = readRecord(email);
  rec.attempts = rec.attempts.filter((timestamp) => now - timestamp < WINDOW_MS);
  rec.attempts.push(now);
  if (rec.attempts.length >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
    rec.attempts = [];
    writeRecord(email, rec);
    return { locked: true, attemptsLeft: 0 };
  }
  writeRecord(email, rec);
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - rec.attempts.length };
}
function clearThrottle(email) {
  try {
    localStorage.removeItem(KEY_PREFIX + email.toLowerCase());
  } catch {
  }
}
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutInfo, setLockoutInfo] = useState({
    locked: false,
    minutesLeft: 0
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const lock = checkLockout(email);
    if (lock.locked) {
      setLockoutInfo(lock);
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      clearThrottle(email);
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      const result = recordFailure(email);
      if (result.locked) {
        setLockoutInfo({
          locked: true,
          minutesLeft: 15
        });
        setError("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        setError(err.message || `Login failed. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-1", children: "Welcome back" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sign in to continue to your dashboard" })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
    lockoutInfo.locked && /* @__PURE__ */ jsxs("div", { className: "text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 rounded mb-4 flex items-start gap-2", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Account temporarily locked. Try again in",
        " ",
        /* @__PURE__ */ jsxs("strong", { children: [
          lockoutInfo.minutesLeft,
          " minute",
          lockoutInfo.minutesLeft === 1 ? "" : "s"
        ] }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsx(Label, { children: "Password" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => navigate({
            to: "/forgot-password"
          }), className: "text-xs text-primary hover:underline", children: "Forgot password?" })
        ] }),
        /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading || lockoutInfo.locked, children: lockoutInfo.locked ? "Locked" : loading ? "Signing in..." : "Sign In" })
    ] })
  ] });
}
export {
  LoginPage as component
};
