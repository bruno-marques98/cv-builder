import mammoth from "mammoth";
import { CVData, emptyCV } from "./types";

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  // Self-hosted (see scripts/copy-pdf-worker.js) rather than loaded from a
  // CDN — avoids depending on a third party's script integrity at runtime.
  // Relative path so it resolves correctly under a subpath deployment too
  // (e.g. a GitHub Pages project page).
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.mjs", window.location.href).toString();

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  return text;
}

async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /(https?:\/\/[^\s,;]+|(?:www\.)[^\s,;]+)/i;

const SECTION_HEADERS: { key: "experience" | "education" | "skills"; patterns: RegExp[] }[] = [
  { key: "experience", patterns: [/^(work )?experience$/i, /^employment( history)?$/i, /^professional experience$/i] },
  { key: "education", patterns: [/^education$/i, /^academic background$/i] },
  { key: "skills", patterns: [/^skills$/i, /^technical skills$/i, /^competenc(ies|e)$/i] },
];

function detectHeader(line: string): "experience" | "education" | "skills" | null {
  const clean = line.trim();
  if (clean.length > 40 || clean.length === 0) return null;
  for (const { key, patterns } of SECTION_HEADERS) {
    if (patterns.some((re) => re.test(clean))) return key;
  }
  return null;
}

// Best-effort heuristic extraction: pulls out contact details from
// recognizable patterns, and splits the body into Experience / Education /
// Skills / Summary blocks by looking for common section header lines.
// This is not a real resume parser — it won't reliably split multiple jobs
// within one Experience block into separate entries — but it gets the big
// chunks into roughly the right place instead of dumping everything into
// Summary.
export function parseCVText(text: string): Partial<CVData> {
  const rawLines = text.split("\n").map((l) => l.trim());
  const lines = rawLines.filter(Boolean);

  const email = text.match(EMAIL_RE)?.[0] ?? "";
  const phone = text.match(PHONE_RE)?.[0]?.trim() ?? "";
  const website = text.match(URL_RE)?.[0] ?? "";

  const nameLine = lines.find(
    (l) => l.length > 0 && l.length < 60 && !l.includes("@") && !URL_RE.test(l) && !/^\+?\d/.test(l)
  );
  const nameIdx = lines.indexOf(nameLine ?? "");
  const roleLine = lines
    .slice(nameIdx + 1, nameIdx + 4)
    .find((l) => l.length > 0 && l.length < 80 && !l.includes("@") && !URL_RE.test(l));

  // Walk the lines, bucketing everything under the most recent recognized
  // section header. Content before the first header is treated as summary.
  const buckets: Record<"summary" | "experience" | "education" | "skills", string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
  };
  let current: keyof typeof buckets = "summary";
  for (const line of lines) {
    const header = detectHeader(line);
    if (header) {
      current = header;
      continue;
    }
    if (line === nameLine || line === roleLine || line.includes(email) || line.includes(phone)) continue;
    buckets[current].push(line);
  }

  const experience = buckets.experience.length
    ? [
        {
          id: Math.random().toString(36).slice(2, 10),
          role: "",
          company: "",
          start: "",
          end: "",
          location: "",
          description: buckets.experience.join("\n"),
        },
      ]
    : [];

  const education = buckets.education.length
    ? [
        {
          id: Math.random().toString(36).slice(2, 10),
          degree: "",
          school: "",
          start: "",
          end: "",
          description: buckets.education.join("\n"),
        },
      ]
    : [];

  const skillNames = buckets.skills.join(", ").split(/[,•|\n]/).map((s) => s.trim()).filter(Boolean);
  const skills = skillNames.map((name) => ({
    id: Math.random().toString(36).slice(2, 10),
    name,
    level: 3,
    category: "",
  }));

  return {
    personal: {
      ...emptyCV.personal,
      fullName: nameLine || emptyCV.personal.fullName,
      role: roleLine || emptyCV.personal.role,
      email,
      phone,
      website,
    },
    summary: buckets.summary.join(" ").slice(0, 2000).trim() || emptyCV.summary,
    experience,
    education,
    skills,
  };
}

export async function parseCVFile(file: File): Promise<Partial<CVData>> {
  const name = file.name.toLowerCase();
  let text = "";
  if (name.endsWith(".pdf")) {
    text = await extractPdfText(file);
  } else if (name.endsWith(".docx")) {
    text = await extractDocxText(file);
  } else if (name.endsWith(".txt")) {
    text = await file.text();
  } else {
    throw new Error("Unsupported file type. Upload a .pdf, .docx, or .txt file.");
  }
  return parseCVText(text);
}
