import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/p4p/AppLayout";
import { P4PProvider } from "@/lib/p4p/store";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: () => {
    // Only check auth on the client — localStorage doesn't exist during SSR
    if (typeof window === "undefined") return;
    if (localStorage.getItem("p4p_logged_in") !== "1") {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <P4PProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </P4PProvider>
  ),
});
