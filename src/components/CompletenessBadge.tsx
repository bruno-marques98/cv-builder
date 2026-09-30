"use client";

import { useCVStore } from "@/lib/store";

export function CompletenessBadge() {
  const cv = useCVStore((s) => s.cv);

  const checks = [
    !!cv.personal.fullName && cv.personal.fullName !== "Your Name",
    !!cv.personal.role && cv.personal.role !== "Your Role",
    !!cv.personal.email,
    !!cv.personal.phone,
    !!cv.personal.photo,
    !!cv.summary,
    cv.experience.length > 0,
    cv.education.length > 0,
    cv.skills.length > 0,
  ];
  const percent = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const color = percent >= 80 ? "#3F7368" : percent >= 40 ? "#8A6D3B" : "#B45247";

  return (
    <div className="flex items-center gap-1.5" title={`${percent}% complete`}>
      <div className="h-1.5 w-16 rounded-full bg-[#F1EFEA] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] text-[#9CA3AF]">{percent}%</span>
    </div>
  );
}
