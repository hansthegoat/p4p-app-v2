import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer } from "@/lib/motion";
import { getCurrentUser } from "@/lib/supabase";
import { PageLoader } from "@/components/ui/page-loader";
import {
  Users, Clock, CheckCircle, TrendingUp, FileText,
  LayoutGrid, MessageSquare, Target,
} from "lucide-react";
import { KpiChangeReviewDrawer } from "@/components/p4p/KpiChangeReviewDrawer";
import { TeamOverviewTab } from "@/components/p4p/TeamOverviewTab";
import { EmployeeDetailDrawer } from "@/components/p4p/EmployeeDetailDrawer";
import type { KpiUpdateRequest, Employee } from "@/lib/p4p/types";
import { TeamKpisTab } from "@/components/p4p/TeamKpisTab";
import { SupervisorKpiEditorDrawer } from "@/components/p4p/SupervisorKpiEditorDrawer";

export const Route = createFileRoute("/_app/my-team")({
  component: MyTeamPage,
});

function MyTeamPage() {
  const navigate = useNavigate();
  const { employees, getSupervisorPendingKpiUpdates, kpiUpdateRequests } = useP4P();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<KpiUpdateRequest | null>(null);
  const [selectedReport, setSelectedReport] = useState<Employee | null>(null);
  const [tab, setTab] = useState<"overview" | "reviews" | "team-kpis">("overview");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      const emp =
        employees.find((e) => e.email === user.email) ||
        employees.find((e) => e.authUserId === user.id);
      setMe(emp || null);
      setLoading(false);
    };
    load();
  }, [employees, navigate]);

  const myReports = useMemo(
    () => (me ? employees.filter((e) => e.supervisorId === me.id) : []),
    [employees, me]
  );

  const pending = useMemo(
    () => (me ? getSupervisorPendingKpiUpdates(me.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me?.id, kpiUpdateRequests]
  );

  const totalChanges = pending.reduce((sum, r) => sum + r.diffs.length, 0);

  if (loading) {
    return <PageLoader text="Loading your team…" />;
  }

  if (!me || me.isManager !== true) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No team to manage"
        description="You're not assigned as a supervisor to anyone. Contact HR if this is unexpected."
      />
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      <div data-tour="my-team-header">
        <PageHeader
          title="My Team"
          description={`You supervise ${myReports.length} ${myReports.length === 1 ? "person" : "people"}.`}
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-tour="my-team-stats">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Direct Reports"
          value={myReports.length}
          accent="primary"
          size="large"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Pending KPI Changes"
          value={pending.length}
          accent={pending.length > 0 ? "warning" : "default"}
          pulse={pending.length > 0 ? "amber" : "none"}
          size="large"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Changes to Review"
          value={totalChanges}
          accent="info"
          size="large"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full" data-tour="my-team-tabs">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Reviews
            {pending.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
                    <TabsTrigger value="team-kpis" className="gap-2">
            <Target className="h-4 w-4" /> Team KPIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4" data-tour="my-team-overview">
          <TeamOverviewTab
            reports={myReports}
            onSelectReport={(emp) => setSelectedReport(emp)}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-4" data-tour="my-team-list">
          {pending.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                icon={<CheckCircle className="h-6 w-6" />}
                title="All caught up"
                description="No KPI changes waiting for your review."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((req) => {
                const emp = employees.find((e) => e.id === req.employeeId);
                const scoreDelta = (req.afterScore - req.beforeScore) * 100;
                return (
                  <Card key={req.id} className="p-5 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {emp?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-sm">
                              {emp?.name || "Unknown"}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
                            >
                              <Clock className="h-2.5 w-2.5" />
                              Awaiting you
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {req.department} · {req.role}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-muted-foreground">
                              {req.diffs.length} change{req.diffs.length === 1 ? "" : "s"}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span
                              className={
                                scoreDelta > 0.5
                                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                  : scoreDelta < -0.5
                                  ? "text-red-600 dark:text-red-400 font-semibold"
                                  : "text-muted-foreground"
                              }
                            >
                              {(req.beforeScore * 100).toFixed(1)}% →{" "}
                              {(req.afterScore * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(req)}
                        className="gap-1.5 shrink-0"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Review
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
                <TabsContent value="team-kpis" className="mt-4">
          <TeamKpisTab
            reports={myReports}
            onEdit={(emp) => setEditingEmployee(emp)}
          />
        </TabsContent>
      </Tabs>

      <KpiChangeReviewDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        reviewerId={me.id}
        reviewerName={me.name}
      />

      <EmployeeDetailDrawer
        employee={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
      <SupervisorKpiEditorDrawer
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSaved={() => {
          // Force a fresh read from the store on next render
        }}
      />
    </motion.div>
  );
}