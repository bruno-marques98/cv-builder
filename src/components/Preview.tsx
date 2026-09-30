"use client";

import { forwardRef, CSSProperties } from "react";
import { useCVStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { FontScale, FontPairId, PageSize } from "@/lib/types";

const ZOOM: Record<FontScale, number> = { sm: 0.9, md: 1, lg: 1.12 };

const FONT_PAIRS: Record<FontPairId, { display: string; body: string }> = {
  default: { display: "var(--font-display)", body: "var(--font-body)" },
  serif: { display: "var(--font-display-serif)", body: "var(--font-body-serif)" },
  grotesk: { display: "var(--font-grotesk)", body: "var(--font-grotesk)" },
};

// A4 and US Letter, in points (matches jsPDF's default "pt" unit so the
// on-screen preview lines up with the exported PDF page).
export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  a4: { width: 595, height: 842 },
  letter: { width: 612, height: 792 },
};

export const Preview = forwardRef<HTMLDivElement>(function Preview(_props, ref) {
  const cv = useCVStore((s) => s.cv);
  const Template = TEMPLATES[cv.templateId]?.component ?? TEMPLATES.modern.component;
  const fonts = FONT_PAIRS[cv.settings.fontPair] ?? FONT_PAIRS.default;
  const page = PAGE_DIMENSIONS[cv.settings.pageSize] ?? PAGE_DIMENSIONS.a4;

  return (
    <div className="flex justify-center print:block">
      <div
        ref={ref}
        className="shadow-lg print:shadow-none"
        style={
          {
            width: `${page.width}px`,
            minHeight: `${page.height}px`,
            zoom: ZOOM[cv.settings.fontScale],
            "--font-display": fonts.display,
            "--font-body": fonts.body,
          } as CSSProperties
        }
      >
        <Template cv={cv} />
      </div>
    </div>
  );
});
