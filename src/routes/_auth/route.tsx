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
      <div
        key={pathname}
        className="animate-[fadeSlide_0.32s_cubic-bezier(0.22,1,0.36,1)_forwards]"
      >
        <Outlet />
      </div>
    </AuthLayout>
  );
}