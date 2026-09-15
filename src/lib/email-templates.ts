// src/lib/email-templates.ts

// ============================================
// SHARED LAYOUT HELPERS
// ============================================

function baseLayout(content: string, preview: string = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>P4P Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
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
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 8px 8px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 11px;">© ${new Date().getFullYear()} P4P · Pay for Performance Platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function contentBlock(inner: string): string {
  return `<tr><td style="padding: 40px 40px 32px;">${inner}</td></tr>`;
}

function ctaButton(label: string, url: string, color: string = "#18181b"): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;"><tr><td style="background: ${color}; border-radius: 10px;"><a href="${url}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">${label} →</a></td></tr></table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;"><table role="presentation" width="100%"><tr><td style="color: #71717a; font-size: 13px;">${label}</td><td style="color: #18181b; font-size: 13px; font-weight: 500; text-align: right;">${value}</td></tr></table></td></tr>`;
}

function infoCard(rows: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fafafa; border: 1px solid #f0f0f3; border-radius: 10px; margin: 0 0 24px;"><tr><td style="padding: 16px 20px;"><table role="presentation" width="100%">${rows}</table></td></tr></table>`;
}

function noticeCard(text: string, color: "blue" | "amber" | "green" = "blue"): string {
  const colors = {
    blue: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
    amber: { bg: "#fffbeb", border: "#fde68a", text: "#78350f" },
    green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  };
  const c = colors[color];
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: ${c.bg}; border: 1px solid ${c.border}; border-radius: 10px;"><tr><td style="padding: 14px 18px;"><p style="margin: 0; color: ${c.text}; font-size: 12px; line-height: 1.6;">${text}</p></td></tr></table>`;
}

function labelForDiffKind(kind: string): string {
  switch (kind) {
    case "category_added": return "New category";
    case "category_removed": return "Category removed";
    case "category_weight_changed": return "Category weight changed";
    case "category_name_changed": return "Category renamed";
    case "kpi_added": return "New KPI";
    case "kpi_removed": return "KPI removed";
    case "kpi_target_changed": return "Target changed";
    case "kpi_metric_changed": return "Metric changed";
    case "kpi_weight_changed": return "KPI weight changed";
    case "kpi_description_changed": return "KPI renamed";
    default: return kind;
  }
}

// ============================================
// APPRAISAL EMAIL DATA SHAPE
// ============================================

interface AppraisalEmailData {
  employeeName: string;
  department: string;
  role: string;
  period: string;
  overallPercent: number;
  performanceBand: string;
  baseUrl: string;
  reason?: string;
}

// ============================================
// 1. NEW APPRAISAL SUBMITTED (to manager/HR)
// ============================================

export function newAppraisalEmail(data: AppraisalEmailData): string {
  const { employeeName, department, role, period, overallPercent, performanceBand, baseUrl } = data;
  const content = contentBlock(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3;">
      New appraisal submitted
    </h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      <strong style="color: #18181b;">${employeeName}</strong> has submitted their appraisal for review.
    </p>
    ${infoCard(
      infoRow("Employee", employeeName) +
      infoRow("Department", department) +
      infoRow("Role", role) +
      infoRow("Period", period) +
      infoRow("Overall Score", `${overallPercent.toFixed(1)}%`) +
      infoRow("Performance Band", performanceBand)
    )}
    ${ctaButton("Review Now", `${baseUrl}/appraisals-review`)}
    ${noticeCard("Appraisals typically require review within <strong>3 business days</strong>.", "blue")}
  `);
  return baseLayout(content, `New appraisal from ${employeeName} for ${period}`);
}

// ============================================
// 2. APPRAISAL APPROVED (to employee)
// ============================================

export function appraisalApprovedEmail(data: AppraisalEmailData): string {
  const { employeeName, period, overallPercent, performanceBand, baseUrl } = data;
  const content = contentBlock(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3;">
      Your appraisal was approved
    </h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      Hi ${employeeName}, great news! Your manager has approved your appraisal for <strong>${period}</strong>.
    </p>
    ${infoCard(
      infoRow("Period", period) +
      infoRow("Overall Score", `${overallPercent.toFixed(1)}%`) +
      infoRow("Performance Band", performanceBand)
    )}
    ${ctaButton("View My Dashboard", `${baseUrl}/dashboard`)}
    ${noticeCard("This data is now <strong>officially recorded</strong> and will be used in bonus calculations.", "green")}
  `);
  return baseLayout(content, `Your appraisal for ${period} was approved`);
}

// ============================================
// 3. APPRAISAL REJECTED (to employee)
// ============================================

export function appraisalRejectedEmail(data: AppraisalEmailData): string {
  const { employeeName, period, baseUrl, reason } = data;
  const content = contentBlock(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3;">
      Your appraisal was rejected
    </h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      Hi ${employeeName}, your appraisal for <strong>${period}</strong> was not approved.
    </p>
    ${reason ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; margin: 0 0 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <p style="margin: 0 0 6px; color: #991b1b; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Reason</p>
            <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">${reason}</p>
          </td>
        </tr>
      </table>
    ` : ""}
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      Please contact your manager to discuss next steps.
    </p>
    ${ctaButton("Go to Dashboard", `${baseUrl}/dashboard`)}
  `);
  return baseLayout(content, `Your appraisal for ${period} was rejected`);
}

// ============================================
// 4. CHANGES REQUESTED (to employee)
// ============================================

export function changesRequestedEmail(data: AppraisalEmailData): string {
  const { employeeName, period, baseUrl, reason } = data;
  const content = contentBlock(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3;">
      Changes requested for your appraisal
    </h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      Hi ${employeeName}, your manager has requested changes to your appraisal for <strong>${period}</strong>.
    </p>
    ${reason ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin: 0 0 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <p style="margin: 0 0 6px; color: #78350f; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Feedback from Manager</p>
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">${reason}</p>
          </td>
        </tr>
      </table>
    ` : ""}
    <p style="margin: 0 0 8px; color: #52525b; font-size: 14px; line-height: 1.6;">
      Please update your KPIs and resubmit for review.
    </p>
    ${ctaButton("Edit & Resubmit", `${baseUrl}/employee`)}
  `);
  return baseLayout(content, `Changes requested for your ${period} appraisal`);
}

// ============================================
// 5. PERFORMANCE TRIGGER ALERT (to HR/admin)
// ============================================

export function performanceTriggerEmail(
  employeeName: string,
  department: string,
  role: string,
  triggers: { message: string }[],
  baseUrl: string
): string {
  const content = contentBlock(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3;">
      Performance alert
    </h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      The following employee has triggered one or more performance alerts and requires attention.
    </p>
    ${infoCard(
      infoRow("Employee", employeeName) +
      infoRow("Department", department) +
      infoRow("Role", role)
    )}
    <p style="margin: 0 0 12px; color: #18181b; font-size: 13px; font-weight: 600;">
      Triggers detected
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px;">
      ${triggers.map((t) => `
        <tr>
          <td style="padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;">
            <p style="margin: 0; color: #7f1d1d; font-size: 13px; line-height: 1.6;">${t.message}</p>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
      `).join("")}
    </table>
    ${ctaButton("View Employee", `${baseUrl}/employees`)}
  `);
  return baseLayout(content, `Performance alert: ${employeeName}`);
}

// ============================================
// 6. KPI UPDATE (to employee)
// ============================================

export function kpiUpdateEmail(data: {
  employeeName: string;
  department: string;
  role: string;
  changeCount: number;
  diffs: { kind: string; categoryName: string; kpiDescription?: string; before?: unknown; after?: unknown }[];
  beforeScore: number;
  afterScore: number;
  baseUrl: string;
}): string {
  const {
    employeeName, department, role, changeCount, diffs,
    beforeScore, afterScore, baseUrl,
  } = data;

  const diffRows = diffs
    .map((d) => {
      const label = labelForDiffKind(d.kind);
      const where = d.kpiDescription
        ? `${d.categoryName} · ${d.kpiDescription}`
        : d.categoryName;
      const before = d.before !== undefined
        ? `<span style="text-decoration: line-through; color: #a1a1aa;">${String(d.before)}</span>`
        : "";
      const after = d.after !== undefined
        ? `<strong style="color: #18181b;">${String(d.after)}</strong>`
        : "";
      const values = before && after
        ? ` ${before} <span style="color: #a1a1aa;">→</span> ${after}`
        : after || before;
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f3;">
            <div style="font-size: 12px; font-weight: 600; color: #18181b;">${label}</div>
            <div style="font-size: 11px; color: #71717a; margin-top: 2px;">${where}</div>
            ${values ? `<div style="font-size: 12px; margin-top: 6px;">${values}</div>` : ""}
          </td>
        </tr>`;
    })
    .join("");

  const content = contentBlock(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3;">
      Your KPIs were updated
    </h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
      Hi ${employeeName}, HR has made <strong>${changeCount}</strong> change${changeCount > 1 ? "s" : ""} to your KPI structure.
    </p>

    ${infoCard(
      infoRow("Department", department) +
      infoRow("Role", role) +
      infoRow("Changes", String(changeCount))
    )}

    <p style="margin: 0 0 12px; color: #18181b; font-size: 13px; font-weight: 600;">
      What changed
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #f0f0f3; border-radius: 10px; overflow: hidden; margin: 0 0 24px;">
      ${diffRows}
    </table>

    ${noticeCard(
      "These changes are <strong>already in effect</strong>. Please review and acknowledge so HR knows you've seen them.",
      "blue"
    )}

    ${ctaButton("Review & Acknowledge", `${baseUrl}/kpi-updates`)}
  `);

  return baseLayout(
    content,
    `HR updated your KPIs — ${changeCount} change${changeCount > 1 ? "s" : ""}`
  );
}