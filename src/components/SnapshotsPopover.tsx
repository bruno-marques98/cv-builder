"use client";

import { useState, useRef, useEffect } from "react";
import { useCVStore } from "@/lib/store";

export function SnapshotsPopover() {
  const profiles = useCVStore((s) => s.profiles);
  const activeProfileId = useCVStore((s) => s.activeProfileId);
  const saveSnapshot = useCVStore((s) => s.saveSnapshot);
  const restoreSnapshot = useCVStore((s) => s.restoreSnapshot);
  const deleteSnapshot = useCVStore((s) => s.deleteSnapshot);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const snapshots = profiles.find((p) => p.id === activeProfileId)?.snapshots ?? [];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm px-3 py-1.5 rounded-md border border-[#E4E0D8] text-[#1B2430] hover:border-[#1B2430]"
      >
        Versions {snapshots.length > 0 && `(${snapshots.length})`} ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E4E0D8] rounded-lg shadow-lg p-4 z-20 flex flex-col gap-3">
          <p className="text-[10px] text-[#9CA3AF]">
            Save a named snapshot before a big edit, so you can jump back to it later without undoing step by step.
          </p>
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Before applying to Google"
              className="flex-1 text-sm rounded-md border border-[#E4E0D8] px-2.5 py-1.5 outline-none focus:border-[#3F7368]"
            />
            <button
              onClick={() => {
                const label = name.trim() || new Date().toLocaleString();
                saveSnapshot(label);
                setName("");
              }}
              className="text-sm text-white bg-[#1B2430] px-3 py-1.5 rounded-md font-medium"
            >
              Save
            </button>
          </div>
          {snapshots.length > 0 && (
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
              {[...snapshots].reverse().map((sn) => (
                <div key={sn.id} className="flex items-center gap-2 rounded-md border border-[#E4E0D8] px-2.5 py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#1B2430] truncate">{sn.name}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{new Date(sn.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Restore "${sn.name}"? Your current edits stay in undo history.`)) {
                        restoreSnapshot(sn.id);
                        setOpen(false);
                      }
                    }}
                    className="text-[11px] text-[#3F7368] hover:underline shrink-0"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => deleteSnapshot(sn.id)}
                    className="text-[11px] text-[#9CA3AF] hover:text-[#B45247] shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
