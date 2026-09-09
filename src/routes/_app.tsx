import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/p4p/AppLayout";
import { P4PProvider } from "@/lib/p4p/store";
import { supabase } from "@/lib/supabase";
import { UserProvider } from "@/lib/p4p/user-context";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <P4PProvider>
      <UserProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </UserProvider>
    </P4PProvider>
  ),
});