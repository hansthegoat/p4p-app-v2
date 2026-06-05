import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useP4P } from "@/lib/p4p/store";
import type { GradePoint } from "@/lib/p4p/types";
import { RotateCcw, Save } from "lucide-react";

export const Route = createFileRoute("/_app/grades")({
  component: GradesPage,
});

function GradesPage() {
  const { grades, setGrades, resetGrades } = useP4P();
  const [draft, setDraft] = useState<GradePoint[]>(grades);

  useEffect(() => setDraft(grades), [grades]);

  const update = (code: string, points: number) =>
    setDraft((d) => d.map((g) => g.code === code ? { ...g, points } : g));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Grade Points</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure points used to weight bonuses by job grade.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetGrades}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
          <Button onClick={() => setGrades(draft)}><Save className="h-4 w-4 mr-1" /> Save</Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3 w-48">Points</th></tr>
          </thead>
          <tbody>
            {draft.map((g) => (
              <tr key={g.code} className="border-t">
                <td className="p-3 font-mono font-medium">{g.code}</td>
                <td className="p-3">{g.name}</td>
                <td className="p-3">
                  <Input type="number" value={g.points} onChange={(e) => update(g.code, Number(e.target.value))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
