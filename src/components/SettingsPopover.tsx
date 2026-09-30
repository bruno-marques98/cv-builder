"use client";

import { useState, useRef, useEffect } from "react";
import { useCVStore } from "@/lib/store";
import { FontPairId, PageSize } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { checkContrast } from "@/lib/contrast";

const FONT_LABELS: Record<FontPairId, string> = {
  default: "Default",
  serif: "Serif",
  grotesk: "Grotesk",
};

export function SettingsPopover() {
  const t = useT();
  const cv = useCVStore((s) => s.cv);
  const setAccentColor = useCVStore((s) => s.setAccentColor);
  const setFontPair = useCVStore((s) => s.setFontPair);
  const setPageSize = useCVStore((s) => s.setPageSize);
  const setQR = useCVStore((s) => s.setQR);
  const setPhotoPosition = useCVStore((s) => s.setPhotoPosition);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm px-3 py-1.5 rounded-md border border-[#E4E0D8] text-[#1B2430] hover:border-[#1B2430]"
      >
        {t("moreStyling")}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E4E0D8] rounded-lg shadow-lg p-4 z-20 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[#6B7280]">{t("customAccent")}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cv.accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 w-10 rounded border border-[#E4E0D8] cursor-pointer"
              />
              <span className="text-[11px] text-[#9CA3AF]">{cv.accentColor}</span>
            </div>
            {(() => {
              const bg = cv.templateId === "dark" ? "#1B2430" : "#ffffff";
              const c = checkContrast(cv.accentColor, bg);
              return (
                <p className={`text-[10px] ${c.passesAALarge ? "text-[#9CA3AF]" : "text-[#B45247]"}`}>
                  Contrast vs {bg === "#1B2430" ? "dark" : "white"} background: {c.ratio.toFixed(1)}:1
                  {!c.passesAALarge && " — may be hard to read for headings"}
                  {c.passesAALarge && !c.passesAA && " (fine for headings, low for body text)"}
                </p>
              );
            })()}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[#6B7280]">{t("fontPairing")}</span>
            <div className="flex gap-1.5">
              {(Object.keys(FONT_LABELS) as FontPairId[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFontPair(f)}
                  className={`text-[11px] px-2.5 py-1 rounded border ${
                    cv.settings.fontPair === f
                      ? "bg-[#1B2430] text-white border-[#1B2430]"
                      : "border-[#E4E0D8] text-[#1B2430]"
                  }`}
                >
                  {FONT_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[#6B7280]">{t("pageSize")}</span>
            <div className="flex gap-1.5">
              {(["a4", "letter"] as PageSize[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPageSize(p)}
                  className={`text-[11px] px-2.5 py-1 rounded border ${
                    cv.settings.pageSize === p
                      ? "bg-[#1B2430] text-white border-[#1B2430]"
                      : "border-[#E4E0D8] text-[#1B2430]"
                  }`}
                >
                  {p === "a4" ? "A4" : "US Letter"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[#6B7280]">{t("photoPosition")}</span>
            <div className="flex gap-1.5">
              {(["left", "right"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPhotoPosition(p)}
                  className={`text-[11px] px-2.5 py-1 rounded border ${
                    cv.settings.photoPosition === p
                      ? "bg-[#1B2430] text-white border-[#1B2430]"
                      : "border-[#E4E0D8] text-[#1B2430]"
                  }`}
                >
                  {p === "left" ? t("left") : t("right")}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#9CA3AF]">Applies on Minimal, Timeline, Creative and Dark templates.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B7280]">{t("qrCode")}</span>
              <button
                onClick={() => setQR({ qrEnabled: !cv.settings.qrEnabled })}
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  cv.settings.qrEnabled ? "bg-[#3F7368] text-white" : "bg-[#F1EFEA] text-[#9CA3AF]"
                }`}
              >
                {cv.settings.qrEnabled ? t("on") : t("off")}
              </button>
            </div>
            {cv.settings.qrEnabled && (
              <>
                <input
                  value={cv.settings.qrTarget}
                  onChange={(e) => setQR({ qrTarget: e.target.value })}
                  placeholder="https://linkedin.com/in/you"
                  className="text-sm rounded-md border border-[#E4E0D8] px-2.5 py-1.5 outline-none focus:border-[#3F7368]"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  Links to your LinkedIn, portfolio, etc. Shown on Modern, Corporate, Bold and Creative templates.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
