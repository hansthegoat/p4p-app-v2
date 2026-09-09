import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import type { GradePoint } from "@/lib/p4p/types";

export const Route = createFileRoute("/_app/grades")({
  component: GradesPage,
});

function GradesPage() {
  const { grades, setGrades, resetGrades } = useP4P();
  const [editing, setEditing] = useState<GradePoint[]>(() => 
    JSON.parse(JSON.stringify(grades))
  );

  const updateGrade = (index: number, field: keyof GradePoint, value: string | number) => {
    const updated = [...editing];
    updated[index] = { ...updated[index], [field]: value };
    setEditing(updated);
  };

  const addGrade = () => {
    const newCode = String.fromCharCode(65 + editing.length); // A, B, C...
    setEditing([
      ...editing,
      { code: newCode, name: "New Grade", points: 0 }
    ]);
  };

  const removeGrade = (index: number) => {
    if (editing.length <= 1) {
      alert("Cannot remove the last grade.");
      return;
    }
    const updated = editing.filter((_, i) => i !== index);
    setEditing(updated);
  };

  const handleSave = () => {
    // Validate
    const codes = editing.map(g => g.code);
    const duplicates = codes.filter((c, i) => codes.indexOf(c) !== i);
    if (duplicates.length > 0) {
      alert(`Duplicate grade codes: ${duplicates.join(", ")}`);
      return;
    }
    setGrades(editing);
    alert("✅ Grade points saved successfully!");
  };

  const handleReset = () => {
    if (confirm("Reset to default grade points?")) {
      resetGrades();
      setEditing(JSON.parse(JSON.stringify(grades)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grade Points</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Define grade codes, names, and point values used for bonus calculations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Save Changes
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {editing.length} grade levels configured
          </div>
          <Button size="sm" variant="outline" onClick={addGrade}>
            <Plus className="h-4 w-4 mr-1" /> Add Grade
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Grade Name</TableHead>
              <TableHead className="w-32 text-right">Points</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editing.map((grade, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={grade.code}
                    onChange={(e) => updateGrade(index, "code", e.target.value.toUpperCase())}
                    placeholder="e.g., G"
                    className="w-20 font-mono uppercase"
                    maxLength={3}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={grade.name}
                    onChange={(e) => updateGrade(index, "name", e.target.value)}
                    placeholder="Grade name"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={grade.points}
                    onChange={(e) => updateGrade(index, "points", Number(e.target.value))}
                    placeholder="0"
                    className="w-24 text-right ml-auto"
                    min={0}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGrade(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {editing.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No grade levels defined. Click "Add Grade" to start.
          </div>
        )}
      </Card>

      <Card className="p-4 border-blue-200 bg-blue-50/50">
        <h3 className="font-semibold text-sm text-blue-800 mb-2">💡 About Grade Points</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Grade points are used in the bonus calculation: Weight = Grade Points × Performance Multiplier × Proration × Sales Multiplier</li>
          <li>Higher grade points → higher potential bonus</li>
          <li>Codes are case-insensitive (e.g., "G" and "g" are the same)</li>
          <li>Points can be any positive number</li>
        </ul>
      </Card>
    </div>
  );
}