"use client";

import { useState } from "react";
import { useCVStore } from "@/lib/store";
import { ImportCVButton } from "./ImportCVButton";
import { useT } from "@/lib/i18n";
import { CVProfile } from "@/lib/types";

function ExportAllButton({ profiles }: { profiles: CVProfile[] }) {
  const [busy, setBusy] = useState(false);
  if (profiles.length <= 1) return null;
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const { exportAllProfilesZip } = await import("@/lib/exportAll");
          await exportAllProfilesZip(profiles);
        } finally {
          setBusy(false);
        }
      }}
      className="text-[11px] text-[#3F7368] hover:underline px-1 font-medium disabled:opacity-50"
    >
      {busy ? "Zipping…" : "Export all as ZIP"}
    </button>
  );
}

const STALE_MS = 1000 * 60 * 60 * 24 * 90; // 90 days

function LastUpdatedBadge({ updatedAt }: { updatedAt: number }) {
  // Computed once per mount rather than on every render — this badge only
  // needs to be roughly right, not live-ticking.
  const [now] = useState(() => Date.now());
  const stale = now - updatedAt > STALE_MS;
  const days = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
  const label = days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
  if (!stale) return null;
  return (
    <span
      className="text-[10px] text-[#8A6D3B] bg-[#8A6D3B1A] rounded px-2 py-0.5"
      title="This CV hasn't been touched in a while — worth a quick review before sending it out."
    >
      Updated {label}
    </span>
  );
}

export function ProfileBar() {
  const t = useT();
  const profiles = useCVStore((s) => s.profiles);
  const activeProfileId = useCVStore((s) => s.activeProfileId);
  const switchProfile = useCVStore((s) => s.switchProfile);
  const newProfile = useCVStore((s) => s.newProfile);
  const duplicateProfile = useCVStore((s) => s.duplicateProfile);
  const renameProfile = useCVStore((s) => s.renameProfile);
  const deleteProfile = useCVStore((s) => s.deleteProfile);
  const [editingName, setEditingName] = useState(false);

  const active = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={activeProfileId}
        onChange={(e) => switchProfile(e.target.value)}
        className="text-sm border border-[#E4E0D8] rounded-md px-2 py-1.5 bg-white text-[#1B2430] max-w-[160px]"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {editingName ? (
        <input
          autoFocus
          defaultValue={active?.name}
          onBlur={(e) => {
            if (e.target.value.trim()) renameProfile(activeProfileId, e.target.value.trim());
            setEditingName(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="text-sm border border-[#3F7368] rounded-md px-2 py-1.5 w-28"
        />
      ) : (
        <button
          onClick={() => setEditingName(true)}
          className="text-[11px] text-[#9CA3AF] hover:text-[#1B2430] px-1"
          title="Rename CV"
        >
          {t("rename")}
        </button>
      )}

      <button
        onClick={() => newProfile()}
        className="text-[11px] text-[#3F7368] hover:underline px-1 font-medium"
      >
        {t("newProfile")}
      </button>
      <button
        onClick={duplicateProfile}
        className="text-[11px] text-[#3F7368] hover:underline px-1 font-medium"
      >
        {t("duplicate")}
      </button>
      <ImportCVButton />
      <ExportAllButton profiles={profiles} />
      {active && <LastUpdatedBadge updatedAt={active.updatedAt} />}
      {profiles.length > 1 && (
        <button
          onClick={() => {
            if (confirm(`Delete "${active?.name}"?`)) deleteProfile(activeProfileId);
          }}
          className="text-[11px] text-[#B45247] hover:underline px-1"
        >
          {t("deleteProfile")}
        </button>
      )}
    </div>
  );
}
