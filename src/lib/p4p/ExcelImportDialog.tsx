import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseExcelToTemplate } from "@/lib/p4p/excel";
import type { KPITemplate } from "@/lib/p4p/types";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: string;
  role: string;
  onApply: (template: KPITemplate) => void;
}

export function ExcelImportDialog({
  open,
  onOpenChange,
  department,
  role,
  onApply,
}: ExcelImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<KPITemplate | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const reset = () => {
    setParsed(null);
    setErrors([]);
    setFileName("");
    setParsing(false);
  };

  const handleChoose = () => {
    reset();
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setErrors([]);
    setParsed(null);

    try {
      const result = await parseExcelToTemplate(file);
      if (result.errors.length > 0) {
        setErrors(result.errors);
      } else if (result.template) {
        setParsed(result.template);
      } else {
        setErrors(["Could not parse the file."]);
      }
    } catch (err: any) {
      setErrors([err.message || "Unknown error while reading the file."]);
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApply = () => {
    if (!parsed) return;
    const finalTemplate: KPITemplate = {
      ...parsed,
      department,
      roleName: role,
    };
    onApply(finalTemplate);
    reset();
    onOpenChange(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const totalKpis =
    parsed?.categories.reduce((s, c) => s + c.kpis.length, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-5">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Import KPI template from Excel
          </DialogTitle>
          <DialogDescription className="text-[11px] leading-relaxed">
            Upload your KPI Excel file.
            <br />

            Category weights must sum to 100% across the sheet. KPI weights must sum to 100% inside each category.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          className="hidden"
        />

        <div className="flex-1 overflow-y-auto -mx-5 px-5 py-1 space-y-3">
          {!parsed && !parsing && errors.length === 0 && (
            <button
              onClick={handleChoose}
              className="w-full p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-accent/30 transition-colors flex flex-col items-center gap-3 text-center"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-[13px] font-medium">Click to choose a file</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  .xlsx or .xls · first sheet is used
                </div>
              </div>
            </button>
          )}

          {parsing && (
            <div className="flex items-center justify-center py-12 gap-3 text-[13px] text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Reading {fileName}…
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-red-700 dark:text-red-400 mb-1">
                    Could not import {fileName}
                  </div>
                  <ul className="text-[11px] text-red-800 dark:text-red-300 space-y-0.5">
                    {errors.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {parsed && (
            <>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-[12px] text-emerald-800 dark:text-emerald-300">
                  Parsed <strong>{parsed.categories.length}</strong> categories ·{" "}
                  <strong>{totalKpis}</strong> KPIs · weights valid
                </div>
              </div>

              <div className="space-y-2">
                {parsed.categories.map((cat, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[13px] font-medium">{cat.name}</div>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {cat.weight}% weight · {cat.kpis.length} KPIs
                      </Badge>
                    </div>
                    {cat.kpis.length > 0 && (
                      <div className="space-y-1">
                        {cat.kpis.map((kpi, j) => (
                          <div
                            key={j}
                            className="text-[11px] flex items-center gap-2 text-muted-foreground leading-relaxed"
                          >
                            <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                            <span className="text-foreground truncate">
                              {kpi.description}
                            </span>
                            <span className="shrink-0">
                              · target {kpi.target} {kpi.metric} · weight {kpi.weight}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleChoose}
                className="w-full gap-2"
              >
                <Upload className="h-3.5 w-3.5" />
                Choose a different file
              </Button>
            </>
          )}
        </div>

        <DialogFooter className="flex-row justify-end gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!parsed}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Apply to template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}