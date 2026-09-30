"use client";

import { useState } from "react";
import { useCVStore } from "@/lib/store";
import { Density, FontScale } from "@/lib/types";
import { PAGE_DIMENSIONS } from "./Preview";

// Ordered from most spacious/readable to most compact — the first
// combination that fits one page wins.
const COMBOS: { density: Density; fontScale: FontScale }[] = [
  { density: "comfortable", fontScale: "lg" },
  { density: "comfortable", fontScale: "md" },
  { density: "comfortable", fontScale: "sm" },
  { density: "compact", fontScale: "lg" },
  { density: "compact", fontScale: "md" },
  { density: "compact", fontScale: "sm" },
];

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export function FitToOneButton({ previewRef }: { previewRef: React.RefObject<HTMLDivElement | null> }) {
  const cv = useCVStore((s) => s.cv);
  const setDensity = useCVStore((s) => s.setDensity);
  const setFontScale = useCVStore((s) => s.setFontScale);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"fit" | "tight" | null>(null);

  async function handleClick() {
    if (!previewRef.current) return;
    setBusy(true);
    setResult(null);
    const pageHeight = PAGE_DIMENSIONS[cv.settings.pageSize].height;

    let landed: (typeof COMBOS)[number] = COMBOS[COMBOS.length - 1];
    let fit = false;

    for (const combo of COMBOS) {
      setDensity(combo.density);
      setFontScale(combo.fontScale);
      await nextFrame();
      const height = previewRef.current.scrollHeight;
      if (height <= pageHeight + 4) {
        landed = combo;
        fit = true;
        break;
      }
    }

    // Already applied `landed` as the last iteration's settings if fit;
    // if nothing fit, the loop already left the most-compact combo active.
    setDensity(landed.density);
    setFontScale(landed.fontScale);
    setResult(fit ? "fit" : "tight");
    setBusy(false);
    setTimeout(() => setResult(null), 3000);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={busy}
        className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2 disabled:opacity-50"
      >
        {busy ? "Fitting…" : "Fit to one page"}
      </button>
      {result === "fit" && <span className="text-[10px] text-[#3F7368]">Fits on one page ✓</span>}
      {result === "tight" && (
        <span className="text-[10px] text-[#B45247]">Still runs long even at the most compact setting</span>
      )}
    </div>
  );
}
