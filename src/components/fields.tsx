"use client";

import { useT } from "@/lib/i18n";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
      {textarea ? (
        <textarea
          className="rounded-md border border-[#E4E0D8] px-2.5 py-1.5 text-sm outline-none focus:border-[#3F7368] resize-none min-h-[64px]"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="rounded-md border border-[#E4E0D8] px-2.5 py-1.5 text-sm outline-none focus:border-[#3F7368]"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function Card({
  children,
  onRemove,
  onDuplicate,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  onDuplicate?: () => void;
}) {
  const t = useT();
  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-[#E4E0D8] bg-[#FCFBF9] p-3">
      <div className="absolute top-2 right-2 flex gap-2">
        {onDuplicate && (
          <button onClick={onDuplicate} className="text-[#9CA3AF] hover:text-[#3F7368] text-xs" aria-label="Duplicate">
            {t("duplicateEntry")}
          </button>
        )}
        <button onClick={onRemove} className="text-[#9CA3AF] hover:text-[#B45247] text-xs" aria-label="Remove">
          {t("remove")}
        </button>
      </div>
      {children}
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="self-start text-sm text-[#3F7368] hover:underline font-medium"
    >
      + {label}
    </button>
  );
}
