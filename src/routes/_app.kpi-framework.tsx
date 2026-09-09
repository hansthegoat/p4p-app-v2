import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FolderPlus, Users, Upload, Download, FileSpreadsheet } from "lucide-react";
import { newId } from "@/lib/p4p/defaults";
import { getDepartments, getRolesForDepartment, getTemplateByDepartmentAndRole } from "@/lib/p4p/kpi-templates";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const Route = createFileRoute("/_app/kpi-framework")({
  component: KPIFrameworkPage,
});

function KPIFrameworkPage() {
  const { grades, getTemplate, saveTemplate, getAllTemplates, applyTemplateToEmployees } = useP4P();
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = getDepartments();

  useEffect(() => {
    if (selectedDept) {
      setRoles(getRolesForDepartment(selectedDept));
    }
  }, [selectedDept]);

  useEffect(() => {
    if (selectedDept && selectedRole) {
      const existing = getTemplate(selectedDept, selectedRole);
      if (existing) {
        setTemplate(JSON.parse(JSON.stringify(existing)));
        return;
      }
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
              measurementSource: k.measurementSource || "",
            })),
          })),
        };
        setTemplate(editable);
        return;
      }
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
              measurementSource: "",
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
    const totalWeight = template.categories.reduce((sum: number, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100 && template.categories.length > 0) {
      alert(`Category weights must sum to 100%. Currently: ${totalWeight}%.`);
      return;
    }
    saveTemplate(template);
    alert("Template saved successfully!");
  };

  const handleApplyToEmployees = () => {
    if (!template || !selectedDept || !selectedRole) {
      alert("Please select a department and role and load a template first.");
      return;
    }
    const count = applyTemplateToEmployees(selectedDept, selectedRole, template);
    if (count === 0) {
      alert("No employees found with this department and role.");
    } else {
      alert(`✅ Updated ${count} employee(s) with the new template. Their actuals have been reset to 0.`);
    }
  };

  // ===== BULK UPLOAD =====

  const handleBulkUpload = (file: File) => {
    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    const processData = (data: any[]) => {
      if (!data || data.length === 0) {
        alert("No data found in file.");
        return;
      }

      // Expected columns: Department, Role, Category, Category Weight (%), KPI Description, Metric, Target, Measurement Source
      const headers = Object.keys(data[0]);
      const required = ["Category", "KPI Description", "Metric", "Target"];
      const missing = required.filter(r => !headers.some(h => h.trim() === r));
      if (missing.length > 0) {
        alert(`Missing columns: ${missing.join(", ")}. Please check your file format.`);
        return;
      }

      // Group by department+role
      const groups: Record<string, { dept: string; role: string; categories: Record<string, { weight: number; kpis: any[] }> }> = {};

      let totalRows = 0;
      for (const row of data) {
        const dept = (row["Department"] || "").trim();
        const role = (row["Role"] || "").trim();
        const catName = (row["Category"] || "").trim();
        const catWeight = parseFloat(row["Category Weight (%)"]) || 0;
        const kpiDesc = (row["KPI Description"] || "").trim();
        const metric = (row["Metric"] || "").trim() || "%";
        const target = parseFloat(row["Target"]) || 0;
        const source = (row["Measurement Source"] || "").trim();

        if (!dept || !role || !catName || !kpiDesc) continue;

        const key = `${dept}-${role}`;
        if (!groups[key]) {
          groups[key] = { dept, role, categories: {} };
        }
        if (!groups[key].categories[catName]) {
          groups[key].categories[catName] = { weight: catWeight, kpis: [] };
        }
        groups[key].categories[catName].kpis.push({
          description: kpiDesc,
          metric,
          target,
          measurementSource: source,
        });
        totalRows++;
      }

      if (totalRows === 0) {
        alert("No valid data found. Please check your file format.");
        return;
      }

      // Build templates for each department+role
      let savedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const [key, group] of Object.entries(groups)) {
        try {
          const categories = Object.entries(group.categories).map(([name, data]) => ({
            id: newId(),
            name,
            weight: data.weight,
            kpis: data.kpis.map(k => ({
              id: newId(),
              description: k.description,
              metric: k.metric,
              target: k.target,
              measurementSource: k.measurementSource || "",
            })),
          }));

          // Check if weights sum to 100
          const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
          if (totalWeight !== 100 && categories.length > 0) {
            errors.push(`${group.dept} / ${group.role}: Category weights sum to ${totalWeight}% (must be 100%)`);
            errorCount++;
            continue;
          }

          const template = {
            jobGrade: "",
            roleName: group.role,
            department: group.dept,
            categories,
          };

          saveTemplate(template);
          savedCount++;
        } catch (err: any) {
          errors.push(`${group.dept} / ${group.role}: ${err.message}`);
          errorCount++;
        }
      }

      const message = `✅ Saved ${savedCount} templates.`;
      if (errorCount > 0) {
        alert(`${message}\n\n❌ ${errorCount} errors:\n${errors.join("\n")}`);
      } else {
        alert(message);
      }

      setUploadProgress(`Saved ${savedCount} templates`);

      // Auto-select the first template in the file
      const firstKey = Object.keys(groups)[0];
      if (firstKey) {
        const group = groups[firstKey];
        setSelectedDept(group.dept);
        setSelectedRole(group.role);
        // Reload the template
        setTimeout(() => {
          const existing = getTemplate(group.dept, group.role);
          if (existing) {
            setTemplate(JSON.parse(JSON.stringify(existing)));
          }
        }, 100);
      }
    };

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            processData(result.data);
          } else {
            alert("No data found in CSV.");
          }
        },
        error: (err) => alert(`CSV parse error: ${err.message}`),
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          if (jsonData && jsonData.length > 0) {
            processData(jsonData);
          } else {
            alert("No data found in Excel file.");
          }
        } catch (err: any) {
          alert(`Excel parse error: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file format. Please use CSV or Excel (.xlsx).");
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadBulkTemplate = () => {
    const rows = [
      ["Department", "Role", "Category", "Category Weight (%)", "KPI Description", "Metric", "Target", "Measurement Source"],
      ["Applications Development", "Senior Specialist", "Software Delivery", "35", "On-time delivery", "%", "95", "Task Tracker"],
      ["Applications Development", "Senior Specialist", "Software Delivery", "35", "Code quality", "#", "4.5", "Code Review"],
      ["Applications Development", "Senior Specialist", "Technical Excellence", "30", "Tech debt reduction", "%", "20", "Code Quality Report"],
      ["Enterprise Solutions", "Specialist", "Enterprise Project Delivery", "35", "On-time project delivery", "%", "90", "Project Tracker"],
      ["Enterprise Solutions", "Specialist", "Client & Stakeholder Management", "30", "Client satisfaction", "#", "4.0", "Survey"],
      ["Sales", "Analyst", "Revenue Generation", "40", "Revenue target achievement", "%", "90", "CRM"],
      ["Human Resources", "Senior Specialist", "Talent Management", "35", "Time-to-hire", "days", "30", "ATS"],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_kpi_templates.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">KPI Framework</h1>
        <div className="flex gap-2">
          {template && (
            <Button 
              variant="outline" 
              onClick={handleApplyToEmployees} 
              className="flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Users className="h-4 w-4" /> Apply to Existing Employees
            </Button>
          )}
          <Button onClick={handleSave} disabled={!template}>Save Template</Button>
        </div>
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
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={downloadBulkTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Download Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Bulk Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBulkUpload(file);
            }}
          />
        </div>
      </Card>

      {uploadProgress && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          {uploadProgress}
        </div>
      )}

      {template && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Template: {selectedDept} - {selectedRole}</h2>
            <Button size="sm" variant="outline" onClick={addCategory}>
              <FolderPlus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>

          {template.categories.length === 0 && (
            <div className="text-muted-foreground text-center py-8">No categories yet. Add one or upload a template file.</div>
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
                <div className="grid grid-cols-11 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-3">KPI Description</div>
                  <div className="col-span-2">Metric</div>
                  <div className="col-span-2">Target</div>
                  <div className="col-span-2">Source</div>
                  <div className="col-span-2">Action</div>
                </div>

                {cat.kpis.map((kpi: any) => (
                  <div key={kpi.id} className="grid grid-cols-11 gap-2">
                    <Input
                      value={kpi.description}
                      onChange={(e) => updateKPI(cat.id, kpi.id, { description: e.target.value })}
                      placeholder="KPI description"
                      className="col-span-3"
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
                    <Input
                      value={kpi.measurementSource || ""}
                      onChange={(e) => updateKPI(cat.id, kpi.id, { measurementSource: e.target.value })}
                      placeholder="Source"
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