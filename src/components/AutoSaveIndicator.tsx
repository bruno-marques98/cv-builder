"use client";

import { useEffect, useRef, useState } from "react";
import { useCVStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function AutoSaveIndicator() {
  const t = useT();
  const cv = useCVStore((s) => s.cv);
  const [visible, setVisible] = useState(false);
  const first = useRef(true);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setVisible(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setVisible(false), 1500);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [cv]);

  return (
    <span
      className={`text-[10px] text-[#9CA3AF] transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {t("savedJustNow")}
    </span>
  );
}
