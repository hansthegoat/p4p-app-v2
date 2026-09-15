import { initSentry } from "@/lib/sentry";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Initialize Sentry BEFORE creating the router
try {
  initSentry();
} catch (err) {
  console.error("Sentry init failed (non-fatal):", err);
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};