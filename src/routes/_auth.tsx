import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/components/p4p/AuthLayout";

export const Route = createFileRoute("/_auth")({
  component: AuthLayoutWrapper,
});

function AuthLayoutWrapper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode: "login" | "register" = pathname.includes("register") ? "register" : "login";

  return (
    <AuthLayout mode={mode}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: mode === "register" ? 24 : -24, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: mode === "register" ? -24 : 24, filter: "blur(4px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}