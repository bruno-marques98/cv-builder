"use client";

import { useRef, useState } from "react";
import { useCVStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { PhotoCropModal } from "./PhotoCropModal";

export function PhotoUpload() {
  const t = useT();
  const photo = useCVStore((s) => s.cv.personal.photo);
  const updatePersonal = useCVStore((s) => s.updatePersonal);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setPendingFile(file);
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-16 w-16 rounded-full bg-[#F1EFEA] border border-[#E4E0D8] overflow-hidden shrink-0 bg-cover bg-center"
        style={photo ? { backgroundImage: `url(${photo})` } : undefined}
      />
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-[#6B7280]">{t("photo")}</span>
        <div className="flex gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm text-[#3F7368] hover:underline font-medium"
          >
            {photo ? t("change") : t("upload")}
          </button>
          {photo && (
            <button
              onClick={() => updatePersonal({ photo: "" })}
              className="text-sm text-[#9CA3AF] hover:text-[#B45247]"
            >
              {t("remove")}
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {pendingFile && (
        <PhotoCropModal
          file={pendingFile}
          onCancel={() => setPendingFile(null)}
          onSave={(dataUrl) => {
            updatePersonal({ photo: dataUrl });
            setPendingFile(null);
          }}
        />
      )}
    </div>
  );
}
