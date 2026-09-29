import { useMemo, useState } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { employeeNeedsKpis } from "@/lib/p4p/types";
import { Search, FileSpreadsheet, Users, ChevronRight, CheckCircle2 } from "lucide-react";

interface Props {
  onPickRole: (department: string, role: string) => void;
}

interface Group {
  department: string;
  role: string;
  employees: { id: string; name: string }[];
}

export function MissingKpisTab({ onPickRole }: Props) {
  const { employees } = useP4P();
  const [search, setSearch] = useState("");

  const groups = useMemo<Group[]>(() => {
    const affected = employees.filter(
      (e) => e.roleType !== "hr" && e.roleType !== "admin" && !e.isAdjunct && employeeNeedsKpis(e)
    );

    const byKey = new Map<string, Group>();
    for (const emp of affected) {
      const key = `${emp.department}|||${emp.role}`;
      if (!byKey.has(key)) {
        byKey.set(key, { department: emp.department, role: emp.role, employees: [] });
      }
      byKey.get(key)!.employees.push({ id: emp.id, name: emp.name });
    }

    return Array.from(byKey.values()).sort(
      (a, b) =>
        b.employees.length - a.employees.length ||
        a.department.localeCompare(b.department) ||
        a.role.localeCompare(b.role)
    );
  }, [employees]);

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.department.toLowerCase().includes(q) ||
        g.role.toLowerCase().includes(q) ||
        g.employees.some((e) => e.name.toLowerCase().includes(q))
    );
  }, [groups, search]);

  const totalEmployees = groups.reduce((s, g) => s + g.employees.length, 0);

  if (groups.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title="All caught up"
          description="Every employee has KPIs assigned. Nothing to set up."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {totalEmployees} employee{totalEmployees === 1 ? "" : "s"} need KPIs
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
          filtered.map((group) => {
            const [showAll, setShowAll] = [group.employees.length <= 3, false];
            const names = group.employees.map((e) => e.name);
            const visible = names.slice(0, 3);
            const extra = names.length - 3;

            return (
              <Card
                key={`${group.department}-${group.role}`}
                className="p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{group.department}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm">{group.role}</span>
                        <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                          {group.employees.length} employee{group.employees.length === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {visible.join(", ")}
                        {extra > 0 && ` +${extra} more`}
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
            );
          })
        )}
      </div>
    </div>
  );
}