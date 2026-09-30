"use client";

import { forwardRef } from "react";
import { useCoverLetterStore } from "@/lib/coverLetterStore";
import { CoverLetterTemplate } from "@/lib/templates/coverLetter";

export const CoverLetterPreview = forwardRef<HTMLDivElement>(function CoverLetterPreview(_props, ref) {
  const letter = useCoverLetterStore((s) => s.letter);
  return (
    <div className="flex justify-center print:block">
      <div ref={ref} className="shadow-lg print:shadow-none" style={{ width: "595px", minHeight: "842px" }}>
        <CoverLetterTemplate letter={letter} />
      </div>
    </div>
  );
});
