"use client";

import { useCVStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { TemplateIcon } from "./TemplateIcon";

const ACCENTS = ["#3F7368", "#B45247", "#2C4A6E", "#8A6D3B", "#5B4B8A"];

export function TemplatePicker() {
  const cv = useCVStore((s) => s.cv);
  const setTemplate = useCVStore((s) => s.setTemplate);
  const setAccentColor = useCVStore((s) => s.setAccentColor);
  const setDensity = useCVStore((s) => s.setDensity);
  const setFontScale = useCVStore((s) => s.setFontScale);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex gap-2 flex-wrap">
        {Object.entries(TEMPLATES).map(([id, t]) => (
          <button
            key={id}
            onClick={() => setTemplate(id)}
            className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-md text-sm border ${
              cv.templateId === id
                ? "border-[#1B2430] bg-[#1B2430] text-white"
                : "border-[#E4E0D8] text-[#1B2430] hover:border-[#1B2430]"
            }`}
          >
            <TemplateIcon id={id} accent={cv.accentColor} />
            {t.name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {ACCENTS.map((c) => (
          <button
            key={c}
            onClick={() => setAccentColor(c)}
            className="h-6 w-6 rounded-full border-2"
            style={{
              backgroundColor: c,
              borderColor: cv.accentColor === c ? "#1B2430" : "transparent",
            }}
            aria-label={`Accent ${c}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 text-[11px]">
        <span className="text-[#9CA3AF]">Density</span>
        {(["comfortable", "compact"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDensity(d)}
            className={`px-2 py-1 rounded ${
              cv.settings.density === d ? "bg-[#1B2430] text-white" : "text-[#6B7280] hover:bg-[#F1EFEA]"
            }`}
          >
            {d === "comfortable" ? "Roomy" : "Compact"}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[11px]">
        <span className="text-[#9CA3AF]">Text</span>
        {(["sm", "md", "lg"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFontScale(f)}
            className={`px-2 py-1 rounded ${
              cv.settings.fontScale === f ? "bg-[#1B2430] text-white" : "text-[#6B7280] hover:bg-[#F1EFEA]"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
