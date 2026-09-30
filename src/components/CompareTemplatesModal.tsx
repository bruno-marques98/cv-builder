"use client";

import { useState } from "react";
import { useCVStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";

function TemplateSlot({ id, onPick }: { id: string; onPick: (id: string) => void }) {
  const cv = useCVStore((s) => s.cv);
  const Template = TEMPLATES[id]?.component ?? TEMPLATES.modern.component;
  return (
    <div className="flex flex-col gap-2 items-center">
      <select
        value={id}
        onChange={(e) => onPick(e.target.value)}
        className="text-sm border border-[#E4E0D8] rounded-md px-2 py-1.5 bg-white text-[#1B2430]"
      >
        {Object.entries(TEMPLATES).map(([tid, t]) => (
          <option key={tid} value={tid}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="shadow-lg" style={{ width: 320, height: 452, overflow: "hidden" }}>
        <div style={{ width: 595, height: 842, transform: "scale(0.538)", transformOrigin: "top left" }}>
          <Template cv={cv} />
        </div>
      </div>
    </div>
  );
}

export function CompareTemplatesModal({ onClose }: { onClose: () => void }) {
  const setTemplate = useCVStore((s) => s.setTemplate);
  const currentTemplateId = useCVStore((s) => s.cv.templateId);
  const [left, setLeft] = useState(currentTemplateId);
  const [right, setRight] = useState(
    Object.keys(TEMPLATES).find((id) => id !== currentTemplateId) ?? currentTemplateId
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 max-w-[900px] w-full max-h-[90vh] overflow-y-auto flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1B2430]">Compare templates</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1B2430] text-sm">
            Close
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          <TemplateSlot id={left} onPick={setLeft} />
          <TemplateSlot id={right} onPick={setRight} />
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              setTemplate(left);
              onClose();
            }}
            className="text-sm rounded-md border border-[#1B2430] text-[#1B2430] px-4 py-2 font-medium"
          >
            Use {TEMPLATES[left]?.name}
          </button>
          <button
            onClick={() => {
              setTemplate(right);
              onClose();
            }}
            className="text-sm rounded-md border border-[#1B2430] text-[#1B2430] px-4 py-2 font-medium"
          >
            Use {TEMPLATES[right]?.name}
          </button>
        </div>
      </div>
    </div>
  );
}
