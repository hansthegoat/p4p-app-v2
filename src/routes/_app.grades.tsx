import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Award, RefreshCw, Save, Plus, Trash2, TrendingUp, Users,
  Target, Info, ChevronRight, Star, Building2, Crown, GripVertical,
} from "lucide-react";
import { newId } from "@/lib/p4p/defaults";
import type { GradePoint } from "@/lib/p4p/types";

export const Route = createFileRoute("/_app/grades")({
  component: GradesPage,
});

function GradesPage() {
  const { grades, setGrades, resetGrades, employees, calc } = useP4P();
  const [editingGrades, setEditingGrades] = useState<GradePoint[]>(
    grades.map((g) => ({ ...g }))
  );
  const [hasChanges, setHasChanges] = useState(false);

  const updateGrade = (index: number, field: keyof GradePoint, value: any) => {
    setEditingGrades((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasChanges(true);
  };

  const addGrade = () => {
    setEditingGrades((prev) => [
      ...prev,
      { code: "", name: "", points: 0 },
    ]);
    setHasChanges(true);
    showToast.success("Grade Added", "Fill in the details and save.");
  };

  const removeGrade = (index: number) => {
    if (!confirm(`Remove this grade?`)) return;
    setEditingGrades((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
    showToast.success("Grade Removed", "Click Save to apply changes.");
  };

  const handleSave = () => {
    const hasEmpty = editingGrades.some((g) => !g.code.trim() || !g.name.trim());
    if (hasEmpty) {
      showToast.error("Invalid Grade", "Code and Name are required for all grades.");
      return;
    }

    const codes = editingGrades.map((g) => g.code);
    const duplicates = codes.filter((c, i) => codes.indexOf(c) !== i);
    if (duplicates.length > 0) {
      showToast.error("Duplicate Codes", `Code "${duplicates[0]}" is used multiple times.`);
      return;
    }

    setGrades(editingGrades);
    setHasChanges(false);
    showToast.success("Grades Saved", "Grade point values have been updated.");
  };

  const handleReset = () => {
    if (!confirm("Reset to default grades? This will discard unsaved changes.")) return;
    resetGrades();
    setEditingGrades(
      grades.map((g) => ({ ...g }))
    );
    setHasChanges(false);
    showToast.success("Reset Complete", "Grades have been reset to defaults.");
  };

  const handleRefresh = () => {
    setEditingGrades(grades.map((g) => ({ ...g })));
    setHasChanges(false);
    showToast.success("Refreshed", "Changes discarded.");
  };

  const totalGrades = editingGrades.length;
  const highestPoints = Math.max(...editingGrades.map((g) => g.points), 0);
  const lowestPoints = Math.min(...editingGrades.map((g) => g.points), 0);
  const avgPoints =
    totalGrades > 0
      ? editingGrades.reduce((s, g) => s + g.points, 0) / totalGrades
      : 0;

  const employeesByGrade: Record<string, number> = {};
  employees.forEach((e) => {
    if (e.jobGrade) {
      employeesByGrade[e.jobGrade] = (employeesByGrade[e.jobGrade] || 0) + 1;
    }
  });

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* 👈 ADDED data-tour wrapper */}
      <div data-tour="grades-header">
        <PageHeader
          title="Grade Points"
          description="Manage the point values assigned to each job grade. These determine bonus calculation weights."
          icon={<Award className="h-6 w-6" />}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={!hasChanges}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Discard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Reset Default
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20"
              >
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          }
        />
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-amber-500/5 border-amber-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                You have unsaved changes
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Click <strong>Save Changes</strong> to apply, or <strong>Discard</strong> to revert.
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats — 👈 ADDED data-tour */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour="grades-stats">
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Total Grades"
          value={totalGrades}
          accent="primary"
          size="large"
        />
        <StatCard
          icon={<Crown className="h-4 w-4" />}
          label="Highest Points"
          value={highestPoints}
          sub="Top grade"
          accent="purple"
          size="large"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Average Points"
          value={avgPoints.toFixed(1)}
          accent="success"
          size="large"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Employees Graded"
          value={Object.values(employeesByGrade).reduce((a, b) => a + b, 0)}
          accent="info"
          size="large"
        />
      </div>

      {/* Grades table — 👈 ADDED data-tour */}
      <motion.div variants={fadeUp} data-tour="grades-table">
        <SectionCard
          title="Grade Points Table"
          description="Edit codes, names, and point values. Codes must be unique."
          icon={<Award className="h-4 w-4" />}
          action={
            <Button size="sm" variant="outline" onClick={addGrade} className="gap-2">
              <Plus className="h-4 w-4" /> Add Grade
            </Button>
          }
          noPadding
        >
          {editingGrades.length === 0 ? (
            <EmptyState
              icon={<Award className="h-6 w-6" />}
              title="No grades defined"
              description="Add your first grade to start calculating bonus weights."
              action={
                <Button onClick={addGrade} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Grade
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border/50">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-muted/30 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <div className="col-span-2">Code</div>
                <div className="col-span-5">Grade Name</div>
                <div className="col-span-2 text-center">Points</div>
                <div className="col-span-2 text-center">Employees</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {editingGrades.map((grade, idx) => {
                const employeeCount = employeesByGrade[grade.code] || 0;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-accent/30 transition-colors group"
                  >
                    <div className="col-span-12 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden block mb-1">
                        Code
                      </label>
                      <Input
                        value={grade.code}
                        onChange={(e) => updateGrade(idx, "code", e.target.value)}
                        placeholder="e.g., A"
                        className="h-9 font-mono uppercase text-center font-semibold"
                        maxLength={4}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-5">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden block mb-1">
                        Name
                      </label>
                      <Input
                        value={grade.name}
                        onChange={(e) => updateGrade(idx, "name", e.target.value)}
                        placeholder="e.g., Senior Specialist"
                        className="h-9"
                      />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden block mb-1">
                        Points
                      </label>
                      <Input
                        type="number"
                        value={grade.points}
                        onChange={(e) => updateGrade(idx, "points", Number(e.target.value))}
                        placeholder="0"
                        className="h-9 font-mono font-semibold text-center"
                      />
                    </div>

                    <div className="col-span-5 md:col-span-2 flex justify-center">
                      {employeeCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1"
                        >
                          <Users className="h-3 w-3" />
                          {employeeCount}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 hover:bg-red-500/10 transition-opacity"
                        onClick={() => removeGrade(idx)}
                        title="Delete grade"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* Info card — 👈 ADDED data-tour */}
      <motion.div variants={fadeUp} data-tour="grades-info">
        <Card className="p-5 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300">
                How Grade Points Work
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-blue-800 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Each grade has a <strong>code</strong> (unique), a <strong>name</strong>, and a <strong>point value</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Point values <strong>weight employee bonuses</strong> — higher points mean larger share of the pool.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Employees are assigned a grade from their <strong>job grade</strong> field.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Changing points affects bonus calculations <strong>immediately</strong> on save.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Suggested hierarchy */}
      <motion.div variants={fadeUp}>
        <SectionCard
          title="Suggested Grade Hierarchy"
          description="Reference for common grade structures"
          icon={<Target className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Executive", range: "80-100 pts", color: "purple", icon: Crown },
              { label: "Senior", range: "60-79 pts", color: "blue", icon: Award },
              { label: "Mid-Level", range: "40-59 pts", color: "emerald", icon: Star },
              { label: "Entry", range: "20-39 pts", color: "amber", icon: Users },
            ].map((tier, i) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={i}
                  className={`p-4 bg-${tier.color}-500/5 border-${tier.color}-500/20`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg bg-${tier.color}-500/15 text-${tier.color}-600 dark:text-${tier.color}-400 flex items-center justify-center`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className={`text-xs font-bold text-${tier.color}-700 dark:text-${tier.color}-400 uppercase tracking-wider`}>
                      {tier.label}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{tier.range}</div>
                </Card>
              );
            })}
          </div>
        </SectionCard>
      </motion.div>
    </motion.div>
  );
}