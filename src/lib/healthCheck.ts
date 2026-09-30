import { CVData } from "./types";

export interface HealthIssue {
  severity: "warn" | "info";
  message: string;
}

const WEAK_STARTS = [
  "responsible for",
  "worked on",
  "helped with",
  "tasked with",
  "in charge of",
  "duties included",
];

const ACTION_VERB_SAMPLE = [
  "led",
  "built",
  "designed",
  "launched",
  "improved",
  "reduced",
  "increased",
  "managed",
  "created",
  "developed",
  "implemented",
  "delivered",
  "drove",
  "shipped",
  "owned",
  "grew",
  "cut",
  "streamlined",
  "negotiated",
  "mentored",
];

function firstWord(line: string): string {
  return (line.trim().split(/\s+/)[0] ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

function bulletLines(description: string): string[] {
  return description.split("\n").map((l) => l.trim()).filter(Boolean);
}

// Very rough date-format consistency check: flags when both "Jan 2022" and
// "2022-01" style ranges appear across entries.
function dateFormats(dates: string[]): Set<string> {
  const formats = new Set<string>();
  for (const d of dates) {
    if (!d.trim()) continue;
    if (/^\d{4}-\d{2}/.test(d)) formats.add("iso");
    else if (/^[A-Za-z]{3,}\.?\s+\d{4}/.test(d)) formats.add("month-year");
    else if (/^\d{4}$/.test(d)) formats.add("year-only");
    else if (/present/i.test(d)) continue;
    else formats.add("other");
  }
  return formats;
}

export function checkResumeHealth(cv: CVData): HealthIssue[] {
  const issues: HealthIssue[] = [];

  if (!cv.summary || cv.summary.trim().length < 40) {
    issues.push({ severity: "info", message: "Summary is short or empty — a 2-3 sentence pitch helps recruiters skim faster." });
  }

  let weakBulletCount = 0;
  let emptyBulletCount = 0;
  let hasActionVerb = false;

  for (const e of cv.experience) {
    for (const line of bulletLines(e.description)) {
      if (line.length < 4) {
        emptyBulletCount++;
        continue;
      }
      const word = firstWord(line);
      if (WEAK_STARTS.some((w) => line.toLowerCase().startsWith(w))) weakBulletCount++;
      if (ACTION_VERB_SAMPLE.includes(word)) hasActionVerb = true;
    }
  }

  if (weakBulletCount > 0) {
    issues.push({
      severity: "warn",
      message: `${weakBulletCount} bullet${weakBulletCount > 1 ? "s" : ""} start with a weak phrase like "responsible for" — try leading with an action verb instead (e.g. "Led", "Built", "Reduced").`,
    });
  }
  if (emptyBulletCount > 0) {
    issues.push({ severity: "warn", message: `${emptyBulletCount} bullet${emptyBulletCount > 1 ? "s look" : " looks"} empty or too short to be useful.` });
  }
  if (cv.experience.length > 0 && !hasActionVerb) {
    issues.push({ severity: "info", message: "None of your experience bullets start with a common action verb — worth double-checking your phrasing." });
  }

  const allDates = [
    ...cv.experience.flatMap((e) => [e.start, e.end]),
    ...cv.education.flatMap((e) => [e.start, e.end]),
  ];
  if (dateFormats(allDates).size > 1) {
    issues.push({ severity: "info", message: "Dates use more than one format across entries (e.g. \"Jan 2022\" vs \"2022-01\") — consider making them consistent." });
  }

  const missingDates = [...cv.experience, ...cv.education].filter((e) => !e.start.trim());
  if (missingDates.length > 0) {
    issues.push({ severity: "info", message: `${missingDates.length} experience/education entr${missingDates.length > 1 ? "ies" : "y"} missing a start date.` });
  }

  if (cv.experience.length === 0) {
    issues.push({ severity: "warn", message: "No experience entries yet." });
  }
  if (!cv.personal.email) {
    issues.push({ severity: "warn", message: "No email address — recruiters need a way to reach you." });
  }

  return issues;
}
