export interface ParsedKPI {
  description: string;
  metric: string;
  target: number;
  maxScore?: number;
}

export interface ParsedCategory {
  name: string;
  weight: number;
  kpis: ParsedKPI[];
}

// Main entry point
export function parseKPIDocument(text: string): ParsedCategory[] {
  console.log('📄 Parser: Starting, text length:', text.length);

  // Detect format
  if (text.includes('Key Performance Indicator (KPI)') && text.includes('Target / Measure')) {
    console.log('📄 Detected Commercial Ops format');
    return parseCommercialOps(text);
  } else if (text.includes('Objective') && text.includes('Weight:') && text.includes('Max Score')) {
    console.log('📄 Detected NSS / Graduate format');
    return parseGraduateTrainee(text);
  } else {
    console.log('📄 Unknown format, trying both');
    let result = parseGraduateTrainee(text);
    if (result.length === 0) result = parseCommercialOps(text);
    return result;
  }
}

// ===== NSS / GRADUATE TRAINEE FORMAT =====
function parseGraduateTrainee(text: string): ParsedCategory[] {
  const categories: ParsedCategory[] = [];

  // 1. Find all objectives
  const objectiveRegex = /Objective\s+(\d+):\s+([^(]+)\s*\(Weight:\s*(\d+)%\)/g;
  let match;
  const objectives: { index: number; name: string; weight: number }[] = [];
  while ((match = objectiveRegex.exec(text)) !== null) {
    objectives.push({
      index: match.index,
      name: match[2].trim(),
      weight: parseInt(match[3], 10),
    });
  }

  if (objectives.length === 0) {
    console.log('⚠️ No objectives found');
    return [];
  }

  // 2. For each objective, extract the section and parse KPIs
  for (let i = 0; i < objectives.length; i++) {
    const current = objectives[i];
    const next = objectives[i + 1];
    const start = current.index;
    const end = next ? next.index : text.length;
    const section = text.substring(start, end);

    const kpis = extractKPIsFromGraduateSection(section);
    categories.push({
      name: current.name,
      weight: current.weight,
      kpis,
    });
  }

  return categories;
}

function extractKPIsFromGraduateSection(section: string): ParsedKPI[] {
  const kpis: ParsedKPI[] = [];

  // Find the table content (between <table> tags, or just raw text)
  let tableContent = section;
  const tableMatch = section.match(/<table>(.*?)<\/table>/s);
  if (tableMatch) {
    tableContent = tableMatch[1];
  }

  // Remove the header row (KPI, Target, Measurement Source, Max Score)
  const headerPattern = /KPI\s*Target\s*Measurement\s*Source\s*Max\s*Score/i;
  tableContent = tableContent.replace(headerPattern, '');

  // The table content is now a concatenated string: KPI description, target, measurement source, max score.
  // Each row ends with a number (max score) – we'll split by that number to get rows.
  // But we need to ensure we only split at the end of a row.
  // We'll use a regex to find all rows: pattern: (.*?)(?=\d+(?:$|\s+|(?=\s*[A-Za-z])))? but that's tricky.
  // Instead, we'll use known measurement source keywords to split.

  const sourceKeywords = [
    'Attendance / session log',
    'Attendance/session log',
    'Attendance log',
    'Requirements review log',
    'UAT logs',
    'Task tracker',
    'Reporting log',
    'Data migration / configuration package log',
    'Data migration/configuration package log',
    'Configuration review log',
    'Documentation repository',
    'Validation log',
    'Support ticket log'
  ];

  // Try to split by keywords
  let remaining = tableContent;
  while (remaining.length > 0) {
    let found = false;
    for (const kw of sourceKeywords) {
      const idx = remaining.indexOf(kw);
      if (idx !== -1) {
        // Everything before the keyword is the KPI description + target
        const before = remaining.substring(0, idx).trim();
        const after = remaining.substring(idx + kw.length).trim();

        // Extract max score (number at the end of before or start of after?)
        // The number is usually at the start of after, or at the end of before.
        let maxScore = 0;
        let kpiText = before;
        // Check if before ends with a number
        const numMatch = before.match(/(\d+)$/);
        if (numMatch) {
          maxScore = parseInt(numMatch[1], 10);
          kpiText = before.substring(0, before.length - numMatch[1].length).trim();
        } else {
          // Maybe the number is after the keyword?
          const afterNum = after.match(/^(\d+)/);
          if (afterNum) {
            maxScore = parseInt(afterNum[1], 10);
            remaining = after.substring(afterNum[1].length).trim();
          } else {
            // Assume it's 0
            remaining = after;
          }
        }

        // Now split kpiText into description and target
        const { description, target, metric } = splitDescriptionAndTarget(kpiText);
        kpis.push({
          description: description || 'KPI',
          metric,
          target,
          maxScore,
        });

        // Update remaining to continue parsing
        remaining = after;
        found = true;
        break;
      }
    }
    if (!found) {
      // If no keyword found, treat remaining as a single KPI with description only
      if (remaining.trim().length > 0) {
        const { description, target, metric } = splitDescriptionAndTarget(remaining);
        kpis.push({
          description: description || 'KPI',
          metric,
          target,
          maxScore: 0,
        });
      }
      break;
    }
  }

  return kpis;
}

// Helper to split description and target from a concatenated string
function splitDescriptionAndTarget(text: string): { description: string; target: number; metric: string } {
  // Look for target indicators: ≥, ≤, %, $, ROI, etc.
  const targetMatch = text.match(/[≥≤$%ROI]/);
  if (targetMatch) {
    const targetStart = targetMatch.index!;
    const description = text.substring(0, targetStart).trim();
    const targetText = text.substring(targetStart).trim();
    const parsed = parseTarget(targetText);
    return { description, target: parsed.target, metric: parsed.metric };
  } else {
    // No target found – return whole text as description, target 0
    return { description: text.trim(), target: 0, metric: '%' };
  }
}

// ===== COMMERCIAL OPS FORMAT =====
function parseCommercialOps(text: string): ParsedCategory[] {
  const categories: ParsedCategory[] = [];

  // Find the table rows: pattern # Objective ... KPI ... Target ... Weight
  // The table is embedded in <table> tags with columns: #, Objective, KPI, Target/Measure, Weight
  // We'll use regex to extract the rows.

  // First, locate the table start
  const tableStart = text.indexOf('Key Performance Indicator (KPI)');
  if (tableStart === -1) {
    // Fallback: try line-by-line parsing
    return parseCommercialOpsFallback(text);
  }

  // Split by lines and look for rows that start with a number
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let currentCategory: ParsedCategory | null = null;
  let currentKPIs: ParsedKPI[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts a new objective (starts with a number)
    const objectiveMatch = line.match(/^(\d+)\s+(.+?)(?:\s+(\d+)%)?$/);
    if (objectiveMatch) {
      // Save previous category
      if (currentCategory && currentKPIs.length > 0) {
        currentCategory.kpis = currentKPIs;
        categories.push(currentCategory);
      }
      // Start new category
      const weight = objectiveMatch[3] ? parseInt(objectiveMatch[3], 10) : 0;
      const name = objectiveMatch[2].trim();
      currentCategory = {
        name: name,
        weight: weight,
        kpis: [],
      };
      currentKPIs = [];
      // The remaining text after the number and name might contain the KPI description and target
      // We'll process the rest of the line
      const rest = line.replace(/^\d+\s+/, '').replace(/\s+\d+%$/, '').trim();
      if (rest && rest.length > 5) {
        // Try to extract KPI and target from this line
        const targetMatch = rest.match(/[≥≤$%ROI].*/);
        if (targetMatch) {
          const kpiDesc = rest.substring(0, targetMatch.index).trim();
          const targetText = targetMatch[0];
          const parsed = parseTarget(targetText);
          currentKPIs.push({
            description: kpiDesc || rest,
            metric: parsed.metric,
            target: parsed.target,
          });
        } else {
          // Just a description, no target yet
          currentKPIs.push({
            description: rest,
            metric: '%',
            target: 0,
          });
        }
      }
      continue;
    }

    // If we are inside a category, process KPI rows
    if (currentCategory) {
      // Check if this line contains target indicators
      const hasTarget = /[≥≤$%ROI]/.test(line);
      if (hasTarget && line.length > 10) {
        // Extract KPI description (remove target part)
        const desc = line.replace(/[≥≤].*$/, '').replace(/\$\d+.*$/, '').replace(/\d+%.*$/, '').trim();
        const parsed = parseTarget(line);
        // If we already have a KPI without a target, update it
        if (currentKPIs.length > 0 && currentKPIs[currentKPIs.length - 1].target === 0) {
          currentKPIs[currentKPIs.length - 1].target = parsed.target;
          currentKPIs[currentKPIs.length - 1].metric = parsed.metric;
          if (desc && desc.length > 5) {
            currentKPIs[currentKPIs.length - 1].description = desc;
          }
        } else {
          currentKPIs.push({
            description: desc || 'KPI',
            metric: parsed.metric,
            target: parsed.target,
          });
        }
      } else if (line.length > 15 && !line.includes('TOTAL')) {
        // This might be a description line
        // If the last KPI has a short description, append to it
        if (currentKPIs.length > 0 && currentKPIs[currentKPIs.length - 1].description.length < 10) {
          currentKPIs[currentKPIs.length - 1].description += ' ' + line;
        } else {
          // Start a new KPI with just a description
          currentKPIs.push({
            description: line,
            metric: '%',
            target: 0,
          });
        }
      }
    }
  }

  // Save last category
  if (currentCategory && currentKPIs.length > 0) {
    currentCategory.kpis = currentKPIs;
    categories.push(currentCategory);
  }

  return categories;
}

// Fallback parser for Commercial Ops if table detection fails
function parseCommercialOpsFallback(text: string): ParsedCategory[] {
  const categories: ParsedCategory[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let currentCategory: ParsedCategory | null = null;
  let currentKPIs: ParsedKPI[] = [];

  for (const line of lines) {
    const objectiveMatch = line.match(/^(\d+)\s+(.+?)(?:\s+(\d+)%)?$/);
    if (objectiveMatch) {
      if (currentCategory && currentKPIs.length > 0) {
        currentCategory.kpis = currentKPIs;
        categories.push(currentCategory);
      }
      const weight = objectiveMatch[3] ? parseInt(objectiveMatch[3], 10) : 0;
      const name = objectiveMatch[2].trim();
      currentCategory = { name, weight, kpis: [] };
      currentKPIs = [];
      // Check if the same line contains KPI and target
      const rest = line.replace(/^\d+\s+/, '').replace(/\s+\d+%$/, '').trim();
      if (rest) {
        const targetMatch = rest.match(/[≥≤$%ROI].*/);
        if (targetMatch) {
          const desc = rest.substring(0, targetMatch.index).trim();
          const parsed = parseTarget(targetMatch[0]);
          currentKPIs.push({ description: desc || rest, metric: parsed.metric, target: parsed.target });
        } else {
          currentKPIs.push({ description: rest, metric: '%', target: 0 });
        }
      }
    } else if (currentCategory) {
      // Check if line contains target
      const hasTarget = /[≥≤$%ROI]/.test(line);
      if (hasTarget) {
        const desc = line.replace(/[≥≤].*$/, '').replace(/\$\d+.*$/, '').replace(/\d+%.*$/, '').trim();
        const parsed = parseTarget(line);
        if (currentKPIs.length > 0 && currentKPIs[currentKPIs.length - 1].target === 0) {
          currentKPIs[currentKPIs.length - 1].target = parsed.target;
          currentKPIs[currentKPIs.length - 1].metric = parsed.metric;
          if (desc && desc.length > 5) currentKPIs[currentKPIs.length - 1].description = desc;
        } else {
          currentKPIs.push({ description: desc || 'KPI', metric: parsed.metric, target: parsed.target });
        }
      } else if (line.length > 15 && !line.includes('TOTAL')) {
        if (currentKPIs.length > 0 && currentKPIs[currentKPIs.length - 1].description.length < 10) {
          currentKPIs[currentKPIs.length - 1].description += ' ' + line;
        } else {
          currentKPIs.push({ description: line, metric: '%', target: 0 });
        }
      }
    }
  }

  if (currentCategory && currentKPIs.length > 0) {
    currentCategory.kpis = currentKPIs;
    categories.push(currentCategory);
  }
  return categories;
}

// ===== HELPER: Parse Target =====
function parseTarget(targetText: string): { target: number; metric: string } {
  let target = 0;
  let metric = '%';
  const clean = targetText.replace(/\s+/g, ' ');

  // ROI: ≥3:1 ROI, >=3:1 ROI, 3:1 ROI
  const roiMatch = clean.match(/(?:≥|>=|>)?\s*(\d+):1\s*ROI/);
  if (roiMatch) return { target: parseInt(roiMatch[1], 10), metric: 'ROI' };

  // Percentage: ≥ 90%, >= 90%, 90%
  const percentMatch = clean.match(/(?:≥|>=|>)?\s*(\d+)\s*%/);
  if (percentMatch) return { target: parseInt(percentMatch[1], 10), metric: '%' };

  // GHS
  const ghsMatch = clean.match(/(\d+[,\d]*)\s*GHS/);
  if (ghsMatch) return { target: parseInt(ghsMatch[1].replace(/,/g, ''), 10), metric: 'GHS' };

  // $
  const dollarMatch = clean.match(/\$(\d+[,\d]*)/);
  if (dollarMatch) return { target: parseInt(dollarMatch[1].replace(/,/g, ''), 10), metric: '$' };

  // Plain number
  const numberMatch = clean.match(/(\d+)/);
  if (numberMatch) {
    const val = parseInt(numberMatch[1], 10);
    if (clean.includes(':')) metric = 'ratio';
    else if (clean.includes('#')) metric = '#';
    return { target: val, metric };
  }

  return { target: 0, metric: '%' };
}