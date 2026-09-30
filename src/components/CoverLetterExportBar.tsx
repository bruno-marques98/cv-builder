"use client";

import { useState } from "react";
import { useCoverLetterStore } from "@/lib/coverLetterStore";
import { exportToPDF, exportCoverLetterToDocx } from "@/lib/export";
import { Icon, ITEM } from "./ExportBar";

export function CoverLetterExportBar({ previewRef }: { previewRef: React.RefObject<HTMLDivElement | null> }) {
  const letter = useCoverLetterStore((s) => s.letter);
  const reset = useCoverLetterStore((s) => s.reset);
  const [busy, setBusy] = useState<string | null>(null);

  const filename = (letter.senderName || "cover_letter").trim().replace(/\s+/g, "_").toLowerCase() + "_cover_letter";

  async function handlePDF() {
    if (!previewRef.current) return;
    setBusy("pdf");
    try {
      await exportToPDF(previewRef.current, filename);
    } finally {
      setBusy(null);
    }
  }

  async function handleDocx() {
    setBusy("docx");
    try {
      await exportCoverLetterToDocx(letter, filename);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handlePDF}
        disabled={busy !== null}
        className="w-full flex items-center gap-2.5 rounded-md bg-[#1B2430] text-white text-sm px-3 py-2 font-medium disabled:opacity-50"
      >
        <Icon name="download" />
        <span>{busy === "pdf" ? "Generating…" : "Download PDF"}</span>
      </button>
      <button
        onClick={handleDocx}
        disabled={busy !== null}
        className="w-full flex items-center gap-2.5 rounded-md border border-[#1B2430] text-[#1B2430] text-sm px-3 py-2 font-medium disabled:opacity-50"
      >
        <Icon name="doc" />
        <span>{busy === "docx" ? "Generating…" : "Download Word"}</span>
      </button>
      <div className="h-px bg-[#E4E0D8] my-1" />
      <button onClick={() => window.print()} className={ITEM}>
        <Icon name="print" />
        <span>Print</span>
      </button>
      <button
        onClick={() => {
          if (confirm("Reset the cover letter?")) reset();
        }}
        className="w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-md text-[#B45247] hover:bg-[#B452471A]"
      >
        <Icon name="trash" />
        <span>Reset</span>
      </button>
    </div>
  );
}
