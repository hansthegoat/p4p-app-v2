import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase, isCurrentUserSuperAdmin } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const isSuperAdmin = await isCurrentUserSuperAdmin();
    if (!isSuperAdmin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});