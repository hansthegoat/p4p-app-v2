import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { useUser } from "@/lib/p4p/user-context";
import { supabase } from "@/lib/supabase";
import { dropdown } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import {
  Bell, CheckCheck, ClipboardCheck, CheckCircle2, XCircle,
  RefreshCw, MessageSquare, AlertTriangle, AlertOctagon, Loader2,
} from "lucide-react";
import type { Notification } from "@/lib/p4p/types";

export function NotificationBell() {
  const navigate = useNavigate();
  const { employees, notifications, markNotificationRead } = useP4P();
  const { user } = useUser();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setAuthUserId(data?.user?.id || null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const me = employees.find(
    (e) => e.authUserId === authUserId || (user?.email && e.email === user.email)
  );

  const mine = me
    ? notifications
        .filter((n) => n.userId === me.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : [];

  const unread = mine.filter((n) => !n.read);

  const handleClick = (n: Notification) => {
    if (!n.read) markNotificationRead(n.id);
    setOpen(false);
    if (n.link) navigate({ to: n.link });
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      for (const n of unread) markNotificationRead(n.id);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          onClick={() => setOpen((v) => !v)}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <AnimatePresence>
            {unread.length > 0 && (
              <motion.span
                key={unread.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1"
              >
                {unread.length > 9 ? "9+" : unread.length}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdown}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute right-0 top-10 w-80 max-h-[440px] flex flex-col rounded-lg border border-border bg-popover text-popover-foreground shadow-lg z-50 origin-top-right"
          >
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
            <div className="text-[13px] font-semibold">Notifications</div>
            {unread.length > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {mine.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                <div className="text-[12px] text-muted-foreground">
                  No notifications
                </div>
              </div>
            ) : (
              mine.slice(0, 25).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-3 py-2.5 border-b border-border/30 hover:bg-accent/40 transition-colors flex items-start gap-2.5 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] leading-snug">{n.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {formatRelative(n.createdAt)}
                    </div>
                  </div>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {mine.length > 0 && (
            <div className="p-2 border-t border-border/50">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/kpi-updates" });
                }}
                className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-1"
              >
                View all KPI updates
              </button>
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifIcon({ type }: { type: string }) {
  const map: Record<string, { Icon: typeof Bell; tone: string }> = {
    appraisal_submitted: {
      Icon: ClipboardCheck,
      tone: "text-blue-600 dark:text-blue-400",
    },
    appraisal_approved: {
      Icon: CheckCircle2,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    appraisal_rejected: {
      Icon: XCircle,
      tone: "text-red-600 dark:text-red-400",
    },
    appraisal_needs_revision: {
      Icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400",
    },
    new_comment: {
      Icon: MessageSquare,
      tone: "text-blue-600 dark:text-blue-400",
    },
    trigger_pip: { Icon: AlertTriangle, tone: "text-amber-600 dark:text-amber-400" },
    trigger_probation: { Icon: AlertTriangle, tone: "text-red-600 dark:text-red-400" },
    trigger_management_action: {
      Icon: AlertOctagon,
      tone: "text-red-700 dark:text-red-400",
    },
  };
  const m = map[type] || { Icon: Bell, tone: "text-muted-foreground" };
  const I = m.Icon;
  return <I className={`h-4 w-4 ${m.tone}`} />;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}