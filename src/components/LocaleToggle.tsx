"use client";

import { useLocaleStore, Locale } from "@/lib/i18n";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
];

export function LocaleToggle() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className="flex rounded-md border border-[#E4E0D8] overflow-hidden text-[11px]">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`px-2 py-1 font-medium ${locale === code ? "bg-[#1B2430] text-white" : "text-[#6B7280]"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
