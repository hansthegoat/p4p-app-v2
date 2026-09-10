import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/p4p/AppLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});