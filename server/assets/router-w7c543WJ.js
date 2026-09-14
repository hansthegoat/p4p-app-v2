import * as Sentry from "@sentry/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster } from "sonner";
import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
let initialized = false;
function initSentry() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  const dsn = "https://281bfcbced376da517f6b4a283cc2831@o1422302.ingest.us.sentry.io/4512085380759552";
  Sentry.init({
    dsn,
    environment: "production",
    // "development" | "production"
    enabled: true,
    // only send errors in production
    debug: false,
    tracesSampleRate: 0.1,
    // 10% of transactions for perf
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend(event) {
      const msg = event.exception?.values?.[0]?.value || "";
      if (msg.includes("ResizeObserver loop") || msg.includes("Non-Error promise rejection") || msg.includes("Failed to fetch dynamically imported module")) {
        return null;
      }
      return event;
    }
  });
  initialized = true;
  console.log("✅ Sentry initialized");
}
const appCss = "/p4p-app-v2/assets/styles-DOLe1LDc.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const DEFAULT_GRADES = [
  { code: "B", name: "President", points: 100 },
  { code: "C", name: "Executive President", points: 90 },
  { code: "D", name: "Senior Vice President", points: 80 },
  { code: "E", name: "Vice President", points: 70 },
  { code: "F", name: "Head of Department", points: 60 },
  { code: "G", name: "Line Manager/SBU Head", points: 55 },
  { code: "H", name: "Team Lead", points: 50 },
  { code: "1", name: "Senior Specialist", points: 45 },
  { code: "2", name: "Specialist", points: 40 },
  { code: "3", name: "Senior Analyst", points: 35 },
  { code: "4", name: "Analyst", points: 30 },
  { code: "5", name: "Senior Executive", points: 25 },
  { code: "6", name: "Executive", points: 20 },
  { code: "7", name: "Graduate Trainee", points: 15 },
  { code: "8", name: "NSS/Assistant", points: 10 },
  { code: "9", name: "Intern", points: 5 }
];
const DEFAULT_GLOBALS = {
  totalRevenue: 2e7,
  p4pPercent: 2.5,
  adjunctPercent: 10,
  floor: 0.5,
  cap: 1.5,
  prorationOn: false,
  salesMultiplier: 1.3
};
const id = () => Math.random().toString(36).slice(2, 10);
const newId = id;
const DEMO_EMPLOYEES = [
  {
    id: id(),
    name: "Jane Adjunct",
    jobGrade: "5",
    isAdjunct: true,
    isSalesRole: false,
    joinDate: "2025-01-01",
    monthsWorked: 12,
    kpis: [],
    categories: []
  },
  {
    id: id(),
    name: "John Adjunct",
    jobGrade: "6",
    isAdjunct: true,
    isSalesRole: false,
    joinDate: "2025-01-01",
    monthsWorked: 12,
    kpis: [],
    categories: []
  },
  {
    id: id(),
    name: "Alice Johnson",
    jobGrade: "G",
    isAdjunct: false,
    isSalesRole: true,
    joinDate: "2025-01-15",
    monthsWorked: 12,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Strategic Contribution",
        weight: 30,
        kpis: [
          { id: id(), description: "Revenue Growth", metric: "GHS", target: 5e5, actual: 6e5, weight: 40 },
          { id: id(), description: "CSAT Score", metric: "%", target: 90, actual: 85, weight: 30 },
          { id: id(), description: "Market Share", metric: "%", target: 25, actual: 20, weight: 30 }
        ]
      },
      {
        id: id(),
        name: "Operational Excellence",
        weight: 20,
        kpis: [
          { id: id(), description: "Process Efficiency", metric: "%", target: 95, actual: 88, weight: 100 }
        ]
      }
    ]
  },
  {
    id: id(),
    name: "Bob Smith",
    jobGrade: "4",
    isAdjunct: false,
    isSalesRole: false,
    joinDate: "2025-03-01",
    monthsWorked: 10,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Team Performance",
        weight: 40,
        kpis: [
          { id: id(), description: "Team Lead", metric: "%", target: 100, actual: 90, weight: 60 },
          { id: id(), description: "Projects Completed", metric: "#", target: 12, actual: 10, weight: 40 }
        ]
      }
    ]
  },
  {
    id: id(),
    name: "Carol Davis",
    jobGrade: "1",
    isAdjunct: false,
    isSalesRole: true,
    joinDate: "2025-02-10",
    monthsWorked: 11,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Project Delivery",
        weight: 50,
        kpis: [
          { id: id(), description: "Project completion", metric: "%", target: 100, actual: 95, weight: 100 }
        ]
      },
      {
        id: id(),
        name: "Client Satisfaction",
        weight: 30,
        kpis: [
          { id: id(), description: "Client NPS", metric: "%", target: 80, actual: 75, weight: 100 }
        ]
      }
    ]
  }
];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function performanceMultiplierFromCategories(categories, floor, cap) {
  if (!categories || categories.length === 0) return 1;
  let totalWeightedScore = 0;
  let totalWeight = 0;
  for (const category of categories) {
    if (!category.kpis || category.kpis.length === 0) continue;
    let categorySum = 0;
    let kpiCount = 0;
    for (const kpi of category.kpis) {
      const target = Number(kpi.target);
      const actual = Number(kpi.actual);
      if (!target || target <= 0) continue;
      const kpiScore = actual / target;
      const kpiWeight = kpi.weight || 1;
      categorySum += kpiScore * kpiWeight;
      kpiCount += kpiWeight;
    }
    if (kpiCount === 0) continue;
    const categoryScore = categorySum / kpiCount;
    const categoryWeight = category.weight || 0;
    totalWeightedScore += categoryScore * (categoryWeight / 100);
    totalWeight += categoryWeight / 100;
  }
  if (totalWeight === 0) return 1;
  const multiplier = totalWeightedScore / totalWeight;
  return clamp(multiplier, floor, cap);
}
function performanceMultiplier(kpis, floor, cap) {
  if (!kpis || kpis.length === 0) return 1;
  let sum = 0;
  let count = 0;
  for (const k of kpis) {
    const t = Number(k.target);
    const a = Number(k.actual);
    if (!t || t <= 0) continue;
    sum += a / t;
    count++;
  }
  if (count === 0) return 1;
  const ratio = sum / count;
  return clamp(ratio, floor, cap);
}
function calculate(employees, grades, g) {
  const warnings = [];
  const floor = Math.min(g.floor, g.cap);
  const cap = Math.max(g.floor, g.cap);
  if (g.floor > g.cap) warnings.push("Floor was greater than cap — values swapped.");
  const gradeMap = new Map(grades.map((x) => [x.code, x.points]));
  const totalPool = (Number(g.totalRevenue) || 0) * ((Number(g.p4pPercent) || 0) / 100);
  const adjFrac = clamp((Number(g.adjunctPercent) || 0) / 100, 0, 1);
  const adjunctPool = totalPool * adjFrac;
  const employeePool = totalPool * (1 - adjFrac);
  const adjuncts = employees.filter((e) => e.isAdjunct);
  const nonAdjuncts = employees.filter((e) => !e.isAdjunct);
  const perAdjunctBonus = adjuncts.length > 0 ? adjunctPool / adjuncts.length : 0;
  const perEmployee = {};
  const weights = [];
  for (const e of nonAdjuncts) {
    const gp = gradeMap.get(e.jobGrade) ?? 0;
    if (!gradeMap.has(e.jobGrade)) warnings.push(`${e.name}: unknown job grade "${e.jobGrade}".`);
    let pm;
    let kpiBreakdown = [];
    let categoryBreakdown;
    if (e.categories && e.categories.length > 0) {
      pm = performanceMultiplierFromCategories(e.categories, floor, cap);
      categoryBreakdown = e.categories.map((cat) => ({
        categoryName: cat.name,
        categoryWeight: cat.weight,
        kpis: (cat.kpis || []).map((k) => ({
          description: k.description,
          target: k.target,
          actual: k.actual,
          ratio: k.target > 0 ? k.actual / k.target : 0,
          weight: k.weight
        })),
        categoryScore: cat.kpis && cat.kpis.length > 0 ? cat.kpis.reduce((sum, k) => {
          const ratio = k.target > 0 ? k.actual / k.target : 0;
          const kpiWeight = k.weight || 1;
          return sum + ratio * kpiWeight;
        }, 0) / cat.kpis.reduce((sum, k) => sum + (k.weight || 1), 0) : 1
      }));
    } else if (e.kpis && e.kpis.length > 0) {
      pm = performanceMultiplier(e.kpis, floor, cap);
      kpiBreakdown = (e.kpis || []).map((k) => ({
        description: k.description,
        ratio: k.target > 0 ? k.actual / k.target : 0
      }));
    } else {
      pm = 1;
      if (!e.kpis || e.kpis.length === 0)
        warnings.push(`${e.name}: has no KPIs or Categories — multiplier defaults to 1.`);
    }
    let months = Number(e.monthsWorked);
    if (g.prorationOn && (!months || months <= 0)) {
      warnings.push(`${e.name}: months worked missing — defaulted to 12.`);
      months = 12;
    }
    const proration = g.prorationOn ? clamp(months / 12, 0, 1) : 1;
    const salesMult = e.isSalesRole ? Number(g.salesMultiplier) || 1 : 1;
    const weight = gp * pm * proration * salesMult;
    weights.push({
      id: e.id,
      weight,
      pm,
      proration,
      salesMult,
      gp,
      kpiBreakdown,
      categoryBreakdown
    });
  }
  const sumWeights = weights.reduce((s, w) => s + w.weight, 0);
  if (nonAdjuncts.length > 0 && sumWeights <= 0) warnings.push("Sum of weights is 0 — no bonuses can be distributed to non-adjuncts.");
  const valuePerUnit = sumWeights > 0 ? employeePool / sumWeights : 0;
  for (const w of weights) {
    perEmployee[w.id] = {
      performanceMultiplier: w.pm,
      proration: w.proration,
      salesMult: w.salesMult,
      gradePoints: w.gp,
      weight: w.weight,
      bonus: w.weight * valuePerUnit,
      kpiBreakdown: w.kpiBreakdown,
      categoryBreakdown: w.categoryBreakdown
    };
  }
  for (const a of adjuncts) {
    perEmployee[a.id] = {
      performanceMultiplier: 1,
      proration: 1,
      salesMult: 1,
      gradePoints: gradeMap.get(a.jobGrade) ?? 0,
      weight: 0,
      bonus: perAdjunctBonus,
      kpiBreakdown: [],
      categoryBreakdown: void 0
    };
  }
  const totalBonusPaid = (sumWeights > 0 ? employeePool : 0) + (adjuncts.length > 0 ? adjunctPool : 0);
  const avgBonus = employees.length > 0 ? totalBonusPaid / employees.length : 0;
  return {
    totalPool,
    adjunctPool,
    employeePool,
    perAdjunctBonus,
    sumWeights,
    valuePerUnit,
    nonAdjunctCount: nonAdjuncts.length,
    adjunctCount: adjuncts.length,
    perEmployee,
    avgBonus,
    warnings
  };
}
function fmtGHS(n) {
  const v = Number.isFinite(n) ? n : 0;
  if (Math.abs(v) >= 1e6) {
    const m = v / 1e6;
    return `GH₵ ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)}M`;
  }
  if (Math.abs(v) >= 1e3) {
    const k = v / 1e3;
    return `GH₵ ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(v);
}
const fmtNum = (n, d = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);
const SUPABASE_URL = "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
const uploadProofFile = async (employeeId, kpiId, file) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const fileExt = file.name.split(".").pop();
    const fileName = `${employeeId}/${kpiId}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("proof-files").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("proof-files").getPublicUrl(fileName);
    return {
      id: newId(),
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type
    };
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};
const supabase$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getCurrentUser,
  getSession,
  supabase,
  uploadProofFile
}, Symbol.toStringTag, { value: "Module" }));
const sendEmail = async (params) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: params
    });
    if (error) {
      console.error("Email error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
};
function baseLayout(content, preview = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>P4P Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">${preview}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f7; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="display: inline-block; width: 36px; height: 36px; background: #18181b; border-radius: 10px; text-align: center; line-height: 36px; color: #ffffff; font-size: 16px; font-weight: 700;">P4P</div>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-radius: 16px; border: 1px solid #e8e8ec;">
              <tr><td style="padding: 40px 40px 32px;">${content}</td></tr>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 8px 8px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 11px;">© ${(/* @__PURE__ */ new Date()).getFullYear()} P4P · Pay for Performance Platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function ctaButton(label, url) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;"><tr><td style="background: #18181b; border-radius: 10px;"><a href="${url}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">${label} →</a></td></tr></table>`;
}
function infoRow(label, value) {
  return `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;"><table role="presentation" width="100%"><tr><td style="color: #71717a; font-size: 13px;">${label}</td><td style="color: #18181b; font-size: 13px; font-weight: 500; text-align: right;">${value}</td></tr></table></td></tr>`;
}
function infoCard(rows) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fafafa; border: 1px solid #f0f0f3; border-radius: 10px; margin: 0 0 24px;"><tr><td style="padding: 16px 20px;"><table role="presentation" width="100%">${rows}</table></td></tr></table>`;
}
function noticeCard(message, tone) {
  const colors = { background: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a" };
  return `<div style="background: ${colors.background}; border: 1px solid ${colors.border}; border-radius: 10px; padding: 12px 16px; margin: 0 0 24px;"><p style="margin: 0; color: ${colors.text}; font-size: 13px; line-height: 1.5;">${message}</p></div>`;
}
function newAppraisalEmail(data) {
  const { employeeName, department, role, period, overallPercent, performanceBand, baseUrl } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">New appraisal submitted</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;"><strong>${employeeName}</strong> has submitted their appraisal for review.</p>
    ${infoCard(
    infoRow("Employee", employeeName) + infoRow("Department", department) + infoRow("Role", role) + infoRow("Period", period) + infoRow("Overall Score", `${overallPercent.toFixed(1)}%`) + infoRow("Performance Band", performanceBand)
  )}
    ${ctaButton("Review Now", `${baseUrl}/appraisals-review`)}
  `, `New appraisal from ${employeeName}`);
}
function appraisalApprovedEmail(data) {
  const { employeeName, period, overallPercent, performanceBand, baseUrl } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Your appraisal was approved ✓</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName}, great news! Your appraisal for <strong>${period}</strong> has been approved.</p>
    ${infoCard(
    infoRow("Period", period) + infoRow("Overall Score", `${overallPercent.toFixed(1)}%`) + infoRow("Performance Band", performanceBand)
  )}
    ${ctaButton("View My Dashboard", `${baseUrl}/employee`)}
  `, `Approved: ${period}`);
}
function appraisalRejectedEmail(data) {
  const { employeeName, period, baseUrl, reason } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Your appraisal was rejected</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName}, your appraisal for <strong>${period}</strong> was not approved.</p>
    ${reason ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px;"><p style="margin: 0 0 6px; color: #991b1b; font-size: 11px; font-weight: 700;">REASON</p><p style="margin: 0; color: #7f1d1d; font-size: 14px;">${reason}</p></div>` : ""}
    ${ctaButton("Go to Dashboard", `${baseUrl}/employee`)}
  `, `Rejected: ${period}`);
}
function changesRequestedEmail(data) {
  const { employeeName, period, baseUrl, reason } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Changes requested for your appraisal</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName}, your manager has requested changes for <strong>${period}</strong>.</p>
    ${reason ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px;"><p style="margin: 0 0 6px; color: #78350f; font-size: 11px; font-weight: 700;">FEEDBACK</p><p style="margin: 0; color: #92400e; font-size: 14px;">${reason}</p></div>` : ""}
    ${ctaButton("Edit & Resubmit", `${baseUrl}/employee`)}
  `, `Changes requested: ${period}`);
}
function performanceTriggerEmail(employeeName, department, role, triggers, baseUrl) {
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Performance alert ⚠️</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">An employee has triggered one or more performance alerts.</p>
    ${infoCard(
    infoRow("Employee", employeeName) + infoRow("Department", department) + infoRow("Role", role)
  )}
    <p style="margin: 0 0 12px; color: #18181b; font-size: 13px; font-weight: 600;">Triggers detected</p>
    ${triggers.map((t) => `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin-bottom: 8px;"><p style="margin: 0; color: #7f1d1d; font-size: 13px;">${t.message}</p></div>`).join("")}
    ${ctaButton("View Employee", `${baseUrl}/employees`)}
  `, `Performance alert: ${employeeName}`);
}
function kpiUpdateEmail(data) {
  const {
    employeeName,
    department,
    role,
    changeCount,
    diffs,
    baseUrl
  } = data;
  const diffRows = diffs.map((d) => {
    const label = labelForDiffKind(d.kind);
    const where = d.kpiDescription ? `${d.categoryName} · ${d.kpiDescription}` : d.categoryName;
    const before = d.before !== void 0 ? `<span style="text-decoration: line-through; color: #a1a1aa;">${String(d.before)}</span>` : "";
    const after = d.after !== void 0 ? `<strong style="color: #18181b;">${String(d.after)}</strong>` : "";
    const values = before && after ? ` ${before} <span style="color: #a1a1aa;">→</span> ${after}` : after || before;
    return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f3;">
            <div style="font-size: 12px; font-weight: 600; color: #18181b;">${label}</div>
            <div style="font-size: 11px; color: #71717a; margin-top: 2px;">${where}</div>
            ${values ? `<div style="font-size: 12px; margin-top: 6px;">${values}</div>` : ""}
          </td>
        </tr>`;
  }).join("");
  const content = baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3;">
      Your KPIs were updated
    </h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      Hi ${employeeName}, HR has made <strong>${changeCount}</strong> change${changeCount > 1 ? "s" : ""} to your KPI structure.
    </p>

    ${infoCard(
    infoRow("Department", department) + infoRow("Role", role) + infoRow("Changes", String(changeCount))
  )}

    <p style="margin: 0 0 12px; color: #18181b; font-size: 13px; font-weight: 600;">
      What changed
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #f0f0f3; border-radius: 10px; overflow: hidden; margin: 0 0 24px;">
      ${diffRows}
    </table>

    ${noticeCard(
    "These changes are <strong>already in effect</strong>. Please review and acknowledge so HR knows you've seen them."
  )}

    ${ctaButton("Review & Acknowledge", `${baseUrl}/kpi-updates`)}
  `);
  return baseLayout(
    content,
    `HR updated your KPIs — ${changeCount} change${changeCount > 1 ? "s" : ""}`
  );
}
function labelForDiffKind(kind) {
  switch (kind) {
    case "category_added":
      return "New category";
    case "category_removed":
      return "Category removed";
    case "category_weight_changed":
      return "Category weight changed";
    case "kpi_added":
      return "New KPI";
    case "kpi_removed":
      return "KPI removed";
    case "kpi_target_changed":
      return "Target changed";
    case "kpi_metric_changed":
      return "Metric changed";
    case "kpi_weight_changed":
      return "KPI weight changed";
    default:
      return kind;
  }
}
async function fetchAllEmployees() {
  const { data, error } = await supabase.from("employees").select("*").order("name");
  if (error) {
    console.error("fetchAllEmployees error:", error);
    throw error;
  }
  return (data || []).map(mapEmployeeFromDB);
}
async function upsertEmployeeDB(emp) {
  const row = mapEmployeeToDB(emp);
  const { error } = await supabase.from("employees").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("upsertEmployee error:", error);
    throw error;
  }
}
async function deleteEmployeeDB(id2) {
  const { error } = await supabase.from("employees").delete().eq("id", id2);
  if (error) {
    console.error("deleteEmployee error:", error);
    throw error;
  }
}
async function bulkUpsertEmployees(emps) {
  if (emps.length === 0) return;
  const rows = emps.map(mapEmployeeToDB);
  const { error } = await supabase.from("employees").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("bulkUpsertEmployees error:", error);
    throw error;
  }
}
async function fetchAllTemplates() {
  const { data, error } = await supabase.from("kpi_templates").select("*");
  if (error) {
    console.error("fetchAllTemplates error:", error);
    return {};
  }
  const templates = {};
  for (const row of data || []) {
    const key = `${row.department}-${row.role_name}`;
    templates[key] = {
      department: row.department,
      roleName: row.role_name,
      jobGrade: row.job_grade || "",
      categories: row.categories || []
    };
  }
  return templates;
}
async function upsertTemplate(template) {
  const row = {
    id: `${template.department}-${template.roleName}`.replace(/\s+/g, "_"),
    department: template.department,
    role_name: template.roleName,
    job_grade: template.jobGrade,
    categories: template.categories
  };
  const { error } = await supabase.from("kpi_templates").upsert(row, { onConflict: "department,role_name" });
  if (error) {
    console.error("upsertTemplate error:", error);
    throw error;
  }
}
async function fetchAllMonthly() {
  const { data, error } = await supabase.from("monthly_performance").select("*").order("year").order("month");
  if (error) {
    console.error("fetchAllMonthly error:", error);
    return [];
  }
  return (data || []).map(mapMonthlyFromDB);
}
async function upsertMonthlyPerformance(data) {
  const id2 = `${data.employeeId}_${data.year}_${data.month}`;
  const row = {
    id: id2,
    employee_id: data.employeeId,
    year: data.year,
    month: data.month,
    performance_multiplier: data.performanceMultiplier,
    bonus_eligible: data.bonusEligible,
    categories: data.categories || null,
    kpis: data.kpis || null
  };
  const { error } = await supabase.from("monthly_performance").upsert(row, { onConflict: "employee_id,year,month" });
  if (error) {
    console.error("upsertMonthlyPerformance error:", error);
    throw error;
  }
}
async function deleteMonthlyPerformance(employeeId, year, month) {
  const { error } = await supabase.from("monthly_performance").delete().eq("employee_id", employeeId).eq("year", year).eq("month", month);
  if (error) {
    console.error("deleteMonthlyPerformance error:", error);
    throw error;
  }
}
async function fetchAllAppraisals() {
  const { data, error } = await supabase.from("appraisals").select("*").order("submitted_at", { ascending: false });
  if (error) {
    console.error("fetchAllAppraisals error:", error);
    return [];
  }
  const appraisals = [];
  for (const row of data || []) {
    const comments = await fetchCommentsForAppraisal(row.id);
    appraisals.push(mapAppraisalFromDB(row, comments));
  }
  return appraisals;
}
async function upsertAppraisal(appraisal) {
  const row = mapAppraisalToDB(appraisal);
  const { error } = await supabase.from("appraisals").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("upsertAppraisal error:", error);
    throw error;
  }
}
async function fetchCommentsForAppraisal(appraisalId) {
  const { data, error } = await supabase.from("appraisal_comments").select("*").eq("appraisal_id", appraisalId).order("timestamp");
  if (error) {
    console.error("fetchCommentsForAppraisal error:", error);
    return [];
  }
  return (data || []).map((row) => ({
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    text: row.text,
    timestamp: row.timestamp
  }));
}
async function insertAppraisalComment(appraisalId, comment) {
  const { error } = await supabase.from("appraisal_comments").insert({
    id: comment.id,
    appraisal_id: appraisalId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    text: comment.text,
    timestamp: comment.timestamp
  });
  if (error) {
    console.error("insertAppraisalComment error:", error);
    throw error;
  }
}
async function insertNotification(n) {
  const { error } = await supabase.from("notifications").insert({
    id: n.id,
    user_id: n.userId,
    type: n.type,
    message: n.message,
    link: n.link,
    read: n.read || false,
    created_at: n.createdAt
  });
  if (error) {
    console.error("insertNotification error:", error);
    throw error;
  }
}
async function markNotificationReadDB(id2) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id2);
  if (error) {
    console.error("markNotificationReadDB error:", error);
  }
}
function mapEmployeeFromDB(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    authUserId: row.auth_id || void 0,
    department: row.department || "",
    role: row.role || "",
    jobGrade: row.job_grade || "4",
    isAdjunct: row.is_adjunct ?? false,
    isSalesRole: row.is_sales_role ?? false,
    isManager: row.is_manager ?? false,
    supervisorId: row.supervisor_id || "",
    supervisorName: row.supervisor_name || "",
    joinDate: row.join_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    monthsWorked: row.months_worked ?? 12,
    roleType: row.role_type || "employee",
    categories: row.categories || [],
    kpis: row.kpis || [],
    needsKpiSetup: row.needs_kpi_setup ?? false
  };
}
function mapEmployeeToDB(emp) {
  return {
    id: emp.id,
    // ⭐ FIXED: was hard-coded null — this is what broke cross-device login
    auth_id: emp.authUserId || null,
    name: emp.name,
    email: emp.email,
    department: emp.department,
    role: emp.role,
    job_grade: emp.jobGrade,
    is_adjunct: emp.isAdjunct,
    is_sales_role: emp.isSalesRole,
    is_manager: emp.isManager,
    supervisor_id: emp.supervisorId || null,
    supervisor_name: emp.supervisorName || null,
    join_date: emp.joinDate,
    months_worked: emp.monthsWorked,
    role_type: emp.roleType || "employee",
    categories: emp.categories || [],
    kpis: emp.kpis || [],
    needs_kpi_setup: emp.needsKpiSetup ?? false
  };
}
function mapMonthlyFromDB(row) {
  return {
    year: row.year,
    month: row.month,
    employeeId: row.employee_id,
    kpis: row.kpis || [],
    categories: row.categories || void 0,
    performanceMultiplier: row.performance_multiplier,
    bonusEligible: row.bonus_eligible,
    createdAt: row.created_at
  };
}
function mapAppraisalFromDB(row, comments) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    department: row.department,
    role: row.role,
    period: row.period,
    year: row.year,
    month: row.month,
    status: row.status,
    overallScore: row.overall_score,
    overallPercent: row.overall_percent,
    performanceBand: row.performance_band,
    categories: row.categories || [],
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    revisionReason: row.revision_reason,
    reviewerComment: row.reviewer_comment,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    comments
  };
}
function mapAppraisalToDB(a) {
  return {
    id: a.id,
    employee_id: a.employeeId,
    employee_name: a.employeeName,
    department: a.department,
    role: a.role,
    period: a.period,
    year: a.year ?? null,
    month: a.month ?? null,
    status: a.status,
    overall_score: a.overallScore,
    overall_percent: a.overallPercent,
    performance_band: a.performanceBand,
    categories: a.categories,
    reviewer_id: a.reviewerId || null,
    reviewer_name: a.reviewerName || null,
    reviewer_comment: a.reviewerComment || null,
    revision_reason: a.revisionReason || null,
    submitted_at: a.submittedAt,
    reviewed_at: a.reviewedAt || null
  };
}
async function fetchAllKpiUpdateRequests() {
  const { data, error } = await supabase.from("kpi_update_requests").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("fetchAllKpiUpdateRequests error:", error);
    return [];
  }
  return (data || []).map(mapKpiUpdateFromDB);
}
async function upsertKpiUpdateRequest(req) {
  const row = mapKpiUpdateToDB(req);
  const { error } = await supabase.from("kpi_update_requests").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("upsertKpiUpdateRequest error:", error);
    throw error;
  }
}
function mapKpiUpdateFromDB(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    department: row.department,
    role: row.role,
    templateVersion: row.template_version ?? 1,
    diffs: row.diffs || [],
    proposedCategories: row.proposed_categories || [],
    beforeScore: Number(row.before_score ?? 0),
    afterScore: Number(row.after_score ?? 0),
    status: row.status,
    employeeComment: row.employee_comment || void 0,
    createdAt: row.created_at,
    acknowledgedAt: row.acknowledged_at || void 0,
    commentedAt: row.commented_at || void 0,
    pushedBy: row.pushed_by || void 0,
    pushedByName: row.pushed_by_name || void 0
  };
}
function mapKpiUpdateToDB(req) {
  return {
    id: req.id,
    employee_id: req.employeeId,
    department: req.department,
    role: req.role,
    template_version: req.templateVersion,
    diffs: req.diffs,
    proposed_categories: req.proposedCategories,
    before_score: req.beforeScore,
    after_score: req.afterScore,
    status: req.status,
    employee_comment: req.employeeComment || null,
    created_at: req.createdAt,
    acknowledged_at: req.acknowledgedAt || null,
    commented_at: req.commentedAt || null,
    pushed_by: req.pushedBy || null,
    pushed_by_name: req.pushedByName || null
  };
}
const LS_KEY = "p4p_state_v1";
const MONTHLY_KEY = "p4p_monthly_data";
const TEMPLATES_KEY = "p4p_kpi_templates";
const APPRAISALS_KEY = "p4p_appraisals";
const NOTIFICATIONS_KEY = "p4p_notifications";
const KPI_UPDATES_KEY = "p4p_kpi_update_requests";
const SYNC_FLAG_KEY = "p4p_synced_to_supabase";
function loadMonthlyData() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MONTHLY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return [];
}
function saveMonthlyData(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MONTHLY_KEY, JSON.stringify(data));
  } catch {
  }
}
function loadTemplates() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return {};
}
function saveTemplates(templates) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
  }
}
function loadAppraisals() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPRAISALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return [];
}
function saveAppraisals(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APPRAISALS_KEY, JSON.stringify(data));
  } catch {
  }
}
function loadNotifications() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return [];
}
function saveNotifications(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data));
  } catch {
  }
}
function loadKpiUpdateRequests() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KPI_UPDATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return [];
}
function saveKpiUpdateRequests(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KPI_UPDATES_KEY, JSON.stringify(data));
  } catch {
  }
}
const C = createContext(null);
function loadInitial() {
  if (typeof window === "undefined") {
    return {
      globals: DEFAULT_GLOBALS,
      grades: DEFAULT_GRADES,
      employees: DEMO_EMPLOYEES,
      monthlyData: [],
      kpiTemplates: {},
      appraisals: [],
      notifications: [],
      kpiUpdateRequests: []
    };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        globals: { ...DEFAULT_GLOBALS, ...parsed.globals },
        grades: parsed.grades?.length ? parsed.grades : DEFAULT_GRADES,
        employees: Array.isArray(parsed.employees) ? parsed.employees : DEMO_EMPLOYEES,
        monthlyData: loadMonthlyData(),
        kpiTemplates: loadTemplates(),
        appraisals: loadAppraisals(),
        notifications: loadNotifications(),
        kpiUpdateRequests: loadKpiUpdateRequests()
      };
    }
  } catch {
  }
  return {
    globals: DEFAULT_GLOBALS,
    grades: DEFAULT_GRADES,
    employees: DEMO_EMPLOYEES,
    monthlyData: [],
    kpiTemplates: loadTemplates(),
    appraisals: loadAppraisals(),
    notifications: loadNotifications(),
    kpiUpdateRequests: loadKpiUpdateRequests()
  };
}
function P4PProvider({ children }) {
  const [state, setState] = useState(() => loadInitial());
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const refetchFromCloud = async () => {
      setIsSyncing(true);
      try {
        const [cloudEmployees, cloudTemplates, cloudMonthly, cloudAppraisals, cloudKpiUpdates] = await Promise.all([
          fetchAllEmployees(),
          fetchAllTemplates(),
          fetchAllMonthly(),
          fetchAllAppraisals(),
          fetchAllKpiUpdateRequests()
        ]);
        if (cancelled) return;
        setState((s) => ({
          ...s,
          employees: cloudEmployees.length > 0 ? cloudEmployees : s.employees,
          kpiTemplates: Object.keys(cloudTemplates).length > 0 ? cloudTemplates : s.kpiTemplates,
          monthlyData: cloudMonthly.length > 0 ? cloudMonthly : s.monthlyData,
          appraisals: cloudAppraisals.length > 0 ? cloudAppraisals : s.appraisals,
          kpiUpdateRequests: cloudKpiUpdates
        }));
        setIsCloudSynced(true);
      } catch (err) {
        console.error("Cloud refetch failed:", err);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };
    const initFromCloud = async () => {
      try {
        const { getCurrentUser: getCurrentUser2 } = await Promise.resolve().then(() => supabase$1);
        const user = await getCurrentUser2();
        if (!user) {
          console.log("⏳ Not logged in — using localStorage only");
          setIsCloudSynced(false);
          return;
        }
      } catch {
        return;
      }
      setIsSyncing(true);
      try {
        const [cloudEmployees, cloudTemplates, cloudMonthly, cloudAppraisals, cloudKpiUpdates] = await Promise.all([
          fetchAllEmployees(),
          fetchAllTemplates(),
          fetchAllMonthly(),
          fetchAllAppraisals(),
          fetchAllKpiUpdateRequests()
        ]);
        if (cancelled) return;
        const localStorageHasData = state.employees.length > 0 && state.employees.some((e) => !DEMO_EMPLOYEES.find((d) => d.id === e.id));
        const cloudHasData = cloudEmployees.length > 0;
        const alreadySynced = localStorage.getItem(SYNC_FLAG_KEY) === "true";
        if (!cloudHasData && localStorageHasData && !alreadySynced) {
          console.log("🚀 Migrating localStorage data to Supabase...");
          try {
            await bulkUpsertEmployees(state.employees);
            for (const key in state.kpiTemplates) {
              await upsertTemplate(state.kpiTemplates[key]);
            }
            for (const m of state.monthlyData) {
              await upsertMonthlyPerformance(m);
            }
            for (const a of state.appraisals) {
              await upsertAppraisal(a);
            }
            localStorage.setItem(SYNC_FLAG_KEY, "true");
            console.log("✅ Migration complete");
          } catch (err) {
            console.error("❌ Migration failed:", err);
          }
        }
        setState((s) => ({
          ...s,
          employees: cloudHasData ? cloudEmployees : s.employees,
          kpiTemplates: Object.keys(cloudTemplates).length > 0 ? cloudTemplates : s.kpiTemplates,
          monthlyData: cloudMonthly.length > 0 ? cloudMonthly : s.monthlyData,
          appraisals: cloudAppraisals.length > 0 ? cloudAppraisals : s.appraisals,
          kpiUpdateRequests: cloudKpiUpdates
        }));
        setIsCloudSynced(true);
      } catch (err) {
        console.error("Cloud init failed:", err);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };
    initFromCloud();
    let subscription = null;
    (async () => {
      const { supabase: supabase2 } = await Promise.resolve().then(() => supabase$1);
      const { data } = supabase2.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          console.log("🔐 Signed in — refetching from cloud");
          refetchFromCloud();
        } else if (event === "SIGNED_OUT") {
          setIsCloudSynced(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          refetchFromCloud();
        }
      });
      subscription = data.subscription;
    })();
    return () => {
      cancelled = true;
      if (subscription) subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          globals: state.globals,
          grades: state.grades,
          employees: state.employees
        })
      );
    } catch {
    }
    saveMonthlyData(state.monthlyData);
    saveTemplates(state.kpiTemplates);
    saveAppraisals(state.appraisals);
    saveNotifications(state.notifications);
    saveKpiUpdateRequests(state.kpiUpdateRequests);
  }, [state]);
  const setGlobals = useCallback(
    (g) => setState((s) => ({ ...s, globals: { ...s.globals, ...g } })),
    []
  );
  const setGrades = useCallback(
    (grades) => setState((s) => ({ ...s, grades })),
    []
  );
  const resetGrades = useCallback(
    () => setState((s) => ({ ...s, grades: DEFAULT_GRADES })),
    []
  );
  const upsertEmployee = useCallback((e) => {
    setState((s) => {
      const exists = s.employees.some((x) => x.id === e.id);
      return {
        ...s,
        employees: exists ? s.employees.map((x) => x.id === e.id ? e : x) : [...s.employees, e]
      };
    });
    upsertEmployeeDB(e).catch((err) => console.error("Cloud upsert employee failed:", err));
  }, []);
  const removeEmployee = useCallback((id2) => {
    setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id2) }));
    deleteEmployeeDB(id2).catch((err) => console.error("Cloud remove employee failed:", err));
  }, []);
  const clearEmployees = useCallback(() => {
    setState((s) => ({ ...s, employees: [] }));
  }, []);
  const loadDemo = useCallback(() => {
    setState({
      globals: DEFAULT_GLOBALS,
      grades: DEFAULT_GRADES,
      employees: DEMO_EMPLOYEES,
      monthlyData: [],
      kpiTemplates: {},
      appraisals: [],
      notifications: [],
      kpiUpdateRequests: []
    });
  }, []);
  const setEmployees = useCallback((list) => {
    setState((s) => ({ ...s, employees: list }));
    bulkUpsertEmployees(list).catch(
      (err) => console.error("Cloud bulk upsert failed:", err)
    );
  }, []);
  const hardDeleteEmployee = useCallback((id2) => {
    setState((s) => ({
      ...s,
      employees: s.employees.filter((e) => e.id !== id2),
      monthlyData: s.monthlyData.filter((d) => d.employeeId !== id2),
      appraisals: s.appraisals.filter((a) => a.employeeId !== id2),
      notifications: s.notifications.filter((n) => n.userId !== id2),
      kpiUpdateRequests: s.kpiUpdateRequests.filter((r) => r.employeeId !== id2)
    }));
    deleteEmployeeDB(id2).catch((err) => console.error("Cloud hard delete failed:", err));
  }, []);
  const calc = useMemo(
    () => calculate(state.employees, state.grades, state.globals),
    [state]
  );
  const saveMonthlySnapshot = useCallback(
    (employeeId, year, month) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee || employee.isAdjunct) return;
      const result = calc.perEmployee[employeeId];
      if (!result) return;
      const snapshot = {
        year,
        month,
        employeeId,
        kpis: employee.kpis.map((k) => ({ ...k })),
        categories: employee.categories?.map((c) => ({
          ...c,
          kpis: c.kpis.map((k) => ({ ...k }))
        })),
        performanceMultiplier: result.performanceMultiplier,
        bonusEligible: result.bonus,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setState((s) => {
        const existing = s.monthlyData.findIndex(
          (d) => d.employeeId === employeeId && d.year === year && d.month === month
        );
        const newData = [...s.monthlyData];
        if (existing >= 0) newData[existing] = snapshot;
        else newData.push(snapshot);
        return { ...s, monthlyData: newData };
      });
      upsertMonthlyPerformance(snapshot).catch(
        (err) => console.error("Cloud save monthly failed:", err)
      );
    },
    [state.employees, calc]
  );
  const getMonthlyHistory = useCallback(
    (employeeId) => state.monthlyData.filter((d) => d.employeeId === employeeId).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    }),
    [state.monthlyData]
  );
  const getPerformanceTrend = useCallback(
    (employeeId) => {
      const history = getMonthlyHistory(employeeId);
      if (history.length === 0) return null;
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) return null;
      const months = history.map((d) => ({
        month: d.month,
        year: d.year,
        score: d.performanceMultiplier,
        multiplier: d.performanceMultiplier
      }));
      const scores = months.map((m) => m.score);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const last = scores[scores.length - 1];
      let trendDirection = "stable";
      if (scores.length >= 2) {
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg > firstAvg * 1.05) trendDirection = "improving";
        else if (secondAvg < firstAvg * 0.95) trendDirection = "declining";
      }
      const best = months.reduce((a, b) => a.score > b.score ? a : b);
      const worst = months.reduce((a, b) => a.score < b.score ? a : b);
      return {
        employeeId,
        name: employee.name,
        months,
        currentScore: last,
        averageScore: avg,
        bestMonth: { month: best.month, year: best.year, score: best.score },
        worstMonth: { month: worst.month, year: worst.year, score: worst.score },
        trendDirection
      };
    },
    [state.employees, getMonthlyHistory]
  );
  const getAllTrends = useCallback(() => {
    const trends = [];
    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;
      const trend = getPerformanceTrend(emp.id);
      if (trend) trends.push(trend);
    }
    return trends;
  }, [state.employees, getPerformanceTrend]);
  const deleteMonthlyData = useCallback(
    (employeeId, year, month) => {
      setState((s) => ({
        ...s,
        monthlyData: s.monthlyData.filter(
          (d) => !(d.employeeId === employeeId && d.year === year && d.month === month)
        )
      }));
      deleteMonthlyPerformance(employeeId, year, month).catch(
        (err) => console.error("Cloud delete monthly failed:", err)
      );
    },
    []
  );
  const getMonthData = useCallback(
    (year, month) => state.monthlyData.filter((d) => d.year === year && d.month === month),
    [state.monthlyData]
  );
  const getMonthlyStats = useCallback(() => {
    const trends = getAllTrends();
    const avgMultiplier = trends.length > 0 ? trends.reduce((sum, t) => sum + t.currentScore, 0) / trends.length : 0;
    const risingStars = [];
    const underachievers = [];
    for (const t of trends) {
      if (t.trendDirection === "improving" && t.currentScore > 1) risingStars.push(t.name);
      if (t.trendDirection === "declining" && t.currentScore < 0.7) underachievers.push(t.name);
    }
    let monthOverMonthChange = 0;
    if (trends.length > 0 && trends[0].months.length >= 2) {
      const lastMonth = trends[0].months[trends[0].months.length - 1];
      const prevMonth = trends[0].months[trends[0].months.length - 2];
      monthOverMonthChange = (lastMonth.score - prevMonth.score) / prevMonth.score * 100;
    }
    const monthSet = /* @__PURE__ */ new Set();
    for (const d of state.monthlyData) monthSet.add(`${d.year}-${d.month}`);
    const monthsWithData = Array.from(monthSet).map((s) => {
      const [year, month] = s.split("-").map(Number);
      return { year, month };
    }).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    return {
      totalEmployees: trends.length,
      avgMultiplier,
      risingStars,
      underachievers,
      monthOverMonthChange,
      monthsWithData
    };
  }, [getAllTrends, state.monthlyData]);
  const detectTriggers = useCallback(() => {
    const triggers = [];
    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;
      const history = getMonthlyHistory(emp.id);
      if (history.length < 3) continue;
      const sorted = [...history].sort(
        (a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month
      );
      const scores = sorted.map((d) => d.performanceMultiplier);
      const months = sorted.map((d) => ({
        month: d.month,
        year: d.year,
        score: d.performanceMultiplier
      }));
      let decliningCount = 0;
      let prevScore = scores[0];
      for (let i = 1; i < scores.length; i++) {
        if (scores[i] < prevScore) decliningCount++;
        else decliningCount = 0;
        prevScore = scores[i];
      }
      if (decliningCount >= 3) {
        const lastThree = months.slice(-3);
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "pip",
          severity: "warning",
          message: `⚠️ PIP Required: 3 consecutive months of declining performance (${lastThree.map((m) => fmtNum(m.score, 2)).join(" → ")})`,
          triggeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          monthsData: lastThree
        });
      }
      const lastSix = months.slice(-6);
      if (lastSix.length === 6 && lastSix.every((m) => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "probation",
          severity: "danger",
          message: `📋 Probation Period: 6 consecutive months below 0.7 (avg: ${fmtNum(lastSix.reduce((s, m) => s + m.score, 0) / 6, 2)})`,
          triggeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          monthsData: lastSix
        });
      }
      const lastNine = months.slice(-9);
      if (lastNine.length === 9 && lastNine.every((m) => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "management_action",
          severity: "critical",
          message: `🔴 Management Action Required: 9 consecutive months below 0.7 (avg: ${fmtNum(lastNine.reduce((s, m) => s + m.score, 0) / 9, 2)})`,
          triggeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          monthsData: lastNine
        });
      }
    }
    return {
      pip: triggers.filter((t) => t.type === "pip"),
      probation: triggers.filter((t) => t.type === "probation"),
      managementAction: triggers.filter((t) => t.type === "management_action"),
      total: triggers.length
    };
  }, [state.employees, getMonthlyHistory]);
  const getTriggersForEmployee = useCallback(
    (employeeId) => {
      const all = detectTriggers();
      return [...all.pip, ...all.probation, ...all.managementAction].filter(
        (t) => t.employeeId === employeeId
      );
    },
    [detectTriggers]
  );
  const saveTemplate = useCallback((template) => {
    const key = `${template.department}-${template.roleName}`;
    setState((s) => ({
      ...s,
      kpiTemplates: { ...s.kpiTemplates, [key]: template }
    }));
    upsertTemplate(template).catch(
      (err) => console.error("Cloud save template failed:", err)
    );
  }, []);
  const getTemplate = useCallback(
    (department, role) => {
      return state.kpiTemplates[`${department}-${role}`];
    },
    [state.kpiTemplates]
  );
  const getAllTemplates = useCallback(() => state.kpiTemplates, [state.kpiTemplates]);
  const applyTemplateToEmployees = useCallback(
    (department, role, template) => {
      const toUpdate = state.employees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );
      if (toUpdate.length === 0) return 0;
      const updatedEmployees = state.employees.map((emp) => {
        if (emp.department === department && emp.role === role && !emp.isAdjunct) {
          const newCategories = template.categories.map((cat) => ({
            id: cat.id || newId(),
            name: cat.name,
            weight: cat.weight,
            kpis: cat.kpis.map((k) => ({
              id: k.id || newId(),
              description: k.description,
              metric: k.metric,
              target: k.target,
              actual: 0,
              weight: k.weight || 0,
              measurementSource: k.measurementSource || ""
            }))
          }));
          return { ...emp, categories: newCategories, needsKpiSetup: false };
        }
        return emp;
      });
      setState((s) => ({ ...s, employees: updatedEmployees }));
      const affected = updatedEmployees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );
      bulkUpsertEmployees(affected).catch(
        (err) => console.error("Cloud apply template failed:", err)
      );
      return toUpdate.length;
    },
    [state.employees]
  );
  const sendAppraisalNotification = useCallback(
    async (type, appraisal, reason) => {
      try {
        const employee = state.employees.find((e) => e.id === appraisal.employeeId);
        if (!employee) return;
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const emailData = {
          employeeName: employee.name,
          department: employee.department,
          role: employee.role,
          period: appraisal.period,
          overallPercent: appraisal.overallPercent,
          performanceBand: appraisal.performanceBand,
          baseUrl,
          reason
        };
        let recipients = [];
        let subject = "";
        let html = "";
        if (type === "submitted") {
          const manager = employee.supervisorId ? state.employees.find((e) => e.id === employee.supervisorId) : null;
          if (manager?.email) recipients.push(manager.email);
          state.employees.filter((e) => e.roleType === "admin" || e.roleType === "hr").forEach((e) => {
            if (e.email && !recipients.includes(e.email)) recipients.push(e.email);
          });
          subject = `New appraisal: ${employee.name} (${appraisal.period})`;
          html = newAppraisalEmail(emailData);
        } else {
          recipients.push(employee.email);
          if (type === "approved") {
            subject = `Appraisal approved: ${appraisal.period}`;
            html = appraisalApprovedEmail(emailData);
          } else if (type === "rejected") {
            subject = `Appraisal rejected: ${appraisal.period}`;
            html = appraisalRejectedEmail(emailData);
          } else if (type === "requested_changes") {
            subject = `Changes requested: ${appraisal.period}`;
            html = changesRequestedEmail(emailData);
          }
        }
        if (recipients.length > 0 && html) {
          await sendEmail({ to: recipients, subject, html });
        }
      } catch (err) {
        console.error("Email notification failed:", err);
      }
    },
    [state.employees]
  );
  const getPerformanceBand = (score) => {
    if (score >= 1.2) return "Exceptional";
    if (score >= 1) return "Exceeds Expectations";
    if (score >= 0.8) return "Meets Expectations";
    if (score >= 0.6) return "Needs Improvement";
    return "Performance Improvement Plan";
  };
  const submitAppraisal = useCallback(
    (employeeId, period, year, month) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) return;
      let totalWeightedScore = 0;
      let totalWeight = 0;
      const categories = employee.categories || [];
      for (const cat of categories) {
        let catSum = 0;
        let kpiWeightTotal = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = kpi.actual || 0;
          const ratio = target > 0 ? actual / target : 0;
          const w = kpi.weight || 1;
          catSum += ratio * w;
          kpiWeightTotal += w;
        }
        const catScore = kpiWeightTotal > 0 ? catSum / kpiWeightTotal : 0;
        const weight = cat.weight / 100;
        totalWeightedScore += catScore * weight;
        totalWeight += weight;
      }
      const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const overallPercent = overallScore * 100;
      const band = getPerformanceBand(overallScore);
      const appraisal = {
        id: newId(),
        employeeId,
        employeeName: employee.name,
        department: employee.department,
        role: employee.role,
        period,
        year,
        month,
        submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending",
        categories: categories.map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => ({ ...k }))
        })),
        overallScore,
        overallPercent,
        performanceBand: band,
        comments: []
      };
      const notification = {
        id: newId(),
        userId: "manager",
        type: "appraisal_submitted",
        message: `${employee.name} submitted an appraisal for ${period}`,
        link: `/appraisals-review`,
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setState((s) => ({
        ...s,
        appraisals: [...s.appraisals, appraisal],
        notifications: [...s.notifications, notification]
      }));
      upsertAppraisal(appraisal).catch(
        (err) => console.error("Cloud submit appraisal failed:", err)
      );
      insertNotification(notification).catch(
        (err) => console.error("Cloud insert notification failed:", err)
      );
      sendAppraisalNotification("submitted", appraisal);
    },
    [state.employees, sendAppraisalNotification]
  );
  const saveKPIProof = useCallback(
    (employeeId, kpiId, fileData) => {
      let updatedEmp = null;
      setState((s) => {
        const updatedEmployees = s.employees.map((emp) => {
          if (emp.id !== employeeId) return emp;
          const updatedCategories = (emp.categories || []).map((cat) => ({
            ...cat,
            kpis: cat.kpis.map((k) => {
              if (k.id !== kpiId) return k;
              const proof = k.proof || [];
              return {
                ...k,
                proof: [
                  ...proof,
                  { ...fileData, uploadedAt: (/* @__PURE__ */ new Date()).toISOString() }
                ],
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              };
            })
          }));
          const updated = { ...emp, categories: updatedCategories };
          updatedEmp = updated;
          return updated;
        });
        return { ...s, employees: updatedEmployees };
      });
      if (updatedEmp) {
        upsertEmployeeDB(updatedEmp).catch(
          (err) => console.error("Cloud save proof failed:", err)
        );
      }
    },
    []
  );
  const saveKPIComment = useCallback(
    (employeeId, kpiId, comment) => {
      let updatedEmp = null;
      setState((s) => {
        const updatedEmployees = s.employees.map((emp) => {
          if (emp.id !== employeeId) return emp;
          const updatedCategories = (emp.categories || []).map((cat) => ({
            ...cat,
            kpis: cat.kpis.map((k) => {
              if (k.id !== kpiId) return k;
              return { ...k, comment, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
            })
          }));
          const updated = { ...emp, categories: updatedCategories };
          updatedEmp = updated;
          return updated;
        });
        return { ...s, employees: updatedEmployees };
      });
      if (updatedEmp) {
        upsertEmployeeDB(updatedEmp).catch(
          (err) => console.error("Cloud save comment failed:", err)
        );
      }
    },
    []
  );
  const triggerAfterApproval = useCallback(
    (employeeId) => {
      const allTriggers = detectTriggers();
      const employeeTriggers = [
        ...allTriggers.pip,
        ...allTriggers.probation,
        ...allTriggers.managementAction
      ].filter((t) => t.employeeId === employeeId);
      if (employeeTriggers.length === 0) return;
      const newNotifications = employeeTriggers.map((t) => ({
        id: newId(),
        userId: employeeId,
        type: t.type === "pip" ? "trigger_pip" : t.type === "probation" ? "trigger_probation" : "trigger_management_action",
        message: t.message,
        link: "/employee",
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }));
      setState((s) => ({
        ...s,
        notifications: [...s.notifications, ...newNotifications]
      }));
      for (const n of newNotifications) {
        insertNotification(n).catch(
          (err) => console.error("Cloud notification failed:", err)
        );
      }
      const employee = state.employees.find((e) => e.id === employeeId);
      if (employee) {
        const hrAdmins = state.employees.filter((e) => e.roleType === "admin" || e.roleType === "hr").map((e) => e.email).filter(Boolean);
        if (hrAdmins.length > 0) {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          sendEmail({
            to: hrAdmins,
            subject: `Performance alert: ${employee.name}`,
            html: performanceTriggerEmail(
              employee.name,
              employee.department,
              employee.role,
              employeeTriggers.map((t) => ({ message: t.message })),
              baseUrl
            )
          }).catch((err) => console.error("Trigger email failed:", err));
        }
      }
    },
    [detectTriggers, state.employees]
  );
  const approveAppraisal = useCallback(
    (id2, reviewerId, reviewerName) => {
      let employeeId = "";
      let year = 0;
      let month = 0;
      let categories = [];
      let appraisalToApprove = null;
      setState((s) => {
        const updated = s.appraisals.map((a) => {
          if (a.id === id2) {
            employeeId = a.employeeId;
            year = a.year ?? 0;
            month = a.month ?? 0;
            categories = a.categories;
            const approved = {
              ...a,
              status: "approved",
              reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
              reviewerId,
              reviewerName
            };
            appraisalToApprove = approved;
            return approved;
          }
          return a;
        });
        return { ...s, appraisals: updated };
      });
      if (!employeeId || !year || !month || !categories?.length) return;
      let totalWeightedScore = 0;
      let totalWeight = 0;
      for (const cat of categories) {
        let catSum = 0;
        let kpiWeightTotal = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = kpi.actual || 0;
          const ratio = target > 0 ? actual / target : 0;
          const w2 = kpi.weight || 1;
          catSum += ratio * w2;
          kpiWeightTotal += w2;
        }
        const catScore = kpiWeightTotal > 0 ? catSum / kpiWeightTotal : 0;
        const w = cat.weight / 100;
        totalWeightedScore += catScore * w;
        totalWeight += w;
      }
      const performanceMultiplier2 = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const snapshot = {
        year,
        month,
        employeeId,
        kpis: [],
        categories: categories.map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => ({ ...k }))
        })),
        performanceMultiplier: performanceMultiplier2,
        bonusEligible: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setState((s) => {
        const filtered = s.monthlyData.filter(
          (d) => !(d.employeeId === employeeId && d.year === year && d.month === month)
        );
        const updatedEmployees = s.employees.map(
          (emp) => emp.id === employeeId ? {
            ...emp,
            categories: categories.map((cat) => ({
              ...cat,
              kpis: cat.kpis.map((k) => ({ ...k }))
            }))
          } : emp
        );
        return {
          ...s,
          monthlyData: [...filtered, snapshot],
          employees: updatedEmployees
        };
      });
      upsertMonthlyPerformance(snapshot).catch(
        (err) => console.error("Cloud snapshot failed:", err)
      );
      if (appraisalToApprove) {
        upsertAppraisal(appraisalToApprove).catch(
          (err) => console.error("Cloud approve failed:", err)
        );
        sendAppraisalNotification("approved", appraisalToApprove);
      }
      setTimeout(() => triggerAfterApproval(employeeId), 100);
    },
    [triggerAfterApproval, sendAppraisalNotification]
  );
  const rejectAppraisal = useCallback(
    (id2, reviewerId, reviewerName, reason) => {
      let appraisalToReject = null;
      setState((s) => {
        const updated = s.appraisals.map((a) => {
          if (a.id === id2) {
            const rejected = {
              ...a,
              status: "rejected",
              reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
              reviewerId,
              reviewerName,
              revisionReason: reason
            };
            appraisalToReject = rejected;
            return rejected;
          }
          return a;
        });
        return { ...s, appraisals: updated };
      });
      if (appraisalToReject) {
        upsertAppraisal(appraisalToReject).catch(
          (err) => console.error("Cloud reject failed:", err)
        );
        sendAppraisalNotification("rejected", appraisalToReject, reason);
      }
    },
    [sendAppraisalNotification]
  );
  const requestChanges = useCallback(
    (id2, reviewerId, reviewerName, reason) => {
      let appraisalToChange = null;
      setState((s) => {
        const updated = s.appraisals.map((a) => {
          if (a.id === id2) {
            const changed = {
              ...a,
              status: "needs_revision",
              reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
              reviewerId,
              reviewerName,
              revisionReason: reason
            };
            appraisalToChange = changed;
            return changed;
          }
          return a;
        });
        return { ...s, appraisals: updated };
      });
      if (appraisalToChange) {
        upsertAppraisal(appraisalToChange).catch(
          (err) => console.error("Cloud request changes failed:", err)
        );
        sendAppraisalNotification("requested_changes", appraisalToChange, reason);
      }
    },
    [sendAppraisalNotification]
  );
  const getEmployeeAppraisals = useCallback(
    (employeeId) => state.appraisals.filter((a) => a.employeeId === employeeId).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    ),
    [state.appraisals]
  );
  const getPendingAppraisals = useCallback(
    () => state.appraisals.filter((a) => a.status === "pending").sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    ),
    [state.appraisals]
  );
  const addAppraisalComment = useCallback(
    (appraisalId, authorId, authorName, text) => {
      const comment = {
        id: newId(),
        authorId,
        authorName,
        text,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setState((s) => {
        const updated = s.appraisals.map(
          (a) => a.id === appraisalId ? { ...a, comments: [...a.comments, comment] } : a
        );
        return { ...s, appraisals: updated };
      });
      insertAppraisalComment(appraisalId, comment).catch(
        (err) => console.error("Cloud comment failed:", err)
      );
    },
    []
  );
  const getNotifications = useCallback(
    (userId) => state.notifications.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [state.notifications]
  );
  const markNotificationRead = useCallback((id2) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map(
        (n) => n.id === id2 ? { ...n, read: true } : n
      )
    }));
    markNotificationReadDB(id2).catch(
      (err) => console.error("Cloud mark read failed:", err)
    );
  }, []);
  const computeScore = (categories) => {
    let totalWeighted = 0;
    let totalWeight = 0;
    for (const cat of categories) {
      let catSum = 0;
      let kpiWeightTotal = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const w2 = kpi.weight || 1;
        catSum += ratio * w2;
        kpiWeightTotal += w2;
      }
      const catScore = kpiWeightTotal > 0 ? catSum / kpiWeightTotal : 0;
      const w = (cat.weight || 0) / 100;
      totalWeighted += catScore * w;
      totalWeight += w;
    }
    return totalWeight > 0 ? totalWeighted / totalWeight : 0;
  };
  const computeDiff = (existing, template) => {
    const diffs = [];
    const existingByCatId = new Map(existing.map((c) => [c.id, c]));
    const existingByCatName = new Map(existing.map((c) => [c.name, c]));
    const mergedCategories = [];
    const templateCatNames = new Set(template.categories.map((c) => c.name));
    for (const tCat of template.categories) {
      const existingCat = existingByCatId.get(tCat.id) || existingByCatName.get(tCat.name);
      if (!existingCat) {
        diffs.push({
          kind: "category_added",
          categoryName: tCat.name,
          after: tCat.weight
        });
      } else {
        if (existingCat.weight !== tCat.weight) {
          diffs.push({
            kind: "category_weight_changed",
            categoryName: tCat.name,
            before: existingCat.weight,
            after: tCat.weight
          });
        }
        if (existingByCatId.has(tCat.id) && existingCat.name !== tCat.name) {
          diffs.push({
            kind: "category_name_changed",
            categoryName: tCat.name,
            before: existingCat.name,
            after: tCat.name
          });
        }
      }
      const existingKpisById = new Map(
        (existingCat?.kpis || []).map((k) => [k.id, k])
      );
      const existingKpisByDesc = new Map(
        (existingCat?.kpis || []).map((k) => [k.description, k])
      );
      const mergedKpis = [];
      const templateKpiDescs = new Set(tCat.kpis.map((k) => k.description));
      for (const tKpi of tCat.kpis) {
        const existingKpi = existingKpisById.get(tKpi.id) || existingKpisByDesc.get(tKpi.description);
        if (!existingKpi) {
          diffs.push({
            kind: "kpi_added",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            after: tKpi.target
          });
          mergedKpis.push({
            id: tKpi.id,
            description: tKpi.description,
            metric: tKpi.metric,
            target: tKpi.target,
            actual: 0,
            weight: tKpi.weight ?? 0,
            measurementSource: tKpi.measurementSource || ""
          });
          continue;
        }
        if (existingKpisById.has(tKpi.id) && existingKpi.description !== tKpi.description) {
          diffs.push({
            kind: "kpi_description_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.description,
            after: tKpi.description
          });
        }
        if (existingKpi.target !== tKpi.target) {
          diffs.push({
            kind: "kpi_target_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.target,
            after: tKpi.target
          });
        }
        if (existingKpi.metric !== tKpi.metric) {
          diffs.push({
            kind: "kpi_metric_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.metric,
            after: tKpi.metric
          });
        }
        if ((existingKpi.weight ?? 0) !== (tKpi.weight ?? 0)) {
          diffs.push({
            kind: "kpi_weight_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.weight ?? 0,
            after: tKpi.weight ?? 0
          });
        }
        mergedKpis.push({
          ...existingKpi,
          id: tKpi.id,
          description: tKpi.description,
          metric: tKpi.metric,
          target: tKpi.target,
          weight: tKpi.weight ?? existingKpi.weight ?? 0,
          measurementSource: tKpi.measurementSource || existingKpi.measurementSource,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      for (const oldKpi of existingCat?.kpis || []) {
        if (!templateKpiDescs.has(oldKpi.description)) {
          diffs.push({
            kind: "kpi_removed",
            categoryName: tCat.name,
            kpiDescription: oldKpi.description,
            before: oldKpi.target
          });
        }
      }
      mergedCategories.push({
        id: tCat.id,
        name: tCat.name,
        weight: tCat.weight,
        kpis: mergedKpis
      });
    }
    for (const oldCat of existing) {
      if (!templateCatNames.has(oldCat.name)) {
        diffs.push({
          kind: "category_removed",
          categoryName: oldCat.name,
          before: oldCat.weight
        });
      }
    }
    return { diffs, merged: mergedCategories };
  };
  const previewTemplateDiff = useCallback(
    (department, role, template) => {
      const affected = state.employees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );
      const result = {};
      for (const emp of affected) {
        const { diffs } = computeDiff(emp.categories || [], template);
        if (diffs.length > 0) result[emp.id] = diffs;
      }
      return result;
    },
    [state.employees]
  );
  const pushTemplateToEmployees = useCallback(
    async (department, role, template) => {
      const affected = state.employees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );
      let pushedBy;
      let pushedByName;
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
          pushedBy = user.id;
          const me = state.employees.find(
            (e) => e.authUserId === user.id || e.email === user.email
          );
          pushedByName = me?.name || user.email || "HR";
        }
      } catch {
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const newRequests = [];
      const newNotifications = [];
      const updatedEmployees = [];
      for (const emp of affected) {
        const existing = emp.categories || [];
        const { diffs, merged } = computeDiff(existing, template);
        if (diffs.length === 0) continue;
        const beforeScore = computeScore(existing);
        const afterScore = computeScore(merged);
        updatedEmployees.push({
          ...emp,
          categories: merged,
          needsKpiSetup: false
        });
        const req = {
          id: newId(),
          employeeId: emp.id,
          department,
          role,
          templateVersion: 1,
          diffs,
          proposedCategories: merged,
          beforeScore,
          afterScore,
          status: "unacknowledged",
          createdAt: now,
          pushedBy,
          pushedByName
        };
        newRequests.push(req);
        newNotifications.push({
          id: newId(),
          userId: emp.id,
          type: "appraisal_needs_revision",
          message: `Your KPIs were updated — ${diffs.length} change${diffs.length > 1 ? "s" : ""} to review`,
          link: "/kpi-updates",
          read: false,
          createdAt: now
        });
        if (emp.email) {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          sendEmail({
            to: [emp.email],
            subject: `Your KPIs were updated (${diffs.length} change${diffs.length > 1 ? "s" : ""})`,
            html: kpiUpdateEmail({
              employeeName: emp.name,
              department,
              role,
              changeCount: diffs.length,
              diffs,
              baseUrl
            })
          }).catch(
            (err) => console.error("KPI update email failed for", emp.email, err)
          );
        }
      }
      setState((s) => ({
        ...s,
        employees: s.employees.map((emp) => {
          const found = updatedEmployees.find((u) => u.id === emp.id);
          return found || emp;
        }),
        kpiUpdateRequests: [...s.kpiUpdateRequests, ...newRequests],
        notifications: [...s.notifications, ...newNotifications]
      }));
      try {
        if (updatedEmployees.length > 0) {
          await bulkUpsertEmployees(updatedEmployees);
        }
        for (const req of newRequests) {
          await upsertKpiUpdateRequest(req);
        }
        for (const n of newNotifications) {
          await insertNotification(n);
        }
      } catch (err) {
        console.error("pushTemplateToEmployees persist error:", err);
      }
      return { affected: affected.length, created: newRequests.length };
    },
    [state.employees]
  );
  const getKpiUpdateRequests = useCallback(
    (employeeId) => state.kpiUpdateRequests.filter((r) => r.employeeId === employeeId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [state.kpiUpdateRequests]
  );
  const getUnacknowledgedKpiUpdates = useCallback(
    () => state.kpiUpdateRequests.filter((r) => r.status === "unacknowledged"),
    [state.kpiUpdateRequests]
  );
  const acknowledgeKpiUpdate = useCallback(
    async (id2) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === id2);
      if (!req) return;
      const acknowledgedAt = (/* @__PURE__ */ new Date()).toISOString();
      setState((s) => ({
        ...s,
        kpiUpdateRequests: s.kpiUpdateRequests.map(
          (r) => r.id === id2 ? { ...r, status: "acknowledged", acknowledgedAt } : r
        )
      }));
      upsertKpiUpdateRequest({
        ...req,
        status: "acknowledged",
        acknowledgedAt
      }).catch(
        (err) => console.error("acknowledgeKpiUpdate save failed:", err)
      );
    },
    [state.kpiUpdateRequests, state.employees]
  );
  const commentKpiUpdate = useCallback(
    async (id2, comment) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === id2);
      if (!req) return;
      const commentedAt = (/* @__PURE__ */ new Date()).toISOString();
      setState((s) => ({
        ...s,
        kpiUpdateRequests: s.kpiUpdateRequests.map(
          (r) => r.id === id2 ? { ...r, employeeComment: comment, commentedAt } : r
        )
      }));
      upsertKpiUpdateRequest({
        ...req,
        employeeComment: comment,
        commentedAt
      }).catch((err) => console.error("commentKpiUpdate save failed:", err));
    },
    [state.kpiUpdateRequests]
  );
  const syncToCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      await bulkUpsertEmployees(state.employees);
      for (const key in state.kpiTemplates) {
        await upsertTemplate(state.kpiTemplates[key]);
      }
      for (const m of state.monthlyData) {
        await upsertMonthlyPerformance(m);
      }
      for (const a of state.appraisals) {
        await upsertAppraisal(a);
      }
      for (const r of state.kpiUpdateRequests) {
        await upsertKpiUpdateRequest(r);
      }
      localStorage.setItem(SYNC_FLAG_KEY, "true");
      console.log("✅ Manual sync complete");
    } catch (err) {
      console.error("Manual sync failed:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [state]);
  const value = {
    ...state,
    isCloudSynced,
    isSyncing,
    setGlobals,
    setGrades,
    resetGrades,
    upsertEmployee,
    removeEmployee,
    clearEmployees,
    loadDemo,
    setEmployees,
    calc,
    saveMonthlySnapshot,
    getMonthlyHistory,
    getPerformanceTrend,
    getAllTrends,
    deleteMonthlyData,
    getMonthData,
    getMonthlyStats,
    detectTriggers,
    getTriggersForEmployee,
    saveTemplate,
    getTemplate,
    getAllTemplates,
    applyTemplateToEmployees,
    hardDeleteEmployee,
    submitAppraisal,
    approveAppraisal,
    rejectAppraisal,
    requestChanges,
    getEmployeeAppraisals,
    getPendingAppraisals,
    addAppraisalComment,
    getNotifications,
    markNotificationRead,
    saveKPIProof,
    saveKPIComment,
    triggerAfterApproval,
    previewTemplateDiff,
    pushTemplateToEmployees,
    getKpiUpdateRequests,
    getUnacknowledgedKpiUpdates,
    acknowledgeKpiUpdate,
    commentKpiUpdate,
    syncToCloud
  };
  return /* @__PURE__ */ jsx(C.Provider, { value, children });
}
function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}
const ADMIN_EMAIL = "dts6@aoholdings.net";
const UserContext = createContext({
  user: null,
  employee: null,
  role: null,
  loading: true
});
const UserProvider = ({ children }) => {
  const { employees } = useP4P();
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const emp = employees.find((e) => e.email === u.email);
          setEmployee(emp || null);
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const emp = employees.find((e) => e.email === session.user.email);
        setEmployee(emp || null);
      } else {
        setUser(null);
        setEmployee(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [employees]);
  const role = user?.email === ADMIN_EMAIL ? "admin" : employee?.role || null;
  return /* @__PURE__ */ jsx(UserContext.Provider, { value: { user, employee, role, loading }, children });
};
const useUser = () => useContext(UserContext);
const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null
});
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "p4p-theme"
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    return localStorage.getItem(storageKey) || defaultTheme;
  });
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    let effectiveTheme = "light";
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effectiveTheme = theme;
    }
    root.classList.add(effectiveTheme);
  }, [theme]);
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);
  const setThemeWithTransition = (newTheme) => {
    const root = window.document.documentElement;
    root.classList.add("theme-transition");
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newTheme);
    }
    setTheme(newTheme);
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 400);
  };
  const value = {
    theme,
    setTheme: setThemeWithTransition
  };
  return /* @__PURE__ */ jsx(ThemeProviderContext.Provider, { value, children });
}
function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
const Route$m = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "P4P Bonus Calculator" },
      {
        name: "description",
        content: "Calculate and trace pay-for-performance bonus grades and traces for employees."
      },
      { name: "author", content: "Iddo Adu Gyamfi" },
      { property: "og:title", content: "P4P Bonus Calculator" },
      {
        property: "og:description",
        content: "Calculate and trace pay-for-performance bonus grades and traces for employees."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      { rel: "stylesheet", href: appCss }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('p4p-theme') || 'system';
                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {}
              })();
            `
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs(
      Sentry.ErrorBoundary,
      {
        fallback: ({ error, resetError }) => /* @__PURE__ */ jsxs("div", { style: { padding: 40, fontFamily: "system-ui" }, children: [
          /* @__PURE__ */ jsx("h1", { style: { fontSize: 20, marginBottom: 8 }, children: "Something went wrong" }),
          /* @__PURE__ */ jsx("p", { style: { color: "#71717a", marginBottom: 16 }, children: "The error has been reported. Please refresh the page." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: resetError,
              style: {
                padding: "8px 16px",
                background: "#18181b",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                cursor: "pointer"
              },
              children: "Try again"
            }
          ),
          false
        ] }),
        children: [
          children,
          /* @__PURE__ */ jsx(Scripts, {})
        ]
      }
    ) })
  ] });
}
function ThemedToaster() {
  const { theme } = useTheme();
  const resolvedTheme = theme === "system" ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme;
  return /* @__PURE__ */ jsx(
    Toaster,
    {
      position: "top-right",
      richColors: true,
      closeButton: true,
      theme: resolvedTheme
    }
  );
}
function RootComponent() {
  const { queryClient } = Route$m.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(ThemeProvider, { defaultTheme: "system", storageKey: "p4p-theme", children: /* @__PURE__ */ jsx(P4PProvider, { children: /* @__PURE__ */ jsxs(UserProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(ThemedToaster, {})
  ] }) }) }) });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const $$splitComponentImporter$l = () => import("./verify-otp-L0GrE9in.js");
const Route$l = createFileRoute("/verify-otp")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./reset-password-X_4R6HiW.js");
const Route$k = createFileRoute("/reset-password")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./forgot-password-BCJwmCMP.js");
const Route$j = createFileRoute("/forgot-password")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./_auth-D9ZYU1Uo.js");
const Route$i = createFileRoute("/_auth")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./_app-C6NUrQrs.js");
const Route$h = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./index-BTU5dmpx.js");
const Route$g = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const ok = localStorage.getItem("p4p_logged_in") === "1";
    throw redirect({
      to: ok ? "/dashboard" : "/login"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./_auth.register-DIqNNQ0L.js");
const searchSchema = z.object({
  email: z.string().optional()
});
const Route$f = createFileRoute("/_auth/register")({
  validateSearch: searchSchema,
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./_auth.login-CxGLGC7k.js");
const Route$e = createFileRoute("/_auth/login")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./_app.trace-CKnovhd2.js");
const Route$d = createFileRoute("/_app/trace")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./_app.supervisors-C3ezEgB1.js");
const Route$c = createFileRoute("/_app/supervisors")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./_app.my-calculation-DWkEYUKz.js");
const Route$b = createFileRoute("/_app/my-calculation")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./_app.monthly-CJ3HfIfH.js");
const Route$a = createFileRoute("/_app/monthly")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_app.kpi-updates-6J8RsxF3.js");
const Route$9 = createFileRoute("/_app/kpi-updates")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./_app.kpi-framework-BfdDbC-6.js");
const Route$8 = createFileRoute("/_app/kpi-framework")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./_app.grades-CeZf-uix.js");
const Route$7 = createFileRoute("/_app/grades")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_app.employees-4v3-OVx2.js");
const Route$6 = createFileRoute("/_app/employees")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./_app.employee-DoV0NfA5.js");
const Route$5 = createFileRoute("/_app/employee")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./_app.dashboard-DFpbGKZr.js");
const Route$4 = createFileRoute("/_app/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_app.change-password-BJTffz6z.js");
const Route$3 = createFileRoute("/_app/change-password")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_app.audit-log-CcEknSFl.js");
const Route$2 = createFileRoute("/_app/audit-log")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_app.appraisals-review-CX0LlQM6.js");
const Route$1 = createFileRoute("/_app/appraisals-review")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_app.appraisals-CBtpaTDW.js");
const Route = createFileRoute("/_app/appraisals")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const VerifyOtpRoute = Route$l.update({
  id: "/verify-otp",
  path: "/verify-otp",
  getParentRoute: () => Route$m
});
const ResetPasswordRoute = Route$k.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$m
});
const ForgotPasswordRoute = Route$j.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$m
});
const AuthRoute = Route$i.update({
  id: "/_auth",
  getParentRoute: () => Route$m
});
const AppRoute = Route$h.update({
  id: "/_app",
  getParentRoute: () => Route$m
});
const IndexRoute = Route$g.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$m
});
const AuthRegisterRoute = Route$f.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => AuthRoute
});
const AuthLoginRoute = Route$e.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => AuthRoute
});
const AppTraceRoute = Route$d.update({
  id: "/trace",
  path: "/trace",
  getParentRoute: () => AppRoute
});
const AppSupervisorsRoute = Route$c.update({
  id: "/supervisors",
  path: "/supervisors",
  getParentRoute: () => AppRoute
});
const AppMyCalculationRoute = Route$b.update({
  id: "/my-calculation",
  path: "/my-calculation",
  getParentRoute: () => AppRoute
});
const AppMonthlyRoute = Route$a.update({
  id: "/monthly",
  path: "/monthly",
  getParentRoute: () => AppRoute
});
const AppKpiUpdatesRoute = Route$9.update({
  id: "/kpi-updates",
  path: "/kpi-updates",
  getParentRoute: () => AppRoute
});
const AppKpiFrameworkRoute = Route$8.update({
  id: "/kpi-framework",
  path: "/kpi-framework",
  getParentRoute: () => AppRoute
});
const AppGradesRoute = Route$7.update({
  id: "/grades",
  path: "/grades",
  getParentRoute: () => AppRoute
});
const AppEmployeesRoute = Route$6.update({
  id: "/employees",
  path: "/employees",
  getParentRoute: () => AppRoute
});
const AppEmployeeRoute = Route$5.update({
  id: "/employee",
  path: "/employee",
  getParentRoute: () => AppRoute
});
const AppDashboardRoute = Route$4.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AppRoute
});
const AppChangePasswordRoute = Route$3.update({
  id: "/change-password",
  path: "/change-password",
  getParentRoute: () => AppRoute
});
const AppAuditLogRoute = Route$2.update({
  id: "/audit-log",
  path: "/audit-log",
  getParentRoute: () => AppRoute
});
const AppAppraisalsReviewRoute = Route$1.update({
  id: "/appraisals-review",
  path: "/appraisals-review",
  getParentRoute: () => AppRoute
});
const AppAppraisalsRoute = Route.update({
  id: "/appraisals",
  path: "/appraisals",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppAppraisalsRoute,
  AppAppraisalsReviewRoute,
  AppAuditLogRoute,
  AppChangePasswordRoute,
  AppDashboardRoute,
  AppEmployeeRoute,
  AppEmployeesRoute,
  AppGradesRoute,
  AppKpiFrameworkRoute,
  AppKpiUpdatesRoute,
  AppMonthlyRoute,
  AppMyCalculationRoute,
  AppSupervisorsRoute,
  AppTraceRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const AuthRouteChildren = {
  AuthLoginRoute,
  AuthRegisterRoute
};
const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  AuthRoute: AuthRouteWithChildren,
  ForgotPasswordRoute,
  ResetPasswordRoute,
  VerifyOtpRoute
};
const routeTree = Route$m._addFileChildren(rootRouteChildren)._addFileTypes();
initSentry();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  P4PProvider as P,
  useP4P as a,
  useUser as b,
  fmtNum as c,
  uploadProofFile as d,
  fmtGHS as f,
  getCurrentUser as g,
  newId as n,
  router as r,
  supabase as s,
  useTheme as u
};
