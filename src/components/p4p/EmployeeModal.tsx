import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useP4P } from "@/lib/p4p/store";
import type { Employee, KPI } from "@/lib/p4p/types";
import { newId } from "@/lib/p4p/defaults";

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}

function blank(): Employee {
  return {
    id: newId(), name: "", jobGrade: "4", isAdjunct: false, isSalesRole: false,
    joinDate: new Date().toISOString().slice(0, 10), monthsWorked: 12, kpis: [],
  };
}

export function EmployeeModal({ open, onClose, employee }: Props) {
  const { grades, globals, upsertEmployee } = useP4P();
  const [data, setData] = useState<Employee>(blank());

  useEffect(() => {
    if (open) setData(employee ? JSON.parse(JSON.stringify(employee)) : blank());
  }, [open, employee]);

  const setField = <K extends keyof Employee>(k: K, v: Employee[K]) => setData((d) => ({ ...d, [k]: v }));

  const addKpi = () =>
    setField("kpis", [...data.kpis, { id: newId(), description: "", metric: "%", target: 0, actual: 0, weight: 1 }]);
  const updKpi = (id: string, patch: Partial<KPI>) =>
    setField("kpis", data.kpis.map((k) => k.id === id ? { ...k, ...patch } : k));
  const rmKpi = (id: string) =>
    setField("kpis", data.kpis.filter((k) => k.id !== id));

  const save = () => {
    if (!data.name.trim()) return;
    upsertEmployee({
      ...data,
      monthsWorked: Number(data.monthsWorked) || 0,
      kpis: data.isAdjunct ? [] : data.kpis,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] bg-background z-50 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10">
              <h2 className="text-lg font-semibold">{employee ? "Edit" : "Add"} Employee</h2>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <Label>Job Grade</Label>
                <Select value={data.jobGrade} onValueChange={(v) => setField("jobGrade", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.code} value={g.code}>{g.code} — {g.name} ({g.points})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={data.isAdjunct} onCheckedChange={(v) => setField("isAdjunct", !!v)} />
                  Is Adjunct?
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={data.isSalesRole} onCheckedChange={(v) => setField("isSalesRole", !!v)} />
                  Is Sales Role?
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Join Date</Label>
                  <Input type="date" value={data.joinDate} onChange={(e) => setField("joinDate", e.target.value)} />
                </div>
                {globals.prorationOn && (
                  <div>
                    <Label>Months Worked</Label>
                    <Input type="number" min={0} max={12} value={data.monthsWorked}
                      onChange={(e) => setField("monthsWorked", Number(e.target.value))} />
                  </div>
                )}
              </div>

              {!data.isAdjunct && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">KPIs</h3>
                    <Button size="sm" variant="outline" onClick={addKpi}>
                      <Plus className="h-4 w-4 mr-1" /> Add KPI
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.kpis.length === 0 && (
                      <div className="text-sm text-muted-foreground p-4 bg-muted/40 rounded-md">
                        No KPIs — performance multiplier will default to 1.
                      </div>
                    )}
                    {data.kpis.map((k) => (
                      <div key={k.id} className="p-3 border rounded-md space-y-2 bg-card">
                        <div className="flex gap-2 items-start">
                          <Input className="flex-1" placeholder="Description"
                            value={k.description} onChange={(e) => updKpi(k.id, { description: e.target.value })} />
                          <button onClick={() => rmKpi(k.id)} className="p-2 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <Label className="text-xs">Metric</Label>
                            <Select value={k.metric} onValueChange={(v) => updKpi(k.id, { metric: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["%", "GHS", "#", "hrs", "days"].map((m) => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Target</Label>
                            <Input type="number" value={k.target}
                              onChange={(e) => updKpi(k.id, { target: Number(e.target.value) })} />
                          </div>
                          <div>
                            <Label className="text-xs">Actual</Label>
                            <Input type="number" value={k.actual}
                              onChange={(e) => updKpi(k.id, { actual: Number(e.target.value) })} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-2">
                <Button onClick={save} className="flex-1">Save</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
