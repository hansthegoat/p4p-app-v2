import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FolderPlus } from "lucide-react";
import { newId } from "@/lib/p4p/defaults";
import { getDepartments, getRolesForDepartment, getTemplateByDepartmentAndRole } from "@/lib/p4p/kpi-templates";
import { showToast } from "@/lib/toast";

export const Route = createFileRoute("/_app/kpi-framework")({
  component: KPIFrameworkPage,
});

function KPIFrameworkPage() {
  const { grades, getTemplate, saveTemplate, getAllTemplates } = useP4P();
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const departments = getDepartments();
  const templates = getAllTemplates();

  useEffect(() => {
    if (selectedDept) {
      setRoles(getRolesForDepartment(selectedDept));
    }
  }, [selectedDept]);

  useEffect(() => {
    if (selectedDept && selectedRole) {
      // 1. Check if a template exists in the store (saved via UI)
      const existing = getTemplate(selectedDept, selectedRole);
      if (existing) {
        setTemplate(JSON.parse(JSON.stringify(existing)));
        return;
      }
      // 2. Otherwise, try to load from the default templates file
      const defaultTemplate = getTemplateByDepartmentAndRole(selectedDept, selectedRole);
      if (defaultTemplate) {
        const editable = {
          jobGrade: defaultTemplate.jobGrade || "",
          roleName: defaultTemplate.roleName,
          department: defaultTemplate.department,
          categories: defaultTemplate.categories.map((cat: any) => ({
            id: cat.id || newId(),
            name: cat.name,
            weight: cat.weight,
            kpis: cat.kpis.map((k: any) => ({
              id: k.id || newId(),
              description: k.description,
              metric: k.metric,
              target: k.target,
            })),
          })),
        };
        setTemplate(editable);
        return;
      }
      // 3. If no template exists anywhere, create an empty one
      setTemplate({
        jobGrade: "",
        roleName: selectedRole,
        department: selectedDept,
        categories: [],
      });
    } else {
      setTemplate(null);
    }
  }, [selectedDept, selectedRole, getTemplate]);

  const addCategory = () => {
    setTemplate((t: any) => ({
      ...t,
      categories: [
        ...t.categories,
        {
          id: newId(),
          name: "New Category",
          weight: 0,
          kpis: [],
        }
      ]
    }));
  };

  const updateCategory = (catId: string, updates: any) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) => 
        c.id === catId ? { ...c, ...updates } : c
      )
    }));
  };

  const removeCategory = (catId: string) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.filter((c: any) => c.id !== catId)
    }));
  };

  const addKPI = (catId: string) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) =>
        c.id === catId ? {
          ...c,
          kpis: [
            ...c.kpis,
            {
              id: newId(),
              description: "New KPI",
              metric: "%",
              target: 0,
            }
          ]
        } : c
      )
    }));
  };

  const updateKPI = (catId: string, kpiId: string, updates: any) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) =>
        c.id === catId ? {
          ...c,
          kpis: c.kpis.map((k: any) =>
            k.id === kpiId ? { ...k, ...updates } : k
          )
        } : c
      )
    }));
  };

  const removeKPI = (catId: string, kpiId: string) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) =>
        c.id === catId ? {
          ...c,
          kpis: c.kpis.filter((k: any) => k.id !== kpiId)
        } : c
      )
    }));
  };

  const handleSave = () => {
    if (!template || !selectedDept || !selectedRole) return;
    
    // Validate weights sum to 100
    const totalWeight = template.categories.reduce((sum: number, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100 && template.categories.length > 0) {
      showToast.error("Invalid Weights", `Category weights must sum to 100%. Currently: ${totalWeight}%.`);
      return;
    }
    
    saveTemplate(template);
    showToast.success("Template Saved", `Template for ${selectedDept} - ${selectedRole} has been saved.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">KPI Framework</h1>
        <Button onClick={handleSave} disabled={!template}>Save Template</Button>
      </div>

      <Card className="p-4 flex flex-wrap gap-4 items-end">
        <div>
          <Label>Department</Label>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Role</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!selectedDept}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {template && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Template: {selectedDept} - {selectedRole}</h2>
            <Button size="sm" variant="outline" onClick={addCategory}>
              <FolderPlus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>

          {template.categories.length === 0 && (
            <div className="text-muted-foreground text-center py-8">No categories yet. Add one.</div>
          )}

          {template.categories.map((cat: any) => (
            <Card key={cat.id} className="p-4 border">
              <div className="flex gap-3 mb-3">
                <Input
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                  placeholder="Category name"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={cat.weight}
                  onChange={(e) => updateCategory(cat.id, { weight: Number(e.target.value) })}
                  placeholder="Weight %"
                  className="w-24"
                />
                <Button variant="destructive" size="sm" onClick={() => removeCategory(cat.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="pl-4 space-y-2">
                <div className="grid grid-cols-10 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-4">KPI Description</div>
                  <div className="col-span-2">Metric</div>
                  <div className="col-span-2">Target</div>
                  <div className="col-span-2">Action</div>
                </div>

                {cat.kpis.map((kpi: any) => (
                  <div key={kpi.id} className="grid grid-cols-10 gap-2">
                    <Input
                      value={kpi.description}
                      onChange={(e) => updateKPI(cat.id, kpi.id, { description: e.target.value })}
                      placeholder="KPI description"
                      className="col-span-4"
                    />
                    <Select
                      value={kpi.metric}
                      onValueChange={(v) => updateKPI(cat.id, kpi.id, { metric: v })}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="GHS">GHS</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                        <SelectItem value="#">#</SelectItem>
                        <SelectItem value="ROI">ROI</SelectItem>
                        <SelectItem value="days">days</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={kpi.target}
                      onChange={(e) => updateKPI(cat.id, kpi.id, { target: Number(e.target.value) })}
                      className="col-span-2"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeKPI(cat.id, kpi.id)} className="col-span-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button size="sm" variant="outline" onClick={() => addKPI(cat.id)}>
                  <Plus className="h-4 w-4 mr-1" /> Add KPI
                </Button>
              </div>
            </Card>
          ))}

          {template.categories.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Total weight: {template.categories.reduce((sum: number, c: any) => sum + c.weight, 0)}%
            </div>
          )}
        </Card>
      )}
    </div>
  );
}