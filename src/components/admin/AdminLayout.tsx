import { type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

interface Props {
  children: ReactNode;
}

export function AdminLayout({ children }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      showToast.success("Logged out", "You've been signed out of admin.");
      navigate({ to: "/login" });
    } catch (err: any) {
      showToast.error("Logout failed", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar — violet, admin indicator */}
      <header className="sticky top-0 z-40 bg-violet-600 shadow-lg shadow-violet-600/20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">
                Super Admin Console
              </span>
              <span className="text-[10.5px] text-white/70">
                Platform operator access
              </span>
            </div>
          </div>

          <div className="flex-1" />

          <Link
            to="/dashboard"
            className="text-[12.5px] font-medium text-white/90 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to app
          </Link>

          <button
            onClick={handleLogout}
            className="text-[12.5px] font-medium text-white/90 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Warning strip — subtle, admin reminder */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40">
        <div className="max-w-7xl mx-auto px-6 py-2 text-[11.5px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Shield className="h-3 w-3" />
          You are viewing the platform admin console. Actions here affect
          every tenant. Read carefully.
        </div>
      </div>

      {/* Content — standard light theme */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}