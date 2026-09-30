"use client";

import { CVData } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { useT } from "@/lib/i18n";

export function SharedCVView({ cv, onEdit }: { cv: CVData; onEdit: () => void }) {
  const t = useT();
  const Template = TEMPLATES[cv.templateId]?.component ?? TEMPLATES.modern.component;
  const page = cv.settings.pageSize === "letter" ? { width: 612, height: 792 } : { width: 595, height: 842 };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center py-10 px-6 gap-6 print:bg-white print:py-0">
      <div className="w-full max-w-[595px] flex items-center justify-between print:hidden">
        <span className="text-sm text-[#6B7280]">{t("appName")} — {t("previewTab")}</span>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="text-sm text-[#6B7280] hover:text-[#1B2430] px-2">
            {t("print")}
          </button>
          <button onClick={onEdit} className="rounded-md bg-[#1B2430] text-white text-sm px-4 py-2 font-medium">
            {t("editTab")} this CV
          </button>
        </div>
      </div>
      <div className="shadow-lg print:shadow-none" style={{ width: page.width, minHeight: page.height }}>
        <Template cv={cv} />
      </div>
    </div>
  );
}
