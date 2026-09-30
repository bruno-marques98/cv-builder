"use client";

import { useCoverLetterStore } from "@/lib/coverLetterStore";
import { useCVStore } from "@/lib/store";
import { Field } from "./fields";

export function CoverLetterEditor() {
  const letter = useCoverLetterStore((s) => s.letter);
  const update = useCoverLetterStore((s) => s.update);
  const applyCVContact = useCoverLetterStore((s) => s.applyCVContact);
  const cvPersonal = useCVStore((s) => s.cv.personal);

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#1B2430]">Your details</h3>
          <button
            onClick={() =>
              applyCVContact({ name: cvPersonal.fullName, email: cvPersonal.email, phone: cvPersonal.phone })
            }
            className="text-[11px] text-[#3F7368] hover:underline font-medium"
          >
            Use CV contact info
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Full name" value={letter.senderName} onChange={(v) => update({ senderName: v })} />
          <Field label="Date" value={letter.date} onChange={(v) => update({ date: v })} placeholder="Sept 14, 2026" />
          <Field label="Email" value={letter.senderEmail} onChange={(v) => update({ senderEmail: v })} />
          <Field label="Phone" value={letter.senderPhone} onChange={(v) => update({ senderPhone: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[13px] font-semibold text-[#1B2430]">Recipient</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Name" value={letter.recipientName} onChange={(v) => update({ recipientName: v })} />
          <Field label="Company" value={letter.recipientCompany} onChange={(v) => update({ recipientCompany: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[13px] font-semibold text-[#1B2430]">Letter</h3>
        <Field label="Subject line" value={letter.subject} onChange={(v) => update({ subject: v })} />
        <Field
          label="Body (leave a blank line between paragraphs)"
          value={letter.body}
          onChange={(v) => update({ body: v })}
          textarea
        />
        <Field label="Closing" value={letter.closing} onChange={(v) => update({ closing: v })} />
      </div>
    </div>
  );
}
