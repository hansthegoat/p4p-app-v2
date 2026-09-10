// src/lib/email-templates.ts

function baseLayout(content: string, preview: string = ""): string {
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

function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;"><tr><td style="background: #18181b; border-radius: 10px;"><a href="${url}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">${label} →</a></td></tr></table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;"><table role="presentation" width="100%"><tr><td style="color: #71717a; font-size: 13px;">${label}</td><td style="color: #18181b; font-size: 13px; font-weight: 500; text-align: right;">${value}</td></tr></table></td></tr>`;
}

function infoCard(rows: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fafafa; border: 1px solid #f0f0f3; border-radius: 10px; margin: 0 0 24px;"><tr><td style="padding: 16px 20px;"><table role="presentation" width="100%">${rows}</table></td></tr></table>`;
}

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

export function newAppraisalEmail(data: AppraisalEmailData): string {
  const { employeeName, department, role, period, overallPercent, performanceBand, baseUrl } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">New appraisal submitted</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;"><strong>${employeeName}</strong> has submitted their appraisal for review.</p>
    ${infoCard(
      infoRow("Employee", employeeName) +
      infoRow("Department", department) +
      infoRow("Role", role) +
      infoRow("Period", period) +
      infoRow("Overall Score", `${overallPercent.toFixed(1)}%`) +
      infoRow("Performance Band", performanceBand)
    )}
    ${ctaButton("Review Now", `${baseUrl}/appraisals-review`)}
  `, `New appraisal from ${employeeName}`);
}

export function appraisalApprovedEmail(data: AppraisalEmailData): string {
  const { employeeName, period, overallPercent, performanceBand, baseUrl } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Your appraisal was approved ✓</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName}, great news! Your appraisal for <strong>${period}</strong> has been approved.</p>
    ${infoCard(
      infoRow("Period", period) +
      infoRow("Overall Score", `${overallPercent.toFixed(1)}%`) +
      infoRow("Performance Band", performanceBand)
    )}
    ${ctaButton("View My Dashboard", `${baseUrl}/employee`)}
  `, `Approved: ${period}`);
}

export function appraisalRejectedEmail(data: AppraisalEmailData): string {
  const { employeeName, period, baseUrl, reason } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Your appraisal was rejected</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName}, your appraisal for <strong>${period}</strong> was not approved.</p>
    ${reason ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px;"><p style="margin: 0 0 6px; color: #991b1b; font-size: 11px; font-weight: 700;">REASON</p><p style="margin: 0; color: #7f1d1d; font-size: 14px;">${reason}</p></div>` : ""}
    ${ctaButton("Go to Dashboard", `${baseUrl}/employee`)}
  `, `Rejected: ${period}`);
}

export function changesRequestedEmail(data: AppraisalEmailData): string {
  const { employeeName, period, baseUrl, reason } = data;
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Changes requested for your appraisal</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName}, your manager has requested changes for <strong>${period}</strong>.</p>
    ${reason ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px;"><p style="margin: 0 0 6px; color: #78350f; font-size: 11px; font-weight: 700;">FEEDBACK</p><p style="margin: 0; color: #92400e; font-size: 14px;">${reason}</p></div>` : ""}
    ${ctaButton("Edit & Resubmit", `${baseUrl}/employee`)}
  `, `Changes requested: ${period}`);
}

export function performanceTriggerEmail(
  employeeName: string,
  department: string,
  role: string,
  triggers: { message: string }[],
  baseUrl: string
): string {
  return baseLayout(`
    <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; font-weight: 600;">Performance alert ⚠️</h1>
    <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">An employee has triggered one or more performance alerts.</p>
    ${infoCard(
      infoRow("Employee", employeeName) +
      infoRow("Department", department) +
      infoRow("Role", role)
    )}
    <p style="margin: 0 0 12px; color: #18181b; font-size: 13px; font-weight: 600;">Triggers detected</p>
    ${triggers.map((t) => `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin-bottom: 8px;"><p style="margin: 0; color: #7f1d1d; font-size: 13px;">${t.message}</p></div>`).join("")}
    ${ctaButton("View Employee", `${baseUrl}/employees`)}
  `, `Performance alert: ${employeeName}`);
}