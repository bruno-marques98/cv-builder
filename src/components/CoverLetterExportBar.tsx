"use client";

import { useState } from "react";
import { useCoverLetterStore } from "@/lib/coverLetterStore";
import { exportToPDF, exportCoverLetterToDocx } from "@/lib/export";

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
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handlePDF}
        disabled={busy !== null}
        className="rounded-md bg-[#1B2430] text-white text-sm px-4 py-2 font-medium disabled:opacity-50"
      >
        {busy === "pdf" ? "Generating…" : "Download PDF"}
      </button>
      <button
        onClick={handleDocx}
        disabled={busy !== null}
        className="rounded-md border border-[#1B2430] text-[#1B2430] text-sm px-4 py-2 font-medium disabled:opacity-50"
      >
        {busy === "docx" ? "Generating…" : "Download Word"}
      </button>
      <div className="w-px h-6 bg-[#E4E0D8] mx-1" />
      <button
        onClick={() => window.print()}
        className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2"
      >
        Print
      </button>
      <button
        onClick={() => {
          if (confirm("Reset the cover letter?")) reset();
        }}
        className="text-sm text-[#B45247] hover:underline px-2"
      >
        Reset
      </button>
    </div>
  );
}
