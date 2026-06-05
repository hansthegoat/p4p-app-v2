import { createFileRoute } from "@tanstack/react-router";
import { Fragment as FragmentRow, useState, useMemo, useRef } from "react";
import Papa from "papaparse";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, Upload, Download, Database, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { EmployeeModal } from "@/components/p4p/EmployeeModal";
import type { Employee } from "@/lib/p4p/types";
import { newId } from "@/lib/p4p/defaults";

export const Route = createFileRoute("/_app/employees")({
  component: EmployeesPage,
});

// Updated CSV template: removed KPI_Weight column
const CSV_TEMPLATE = `Name,JobGrade,IsAdjunct,IsSalesRole,JoinDate,MonthsWorked,KPI_Description,KPI_Metric,KPI_Target,KPI_Actual
Alice,G,false,true,2025-01-15,12,Revenue,GHS,500000,600000
Alice,G,false,true,2025-01-15,12,CSAT,%,90,85
Jane Adjunct,5,true,false,2025-01-01,12,,,,,
`;

function downloadFile(content: string, name: string, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function EmployeesPage() {
  const { employees, calc, removeEmployee, clearEmployees, loadDemo, setEmployees } = useP4P();
  const [mode, setMode] = useState<"company" | "individual">("company");
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const list = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    if (mode === "individual" && selectedId) return list.filter((e) => e.id === selectedId);
    return list;
  }, [employees, search, mode, selectedId]);

  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (e: Employee) => { setEditing(e); setModalOpen(true); };

  const handleUpload = (file: File) => {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        try {
          const required = ["Name", "JobGrade"];
          const headers = res.meta.fields || [];
          for (const r of required) if (!headers.includes(r)) throw new Error(`Missing column: ${r}`);
          const groups = new Map<string, Employee>();
          for (const row of res.data as any[]) {
            const name = (row.Name || "").trim();
            const grade = (row.JobGrade || "").trim();
            if (!name || !grade) continue;
            const key = `${name}__${grade}`;
            if (!groups.has(key)) {
              groups.set(key, {
                id: newId(), name, jobGrade: grade,
                isAdjunct: String(row.IsAdjunct).toLowerCase() === "true",
                isSalesRole: String(row.IsSalesRole).toLowerCase() === "true",
                joinDate: row.JoinDate || new Date().toISOString().slice(0, 10),
                monthsWorked: Number(row.MonthsWorked) || 12,
                kpis: [],
              });
            }
            const emp = groups.get(key)!;
            if (row.KPI_Description && !emp.isAdjunct) {
              emp.kpis.push({
                id: newId(),
                description: row.KPI_Description,
                metric: row.KPI_Metric || "%",
                target: Number(row.KPI_Target) || 0,
                actual: Number(row.KPI_Actual) || 0,
                // weight removed – not used in calculations anymore
                // but keep property to avoid type error; set default 1 (ignored)
                weight: 1,
              });
            }
          }
          const list = Array.from(groups.values());
          setEmployees(list);
          setUploadMsg({ ok: true, msg: `Imported ${list.length} employees.` });
        } catch (e: any) {
          setUploadMsg({ ok: false, msg: e.message || "Failed to parse CSV." });
        }
      },
      error: (err) => setUploadMsg({ ok: false, msg: err.message }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employees and view computed bonuses.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          <Button variant="outline" onClick={() => downloadFile(CSV_TEMPLATE, "p4p_template.csv")}>
            <Download className="h-4 w-4 mr-1" /> Template
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Upload CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
          <Button variant="outline" onClick={loadDemo}><Database className="h-4 w-4 mr-1" /> Demo</Button>
          <Button variant="outline" onClick={clearEmployees}><X className="h-4 w-4 mr-1" /> Clear</Button>
        </div>
      </div>

      {uploadMsg && (
        <div className={`p-3 rounded-md text-sm ${uploadMsg.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-destructive/10 text-destructive"}`}>
          {uploadMsg.msg}
        </div>
      )}

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name…" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">View Mode</label>
            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Company Mode</SelectItem>
                <SelectItem value="individual">Individual Preview</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === "individual" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Employee</label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-[240px]"><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 w-8"></th>
              <th className="p-3">Name</th>
              <th className="p-3">Grade</th>
              <th className="p-3">Points</th>
              <th className="p-3">Sales</th>
              <th className="p-3">Multiplier</th>
              <th className="p-3">Months</th>
              <th className="p-3 text-right">Final Bonus</th>
              <th className="p-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No employees.</td></tr>
            )}
            {filtered.map((e) => {
              const r = calc.perEmployee[e.id];
              const isOpen = expanded === e.id;
              return (
                <FragmentRow key={e.id}>
                  <tr key={e.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      {!e.isAdjunct && e.kpis.length > 0 && (
                        <button onClick={() => setExpanded(isOpen ? null : e.id)}>
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </td>
                    <td className="p-3 font-medium">
                      {e.name}
                      {e.isAdjunct && <span className="ml-2 text-xs px-2 py-0.5 bg-secondary rounded-full">Adjunct</span>}
                    </td>
                    <td className="p-3">{e.jobGrade}</td>
                    <td className="p-3">{r ? fmtNum(r.gradePoints, 0) : "—"}</td>
                    <td className="p-3">{e.isSalesRole ? "Yes" : "—"}</td>
                    <td className="p-3">{r && !e.isAdjunct ? fmtNum(r.performanceMultiplier, 2) : "—"}</td>
                    <td className="p-3">{e.monthsWorked}</td>
                    <td className="p-3 text-right font-semibold">{r ? fmtGHS(r.bonus) : "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleEdit(e)} className="p-1.5 hover:bg-accent rounded">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeEmployee(e.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && r && (
                    <tr className="border-t bg-muted/20">
                      <td colSpan={9} className="p-4">
                        <div className="text-xs font-medium mb-2 text-muted-foreground">KPI Breakdown</div>
                        <table className="w-full text-xs">
                          <thead><tr className="text-left text-muted-foreground">
                            <th className="pb-1">Description</th><th>Metric</th><th>Target</th>
                            <th>Actual</th><th>Ratio</th>
                          </tr></thead>
                          <tbody>
                            {e.kpis.map((k) => (
                              <tr key={k.id} className="border-t border-muted">
                                <td className="py-1">{k.description}</td>
                                <td>{k.metric}</td>
                                <td>{fmtNum(k.target)}</td>
                                <td>{fmtNum(k.actual)}</td>
                                <td>{k.target > 0 ? fmtNum(k.actual / k.target, 3) : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </Card>

      <EmployeeModal open={modalOpen} onClose={() => setModalOpen(false)} employee={editing} />
    </div>
  );
}