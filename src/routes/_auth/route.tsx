import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AuthLayout } from "@/components/p4p/AuthLayout";

export const Route = createFileRoute("/_auth")({
  component: AuthLayoutWrapper,
});

function AuthLayoutWrapper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode: "login" | "register" = pathname.includes("register")
    ? "register"
    : "login";

  return (
    <AuthLayout mode={mode}>
      <Outlet />
    </AuthLayout>
  );
}