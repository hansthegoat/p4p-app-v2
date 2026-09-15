import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { a as useP4P } from "./router-D7LNLANq.js";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import { P as PageHeader } from "./page-header-DgJSKcTG.js";
import { S as StatCard } from "./stat-card-DPr76q1z.js";
import { S as SectionCard } from "./section-card-Dur1lkFz.js";
import { E as EmptyState } from "./empty-state-DzL3lmex.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { s as staggerContainer, f as fadeUp } from "./motion-DlChdgW6.js";
import { RefreshCw, Save, Award, Info, Crown, TrendingUp, Users, Plus, Trash2, ChevronRight, Star, Target } from "lucide-react";
import "@sentry/react";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "zod";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
function GradesPage() {
  const {
    grades,
    setGrades,
    resetGrades,
    employees,
    calc
  } = useP4P();
  const [editingGrades, setEditingGrades] = useState(grades.map((g) => ({
    ...g
  })));
  const [hasChanges, setHasChanges] = useState(false);
  const updateGrade = (index, field, value) => {
    setEditingGrades((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
    setHasChanges(true);
  };
  const addGrade = () => {
    setEditingGrades((prev) => [...prev, {
      code: "",
      name: "",
      points: 0
    }]);
    setHasChanges(true);
    showToast.success("Grade Added", "Fill in the details and save.");
  };
  const removeGrade = (index) => {
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
    setEditingGrades(grades.map((g) => ({
      ...g
    })));
    setHasChanges(false);
    showToast.success("Reset Complete", "Grades have been reset to defaults.");
  };
  const handleRefresh = () => {
    setEditingGrades(grades.map((g) => ({
      ...g
    })));
    setHasChanges(false);
    showToast.success("Refreshed", "Changes discarded.");
  };
  const totalGrades = editingGrades.length;
  const highestPoints = Math.max(...editingGrades.map((g) => g.points), 0);
  Math.min(...editingGrades.map((g) => g.points), 0);
  const avgPoints = totalGrades > 0 ? editingGrades.reduce((s, g) => s + g.points, 0) / totalGrades : 0;
  const employeesByGrade = {};
  employees.forEach((e) => {
    if (e.jobGrade) {
      employeesByGrade[e.jobGrade] = (employeesByGrade[e.jobGrade] || 0) + 1;
    }
  });
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Grade Points", description: "Manage the point values assigned to each job grade. These determine bonus calculation weights.", icon: /* @__PURE__ */ jsx(Award, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleRefresh, disabled: !hasChanges, className: "gap-2", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
        " Discard"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleReset, className: "gap-2", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
        " Reset Default"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleSave, disabled: !hasChanges, className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20", children: [
        /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
        " Save Changes"
      ] })
    ] }) }),
    hasChanges && /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      y: -8
    }, animate: {
      opacity: 1,
      y: 0
    }, children: /* @__PURE__ */ jsxs(Card, { className: "p-4 bg-amber-500/5 border-amber-500/20 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Info, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-amber-800 dark:text-amber-300", children: "You have unsaved changes" }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-700 dark:text-amber-400 mt-0.5", children: [
          "Click ",
          /* @__PURE__ */ jsx("strong", { children: "Save Changes" }),
          " to apply, or ",
          /* @__PURE__ */ jsx("strong", { children: "Discard" }),
          " to revert."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), label: "Total Grades", value: totalGrades, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4" }), label: "Highest Points", value: highestPoints, sub: "Top grade", accent: "purple", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), label: "Average Points", value: avgPoints.toFixed(1), accent: "success", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), label: "Employees Graded", value: Object.values(employeesByGrade).reduce((a, b) => a + b, 0), accent: "info", size: "large" })
    ] }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Grade Points Table", description: "Edit codes, names, and point values. Codes must be unique.", icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), action: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: addGrade, className: "gap-2", children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Add Grade"
    ] }), noPadding: true, children: editingGrades.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Award, { className: "h-6 w-6" }), title: "No grades defined", description: "Add your first grade to start calculating bonus weights.", action: /* @__PURE__ */ jsxs(Button, { onClick: addGrade, className: "gap-2", children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Add Grade"
    ] }) }) : /* @__PURE__ */ jsxs("div", { className: "divide-y divide-border/50", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-3 px-5 py-3 bg-muted/30 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Code" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-5", children: "Grade Name" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center", children: "Points" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center", children: "Employees" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-1 text-right", children: "Action" })
      ] }),
      editingGrades.map((grade, idx) => {
        const employeeCount = employeesByGrade[grade.code] || 0;
        return /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          y: 6
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: Math.min(idx * 0.03, 0.3)
        }, className: "grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-accent/30 transition-colors group", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-12 md:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden block mb-1", children: "Code" }),
            /* @__PURE__ */ jsx(Input, { value: grade.code, onChange: (e) => updateGrade(idx, "code", e.target.value), placeholder: "e.g., A", className: "h-9 font-mono uppercase text-center font-semibold", maxLength: 4 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-12 md:col-span-5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden block mb-1", children: "Name" }),
            /* @__PURE__ */ jsx(Input, { value: grade.name, onChange: (e) => updateGrade(idx, "name", e.target.value), placeholder: "e.g., Senior Specialist", className: "h-9" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-6 md:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden block mb-1", children: "Points" }),
            /* @__PURE__ */ jsx(Input, { type: "number", value: grade.points, onChange: (e) => updateGrade(idx, "points", Number(e.target.value)), placeholder: "0", className: "h-9 font-mono font-semibold text-center" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "col-span-5 md:col-span-2 flex justify-center", children: employeeCount > 0 ? /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
            employeeCount
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-1 flex justify-end", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 hover:bg-red-500/10 transition-opacity", onClick: () => removeGrade(idx), title: "Delete grade", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
        ] }, idx);
      })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { className: "p-5 bg-blue-500/5 border-blue-500/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Info, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-blue-900 dark:text-blue-300", children: "How Grade Points Work" }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1.5 text-xs text-blue-800 dark:text-blue-400", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Each grade has a ",
            /* @__PURE__ */ jsx("strong", { children: "code" }),
            " (unique), a ",
            /* @__PURE__ */ jsx("strong", { children: "name" }),
            ", and a ",
            /* @__PURE__ */ jsx("strong", { children: "point value" }),
            "."
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Point values ",
            /* @__PURE__ */ jsx("strong", { children: "weight employee bonuses" }),
            " — higher points mean larger share of the pool."
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Employees are assigned a grade from their ",
            /* @__PURE__ */ jsx("strong", { children: "job grade" }),
            " field."
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Changing points affects bonus calculations ",
            /* @__PURE__ */ jsx("strong", { children: "immediately" }),
            " on save."
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Suggested Grade Hierarchy", description: "Reference for common grade structures", icon: /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [{
      label: "Executive",
      range: "80-100 pts",
      color: "purple",
      icon: Crown
    }, {
      label: "Senior",
      range: "60-79 pts",
      color: "blue",
      icon: Award
    }, {
      label: "Mid-Level",
      range: "40-59 pts",
      color: "emerald",
      icon: Star
    }, {
      label: "Entry",
      range: "20-39 pts",
      color: "amber",
      icon: Users
    }].map((tier, i) => {
      const Icon = tier.icon;
      return /* @__PURE__ */ jsxs(Card, { className: `p-4 bg-${tier.color}-500/5 border-${tier.color}-500/20`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-lg bg-${tier.color}-500/15 text-${tier.color}-600 dark:text-${tier.color}-400 flex items-center justify-center`, children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: `text-xs font-bold text-${tier.color}-700 dark:text-${tier.color}-400 uppercase tracking-wider`, children: tier.label })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: tier.range })
      ] }, i);
    }) }) }) })
  ] });
}
export {
  GradesPage as component
};
