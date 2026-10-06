import { useMemo, useState } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Search, Inbox, ChevronRight, Clock, CheckCircle2,
} from "lucide-react";

interface Props {
  onPickRole: (department: string, role: string) => void;
}

interface Group {
  department: string;
  role: string;
  requests: {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    comment?: string;
    createdAt: string;
  }[];
}

export function KpiRequestsTab({ onPickRole }: Props) {
  const { kpiRequests } = useP4P();
  const [search, setSearch] = useState("");

  const groups = useMemo<Group[]>(() => {
    const pending = kpiRequests.filter((r) => r.status === "pending");

    const byKey = new Map<string, Group>();
    for (const req of pending) {
      const key = `${req.department}|||${req.role}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          department: req.department,
          role: req.role,
          requests: [],
        });
      }
      byKey.get(key)!.requests.push({
        id: req.id,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        employeeEmail: req.employeeEmail,
        comment: req.comment,
        createdAt: req.createdAt,
      });
    }

    return Array.from(byKey.values()).sort(
      (a, b) =>
        b.requests.length - a.requests.length ||
        a.department.localeCompare(b.department) ||
        a.role.localeCompare(b.role)
    );
  }, [kpiRequests]);

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.department.toLowerCase().includes(q) ||
        g.role.toLowerCase().includes(q) ||
        g.requests.some(
          (r) =>
            r.employeeName.toLowerCase().includes(q) ||
            r.employeeEmail.toLowerCase().includes(q)
        )
    );
  }, [groups, search]);

  const totalRequests = groups.reduce((s, g) => s + g.requests.length, 0);

  if (groups.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title="No pending requests"
          description="When employees ask HR for KPIs, they'll appear here."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Inbox className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {totalRequests} pending request{totalRequests === 1 ? "" : "s"}
              </div>
              <div className="text-xs text-muted-foreground">
                Across {groups.length} role group{groups.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search dept, role, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No matches for "{search}"
          </Card>
        ) : (
          filtered.map((group) => (
            <Card
              key={`${group.department}-${group.role}`}
              className="p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{group.department}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm">{group.role}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                      >
                        {group.requests.length} request
                        {group.requests.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <div className="space-y-1 mt-2">
                      {group.requests.map((req) => (
                        <div
                          key={req.id}
                          className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap"
                        >
                          <span className="font-medium text-foreground">
                            {req.employeeName}
                          </span>
                          <span className="text-muted-foreground/60">·</span>
                          <span>{req.employeeEmail}</span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                          {req.comment && (
                            <span className="italic text-muted-foreground">
                              "{req.comment}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onPickRole(group.department, group.role)}
                  className="gap-1.5 shrink-0"
                >
                  Set up template
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}