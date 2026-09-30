"use client";

import { useRef, useState } from "react";
import { useCVStore } from "@/lib/store";
import { exportToPDF, exportToDocx, exportToJSON, importFromJSON, exportCombinedPDF, cvToPlainText, exportToImage } from "@/lib/export";
import { buildShareURL, buildProtectedShareURL } from "@/lib/share";
import { useT } from "@/lib/i18n";

export function ExportBar({
  previewRef,
  coverLetterPreviewRef,
}: {
  previewRef: React.RefObject<HTMLDivElement | null>;
  coverLetterPreviewRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const t = useT();
  const cv = useCVStore((s) => s.cv);
  const loadCV = useCVStore((s) => s.loadCV);
  const reset = useCVStore((s) => s.reset);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const filename = (cv.personal.fullName || "cv").trim().replace(/\s+/g, "_").toLowerCase();

  async function handlePDF() {
    if (!previewRef.current) return;
    setBusy("pdf");
    try {
      await exportToPDF(previewRef.current, filename, cv.settings.pageSize);
    } finally {
      setBusy(null);
    }
  }

  async function handleDocx() {
    setBusy("docx");
    try {
      await exportToDocx(cv, filename);
    } finally {
      setBusy(null);
    }
  }

  async function handleImage(format: "png" | "jpg") {
    if (!previewRef.current) return;
    setBusy("image");
    try {
      await exportToImage(previewRef.current, filename, format);
    } finally {
      setBusy(null);
    }
  }

  async function handleCombined() {
    if (!previewRef.current || !coverLetterPreviewRef?.current) return;
    setBusy("combined");
    try {
      await exportCombinedPDF(coverLetterPreviewRef.current, previewRef.current, `${filename}_cv_and_letter`, cv.settings.pageSize);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    const url = buildShareURL(cv);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this link:", url);
    }
  }

  async function handleProtectedShare() {
    const password = prompt(
      "Set a password for this link.\n\nNote: this obscures the CV data in the URL so it isn't readable at a glance, but the data still travels in the link itself — treat it as a deterrent, not real security."
    );
    if (!password) return;
    setBusy("protected-share");
    try {
      const url = await buildProtectedShareURL(cv, password);
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        prompt("Copy this protected link:", url);
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(cvToPlainText(cv));
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
    } catch {
      prompt("Copy this text:", cvToPlainText(cv));
    }
  }

  function handleEmail() {
    const url = buildShareURL(cv);
    const subject = encodeURIComponent(`${cv.personal.fullName} — CV`);
    const body = encodeURIComponent(`Here's my CV: ${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await importFromJSON(file);
    loadCV(data);
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handlePDF}
        disabled={busy !== null}
        className="rounded-md bg-[#1B2430] text-white text-sm px-4 py-2 font-medium disabled:opacity-50"
      >
        {busy === "pdf" ? t("generating") : t("downloadPDF")}
      </button>
      <button
        onClick={handleDocx}
        disabled={busy !== null}
        className="rounded-md border border-[#1B2430] text-[#1B2430] text-sm px-4 py-2 font-medium disabled:opacity-50"
      >
        {busy === "docx" ? t("generating") : t("downloadWord")}
      </button>
      {coverLetterPreviewRef && (
        <button
          onClick={handleCombined}
          disabled={busy !== null}
          className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2 disabled:opacity-50"
        >
          {busy === "combined" ? t("generating") : t("downloadBoth")}
        </button>
      )}
      <button
        onClick={() => handleImage("png")}
        disabled={busy !== null}
        className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2 disabled:opacity-50"
      >
        {busy === "image" ? t("generating") : "PNG"}
      </button>
      <button
        onClick={() => handleImage("jpg")}
        disabled={busy !== null}
        className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2 disabled:opacity-50"
      >
        {busy === "image" ? t("generating") : "JPG"}
      </button>
      <div className="w-px h-6 bg-[#E4E0D8] mx-1" />
      <button onClick={() => window.print()} className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2">
        {t("print")}
      </button>
      <button onClick={handleShare} className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2">
        {copied ? t("linkCopied") : t("shareLink")}
      </button>
      <button
        onClick={handleProtectedShare}
        disabled={busy !== null}
        className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2 disabled:opacity-50"
        title="Encrypt the link with a password before copying it"
      >
        {busy === "protected-share" ? t("generating") : "🔒 Share"}
      </button>
      <button onClick={handleEmail} className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2">
        {t("email")}
      </button>
      <button onClick={handleCopyText} className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2">
        {textCopied ? t("textCopied") : t("copyAsText")}
      </button>
      <div className="w-px h-6 bg-[#E4E0D8] mx-1" />
      <button
        onClick={() => exportToJSON(cv, filename)}
        className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2"
      >
        {t("saveData")}
      </button>
      <button
        onClick={() => fileInput.current?.click()}
        className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2"
      >
        {t("loadData")}
      </button>
      <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      <button
        onClick={() => {
          if (confirm("Reset all CV data?")) reset();
        }}
        className="text-sm text-[#B45247] hover:underline px-2"
      >
        {t("reset")}
      </button>
    </div>
  );
}
