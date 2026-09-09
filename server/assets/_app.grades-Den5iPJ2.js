import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { u as useP4P } from "./store-Dy84gyCY.js";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.js";
import { RotateCcw, Save, Plus, Trash2 } from "lucide-react";
import "./router-ykR6owpd.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
function GradesPage() {
  const {
    grades,
    setGrades,
    resetGrades
  } = useP4P();
  const [editing, setEditing] = useState(() => JSON.parse(JSON.stringify(grades)));
  const updateGrade = (index, field, value) => {
    const updated = [...editing];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setEditing(updated);
  };
  const addGrade = () => {
    const newCode = String.fromCharCode(65 + editing.length);
    setEditing([...editing, {
      code: newCode,
      name: "New Grade",
      points: 0
    }]);
  };
  const removeGrade = (index) => {
    if (editing.length <= 1) {
      alert("Cannot remove the last grade.");
      return;
    }
    const updated = editing.filter((_, i) => i !== index);
    setEditing(updated);
  };
  const handleSave = () => {
    const codes = editing.map((g) => g.code);
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Grade Points" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Define grade codes, names, and point values used for bonus calculations." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: handleReset, children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4 mr-1" }),
          " Reset"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSave, children: [
          /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-1" }),
          " Save Changes"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
          editing.length,
          " grade levels configured"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: addGrade, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Add Grade"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-24", children: "Code" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Grade Name" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-32 text-right", children: "Points" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-16", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: editing.map((grade, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Input, { value: grade.code, onChange: (e) => updateGrade(index, "code", e.target.value.toUpperCase()), placeholder: "e.g., G", className: "w-20 font-mono uppercase", maxLength: 3 }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Input, { value: grade.name, onChange: (e) => updateGrade(index, "name", e.target.value), placeholder: "Grade name" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Input, { type: "number", value: grade.points, onChange: (e) => updateGrade(index, "points", Number(e.target.value)), placeholder: "0", className: "w-24 text-right ml-auto", min: 0 }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeGrade(index), className: "text-red-500 hover:text-red-700 hover:bg-red-50", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
        ] }, index)) })
      ] }),
      editing.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground", children: 'No grade levels defined. Click "Add Grade" to start.' })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4 border-blue-200 bg-blue-50/50", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-blue-800 mb-2", children: "💡 About Grade Points" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-700 space-y-1 list-disc list-inside", children: [
        /* @__PURE__ */ jsx("li", { children: "Grade points are used in the bonus calculation: Weight = Grade Points × Performance Multiplier × Proration × Sales Multiplier" }),
        /* @__PURE__ */ jsx("li", { children: "Higher grade points → higher potential bonus" }),
        /* @__PURE__ */ jsx("li", { children: 'Codes are case-insensitive (e.g., "G" and "g" are the same)' }),
        /* @__PURE__ */ jsx("li", { children: "Points can be any positive number" })
      ] })
    ] })
  ] });
}
export {
  GradesPage as component
};
