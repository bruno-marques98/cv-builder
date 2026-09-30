"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

const STORAGE_KEY = "cv-builder-onboarding-dismissed";

export function OnboardingChecklist() {
  const t = useT();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  const steps = [t("onboardingStep1"), t("onboardingStep2"), t("onboardingStep3"), t("onboardingStep4")];

  return (
    <div className="mx-6 mt-4 rounded-lg border border-[#E4E0D8] bg-white p-4 flex items-start justify-between gap-4 print:hidden">
      <div>
        <h3 className="text-[13px] font-semibold text-[#1B2430] mb-2">{t("onboardingTitle")}</h3>
        <ol className="flex flex-col gap-1 text-[12px] text-[#6B7280] list-decimal pl-4">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
      <button onClick={dismiss} className="text-[11px] text-[#9CA3AF] hover:text-[#1B2430] shrink-0">
        {t("dismiss")}
      </button>
    </div>
  );
}
