"use client";

import { useRef, useState } from "react";
import { useCVStore } from "@/lib/store";
import { parseCVFile } from "@/lib/importCV";
import { emptyCV } from "@/lib/types";
import { useT } from "@/lib/i18n";

export function ImportCVButton() {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const newProfile = useCVStore((s) => s.newProfile);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await parseCVFile(file);
      const data = {
        ...emptyCV,
        ...parsed,
        personal: { ...emptyCV.personal, ...parsed.personal },
      };
      newProfile(parsed.personal?.fullName ? `${parsed.personal.fullName} (imported)` : "Imported CV", data);
      alert(
        "Imported what we could find automatically: contact details, and best-effort Experience/Education/Skills sections based on headers in the document. Double check the dates and split any merged entries — this isn't a full resume parser."
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't read that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="text-[11px] text-[#3F7368] hover:underline px-1 font-medium disabled:opacity-50"
      >
        {busy ? "Reading…" : t("importFromFile")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
