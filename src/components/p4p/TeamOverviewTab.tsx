import { useMemo, useState } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Target, Award, Activity, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Employee } from "@/lib/p4p/types";

const CHART_COLORS = [
  "hsl(221 70% 50%)",
  "hsl(152 55% 42%)",
  "hsl(38 75% 52%)",
  "hsl(270 70% 55%)",
  "hsl(330 70% 55%)",
  "hsl(189 70% 42%)",
  "hsl(0 65% 55%)",
  "hsl(45 90% 50%)",
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px",
};

function getBand(score: number) {
  if (score >= 1.2) return { label: "Exceptional", color: "text-purple-600 dark:text-purple-400" };
  if (score >= 1.0) return { label: "Exceeds", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 0.8) return { label: "Meets", color: "text-blue-600 dark:text-blue-400" };
  if (score >= 0.6) return { label: "Needs Imp.", color: "text-amber-600 dark:text-amber-400" };
  return { label: "PIP", color: "text-red-600 dark:text-red-400" };
}

interface Props {
  reports: Employee[];
  onSelectReport: (emp: Employee) => void;
}

export function TeamOverviewTab({ reports, onSelectReport }: Props) {
  const { getMonthlyHistory } = useP4P();
  const [range, setRange] = useState<"3" | "6" | "12">("6");

  const chartData = useMemo(() => {
    const points = new Map<string, { year: number; month: number; label: string }>();
    reports.forEach((rep) => {
      getMonthlyHistory(rep.id).forEach((m) => {
        const key = `${m.year}-${m.month}`;
        if (!points.has(key)) {
          points.set(key, {
            year: m.year,
            month: m.month,
            label:
              new Date(m.year, m.month - 1, 1).toLocaleString("default", { month: "short" }) +
              " " +
              String(m.year).slice(2),
          });
        }
      });
    });

    const sorted = Array.from(points.values()).sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month
    );
    const limited = sorted.slice(-parseInt(range));

    return limited.map((p) => {
      const row: any = { label: p.label };
      reports.forEach((rep) => {
        const month = getMonthlyHistory(rep.id).find(
          (m) => m.year === p.year && m.month === p.month
        );
        if (month) {
          row[rep.name] = Number((month.performanceMultiplier * 100).toFixed(1));
        }
      });
      return row;
    });
  }, [reports, getMonthlyHistory, range]);

  const teamStats = useMemo(() => {
    const scores: number[] = [];
    let topPerformer: { name: string; score: number } | null = null;

    reports.forEach((rep) => {
      const history = getMonthlyHistory(rep.id);
      if (history.length === 0) return;
      const latest = history[history.length - 1].performanceMultiplier;
      scores.push(latest);
      if (!topPerformer || latest > topPerformer.score) {
        topPerformer = { name: rep.name, score: latest };
      }
    });

    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { avg, topPerformer, activeCount: scores.length };
  }, [reports, getMonthlyHistory]);

  const reportSummaries = useMemo(() => {
    return reports
      .map((rep) => {
        const history = getMonthlyHistory(rep.id);
        const scores = history.map((h) => h.performanceMultiplier);
        const latest = scores[scores.length - 1] ?? 0;
        const prev = scores[scores.length - 2] ?? null;
        const mom = prev !== null && prev !== 0 ? ((latest - prev) / prev) * 100 : null;
        const spark = history.slice(-6).map((h) => ({
          label: new Date(h.year, h.month - 1, 1).toLocaleString("default", { month: "short" }),
          value: h.performanceMultiplier,
        }));
        return {
          employee: rep,
          latest,
          mom,
          spark,
          monthsTracked: history.length,
        };
      })
      .sort((a, b) => b.latest - a.latest);
  }, [reports, getMonthlyHistory]);

  if (reports.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No direct reports"
          description="You don't have anyone assigned to you yet."
        />
      </Card>
    );
  }

  const reportNames = reports.map((r) => r.name);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Direct Reports"
          value={reports.length}
          accent="primary"
          size="large"
        />
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Team Avg Score"
          value={`${(teamStats.avg * 100).toFixed(1)}%`}
          accent="info"
          size="large"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Top Performer"
          value={teamStats.topPerformer ? teamStats.topPerformer.name.split(" ")[0] : "—"}
          sub={teamStats.topPerformer ? `${(teamStats.topPerformer.score * 100).toFixed(1)}%` : "No data"}
          accent="success"
          size="large"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="With Data"
          value={`${teamStats.activeCount} / ${reports.length}`}
          accent="purple"
          size="large"
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold">Team Performance Trend</h3>
            <p className="text-xs text-muted-foreground">
              Comparing all direct reports over time
            </p>
          </div>
          <Select value={range} onValueChange={(v) => setRange(v as "3" | "6" | "12")}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {chartData.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-6 w-6" />}
            title="No performance data yet"
            description="Once your reports submit appraisals, their trends will appear here."
          />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="label" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 150]}
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                {reportNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold">Your Reports</h3>
          <p className="text-xs text-muted-foreground">
            Sorted by current score — click any card to see full details
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {reportSummaries.map(({ employee, latest, mom, spark, monthsTracked }) => {
            const momUp = mom !== null && mom > 0.5;
            const momDown = mom !== null && mom < -0.5;
            const band = getBand(latest);
            return (
              <button
                key={employee.id}
                onClick={() => onSelectReport(employee)}
                className="text-left w-full"
              >
                <Card className="p-4 hover:border-primary/40 hover:bg-accent/20 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{employee.name}</span>
                        <Badge variant="outline" className={`text-[10px] h-5 ${band.color}`}>
                          {band.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {employee.department} · {employee.role}
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                            Current
                          </div>
                          <div className={`text-xl font-bold ${band.color}`}>
                            {(latest * 100).toFixed(1)}%
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {momUp && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                            {momDown && <TrendingDown className="h-3 w-3 text-red-600" />}
                            {!momUp && !momDown && <Minus className="h-3 w-3 text-muted-foreground" />}
                            <span
                              className={`text-[10px] font-medium ${
                                momUp
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : momDown
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {mom !== null ? `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}%` : "No prev"}
                            </span>
                          </div>
                        </div>

                        {spark.length >= 2 && (
                          <div className="w-24 h-12">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={spark}>
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={CHART_COLORS[0]}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-muted-foreground mt-2">
                        {monthsTracked} month{monthsTracked === 1 ? "" : "s"} tracked
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}