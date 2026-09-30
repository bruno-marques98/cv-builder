"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useCVStore } from "@/lib/store";
import { checkResumeHealth } from "@/lib/healthCheck";
import { matchKeywords } from "@/lib/keywordMatch";
import { cvToPlainText } from "@/lib/export";

type Tab = "health" | "keywords";

export function ToolsPopover() {
  const cv = useCVStore((s) => s.cv);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("health");
  const [jobText, setJobText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const issues = useMemo(() => (open && tab === "health" ? checkResumeHealth(cv) : []), [open, tab, cv]);
  const match = useMemo(
    () => (open && tab === "keywords" && jobText.trim() ? matchKeywords(jobText, cvToPlainText(cv)) : null),
    [open, tab, jobText, cv]
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm px-3 py-1.5 rounded-md border border-[#E4E0D8] text-[#1B2430] hover:border-[#1B2430]"
      >
        Tools ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-[#E4E0D8] rounded-lg shadow-lg p-4 z-20 flex flex-col gap-3">
          <div className="flex rounded-md border border-[#E4E0D8] overflow-hidden w-fit">
            <button
              onClick={() => setTab("health")}
              className={`px-3 py-1 text-[12px] font-medium ${tab === "health" ? "bg-[#1B2430] text-white" : "text-[#1B2430]"}`}
            >
              Health check
            </button>
            <button
              onClick={() => setTab("keywords")}
              className={`px-3 py-1 text-[12px] font-medium ${tab === "keywords" ? "bg-[#1B2430] text-white" : "text-[#1B2430]"}`}
            >
              Keyword match
            </button>
          </div>

          {tab === "health" && (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {issues.length === 0 ? (
                <p className="text-[12px] text-[#3F7368]">No issues spotted — looking solid.</p>
              ) : (
                issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`text-[11px] rounded px-2.5 py-1.5 ${
                      issue.severity === "warn" ? "bg-[#B452471A] text-[#8a3a30]" : "bg-[#F1EFEA] text-[#6B7280]"
                    }`}
                  >
                    {issue.message}
                  </div>
                ))
              )}
              <p className="text-[10px] text-[#9CA3AF] mt-1">
                Automated pattern checks only — not a substitute for a human read-through.
              </p>
            </div>
          )}

          {tab === "keywords" && (
            <div className="flex flex-col gap-2">
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste a job description here…"
                className="text-sm rounded-md border border-[#E4E0D8] px-2.5 py-1.5 outline-none focus:border-[#3F7368] resize-none h-24"
              />
              {match && (
                <div className="flex flex-col gap-2">
                  <p className="text-[12px] text-[#1B2430] font-medium">{match.matchPercent}% of likely keywords found in your CV</p>
                  {match.missing.length > 0 && (
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] mb-1">Missing:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.missing.map((w) => (
                          <span key={w} className="text-[10px] bg-[#B452471A] text-[#8a3a30] px-1.5 py-0.5 rounded">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.matched.length > 0 && (
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] mb-1">Already present:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.matched.map((w) => (
                          <span key={w} className="text-[10px] bg-[#3F73681A] text-[#3F7368] px-1.5 py-0.5 rounded">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <p className="text-[10px] text-[#9CA3AF]">
                Literal word matching, not a real ATS simulation — treat this as a sanity check, not a score.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
