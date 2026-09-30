import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { CVData, CoverLetterData } from "./types";
import { parseInline } from "./richText";

function inlineRuns(text: string): TextRun[] {
  return parseInline(text).map((seg) => new TextRun({ text: seg.text, bold: seg.bold, italics: seg.italic }));
}

// Splits a description into docx paragraphs: multi-line text becomes a
// bulleted list, single-line text becomes a plain paragraph. Honors
// **bold** / *italic* inline markup.
function descriptionParagraphs(text: string): Paragraph[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return [new Paragraph({ children: inlineRuns(lines[0] ?? ""), spacing: { after: 150 } })];
  }
  return lines.map(
    (line, i) =>
      new Paragraph({
        children: inlineRuns(line),
        bullet: { level: 0 },
        spacing: i === lines.length - 1 ? { after: 150 } : undefined,
      })
  );
}

export async function exportToPDF(node: HTMLElement, filename: string, pageSize: "a4" | "letter" = "a4") {
  const pdf = await renderNodeToPDF(node, pageSize);
  pdf.save(`${filename}.pdf`);
}

export async function exportToPDFBlob(node: HTMLElement, pageSize: "a4" | "letter" = "a4"): Promise<Blob> {
  const pdf = await renderNodeToPDF(node, pageSize);
  return pdf.output("blob");
}

// Exports the rendered CV node as a PNG or JPG image (first page only —
// useful for a LinkedIn post or portfolio thumbnail, not a full document).
export async function exportToImage(node: HTMLElement, filename: string, format: "png" | "jpg" = "png") {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const dataUrl = canvas.toDataURL(mime, 0.95);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}.${format}`;
  a.click();
}

async function renderNodeToPDF(node: HTMLElement, pageSize: "a4" | "letter", pdf?: jsPDF) {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    height: node.scrollHeight,
    windowHeight: node.scrollHeight,
  });
  const imgData = canvas.toDataURL("image/png");

  const doc = pdf ?? new jsPDF({ unit: "pt", format: pageSize });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  let firstPageOfThisNode = true;

  while (heightLeft > 0) {
    if (!firstPageOfThisNode) doc.addPage();
    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    position -= pageHeight;
    firstPageOfThisNode = false;
  }

  return doc;
}

// Combines the CV and cover letter into a single PDF: cover letter first,
// CV starting on a fresh page.
export async function exportCombinedPDF(
  coverLetterNode: HTMLElement,
  cvNode: HTMLElement,
  filename: string,
  pageSize: "a4" | "letter" = "a4"
) {
  let pdf = await renderNodeToPDF(coverLetterNode, pageSize);
  pdf.addPage();
  pdf = await renderNodeToPDF(cvNode, pageSize, pdf);
  pdf.save(`${filename}.pdf`);
}

export async function exportToDocx(cv: CVData, filename: string) {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: cv.personal.fullName,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [new TextRun({ text: cv.personal.role, italics: true })],
    }),
    new Paragraph({
      children: [
        new TextRun(
          [cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
            .filter(Boolean)
            .join("  |  ")
        ),
      ],
      spacing: { after: 300 },
    })
  );

  const sectionOrder = cv.sections.filter((s) => s.visible);

  for (const section of sectionOrder) {
    if (section.type === "summary" && cv.summary) {
      children.push(
        new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
        new Paragraph({ text: cv.summary })
      );
    }
    if (section.type === "experience" && cv.experience.length > 0) {
      children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      for (const e of cv.experience) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${e.role} — ${e.company}`, bold: true }),
              new TextRun({ text: `   ${e.start} - ${e.end}`, italics: true }),
            ],
          }),
          ...descriptionParagraphs(e.description)
        );
      }
    }
    if (section.type === "education" && cv.education.length > 0) {
      children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      for (const e of cv.education) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${e.degree} — ${e.school}`, bold: true }),
              new TextRun({ text: `   ${e.start} - ${e.end}`, italics: true }),
            ],
          }),
          ...descriptionParagraphs(e.description)
        );
      }
    }
    if (section.type === "skills" && cv.skills.length > 0) {
      children.push(
        new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
        new Paragraph({ text: cv.skills.map((s) => s.name).join(", ") })
      );
    }
    if (section.type === "languages" && cv.languages.length > 0) {
      children.push(
        new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
        new Paragraph({ text: cv.languages.map((l) => `${l.name} (${l.level})`).join(", ") })
      );
    }
    if (section.type === "projects" && cv.projects.length > 0) {
      children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      for (const p of cv.projects) {
        children.push(
          new Paragraph({ children: [new TextRun({ text: p.name, bold: true })] }),
          ...descriptionParagraphs(p.description)
        );
      }
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportCoverLetterToDocx(letter: CoverLetterData, filename: string) {
  const paragraphs: Paragraph[] = [
    new Paragraph({ text: letter.senderName, heading: HeadingLevel.HEADING_2 }),
    new Paragraph({
      text: [letter.senderEmail, letter.senderPhone].filter(Boolean).join("  |  "),
      spacing: { after: 300 },
    }),
  ];
  if (letter.date) paragraphs.push(new Paragraph({ text: letter.date, spacing: { after: 200 } }));
  paragraphs.push(
    new Paragraph({ text: letter.recipientName }),
    new Paragraph({ text: letter.recipientCompany, spacing: { after: 250 } })
  );
  if (letter.subject)
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: letter.subject, bold: true })],
        spacing: { after: 250 },
      })
    );
  for (const para of letter.body.split("\n\n")) {
    if (para.trim())
      paragraphs.push(new Paragraph({ text: para.trim(), spacing: { after: 200 } }));
  }
  paragraphs.push(new Paragraph({ text: letter.closing, spacing: { before: 200 } }));

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

// Plain-text rendering of the CV, suitable for pasting into online
// application forms that don't accept file uploads.
export function cvToPlainText(cv: CVData): string {
  const lines: string[] = [];
  lines.push(cv.personal.fullName);
  lines.push(cv.personal.role);
  lines.push(
    [cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website].filter(Boolean).join(" | ")
  );
  lines.push("");

  const stripMarkup = (t: string) => t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");

  for (const section of cv.sections.filter((s) => s.visible)) {
    lines.push(section.title.toUpperCase());
    lines.push("-".repeat(section.title.length));
    if (section.type === "summary" && cv.summary) {
      lines.push(stripMarkup(cv.summary));
    } else if (section.type === "experience") {
      for (const e of cv.experience) {
        lines.push(`${e.role} — ${e.company} (${e.start} - ${e.end})`);
        if (e.location) lines.push(e.location);
        if (e.description) lines.push(stripMarkup(e.description));
        lines.push("");
      }
    } else if (section.type === "education") {
      for (const e of cv.education) {
        lines.push(`${e.degree} — ${e.school} (${e.start} - ${e.end})`);
        if (e.description) lines.push(stripMarkup(e.description));
        lines.push("");
      }
    } else if (section.type === "skills") {
      lines.push(cv.skills.map((s) => s.name).join(", "));
    } else if (section.type === "languages") {
      lines.push(cv.languages.map((l) => `${l.name} (${l.level})`).join(", "));
    } else if (section.type === "projects") {
      for (const p of cv.projects) {
        lines.push(p.name);
        if (p.description) lines.push(stripMarkup(p.description));
        lines.push("");
      }
    } else if (section.type === "custom") {
      const block = cv.customSections.find((b) => b.id === section.id);
      for (const en of block?.entries ?? []) {
        lines.push([en.heading, en.subheading].filter(Boolean).join(" — "));
        if (en.start || en.end) lines.push(`${en.start} - ${en.end}`);
        if (en.description) lines.push(stripMarkup(en.description));
        lines.push("");
      }
    }
    lines.push("");
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function exportToJSON(cv: CVData, filename: string) {
  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<CVData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
