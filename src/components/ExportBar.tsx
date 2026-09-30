"use client";

import { useRef, useState } from "react";
import { useCVStore } from "@/lib/store";
import { exportToPDF, exportToDocx, exportToJSON, importFromJSON, exportCombinedPDF, cvToPlainText, exportToImage } from "@/lib/export";
import { buildShareURL, buildProtectedShareURL } from "@/lib/share";
import { useT } from "@/lib/i18n";

const ICONS: Record<string, string> = {
  download: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16",
  doc: "M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4",
  print: "M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 118 0v3",
  mail: "M4 5h16v14H4zM4 6l8 7 8-7",
  copy: "M9 9h11v11H9zM5 15V4h11",
  save: "M5 4h11l3 3v13H5zM8 4v5h7M8 20v-6h8v6",
  upload: "M12 21V9m0 0l-4 4m4-4l4 4M4 3h16",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
};

export function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

export const ITEM =
  "w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-md text-[#4B5563] hover:bg-[#F1EFEA] hover:text-[#1B2430] disabled:opacity-50 disabled:hover:bg-transparent";

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
    <div className="flex flex-col gap-1">
      <button
        onClick={handlePDF}
        disabled={busy !== null}
        className="w-full flex items-center gap-2.5 rounded-md bg-[#1B2430] text-white text-sm px-3 py-2 font-medium disabled:opacity-50"
      >
        <Icon name="download" />
        <span>{busy === "pdf" ? t("generating") : t("downloadPDF")}</span>
      </button>
      <button
        onClick={handleDocx}
        disabled={busy !== null}
        className="w-full flex items-center gap-2.5 rounded-md border border-[#1B2430] text-[#1B2430] text-sm px-3 py-2 font-medium disabled:opacity-50"
      >
        <Icon name="doc" />
        <span>{busy === "docx" ? t("generating") : t("downloadWord")}</span>
      </button>
      {coverLetterPreviewRef && (
        <button onClick={handleCombined} disabled={busy !== null} className={ITEM}>
          <Icon name="layers" />
          <span>{busy === "combined" ? t("generating") : t("downloadBoth")}</span>
        </button>
      )}
      <button onClick={() => handleImage("png")} disabled={busy !== null} className={ITEM}>
        <Icon name="image" />
        <span>{busy === "image" ? t("generating") : "PNG"}</span>
      </button>
      <button onClick={() => handleImage("jpg")} disabled={busy !== null} className={ITEM}>
        <Icon name="image" />
        <span>{busy === "image" ? t("generating") : "JPG"}</span>
      </button>

      <div className="h-px bg-[#E4E0D8] my-1" />

      <button onClick={() => window.print()} className={ITEM}>
        <Icon name="print" />
        <span>{t("print")}</span>
      </button>
      <button onClick={handleShare} className={ITEM}>
        <Icon name="link" />
        <span>{copied ? t("linkCopied") : t("shareLink")}</span>
      </button>
      <button
        onClick={handleProtectedShare}
        disabled={busy !== null}
        className={ITEM}
        title="Encrypt the link with a password before copying it"
      >
        <Icon name="lock" />
        <span>{busy === "protected-share" ? t("generating") : "Share (password)"}</span>
      </button>
      <button onClick={handleEmail} className={ITEM}>
        <Icon name="mail" />
        <span>{t("email")}</span>
      </button>
      <button onClick={handleCopyText} className={ITEM}>
        <Icon name="copy" />
        <span>{textCopied ? t("textCopied") : t("copyAsText")}</span>
      </button>

      <div className="h-px bg-[#E4E0D8] my-1" />

      <button onClick={() => exportToJSON(cv, filename)} className={ITEM}>
        <Icon name="save" />
        <span>{t("saveData")}</span>
      </button>
      <button onClick={() => fileInput.current?.click()} className={ITEM}>
        <Icon name="upload" />
        <span>{t("loadData")}</span>
      </button>
      <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      <button
        onClick={() => {
          if (confirm("Reset all CV data?")) reset();
        }}
        className="w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-md text-[#B45247] hover:bg-[#B452471A]"
      >
        <Icon name="trash" />
        <span>{t("reset")}</span>
      </button>
    </div>
  );
}
