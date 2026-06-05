import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const ok = localStorage.getItem("p4p_logged_in") === "1";
    throw redirect({ to: ok ? "/dashboard" : "/login" });
  },
  component: () => null,
});
