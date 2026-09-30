"use client";

import { useCVStore } from "@/lib/store";

export function UndoRedoButtons() {
  const past = useCVStore((s) => s.past);
  const future = useCVStore((s) => s.future);
  const undo = useCVStore((s) => s.undo);
  const redo = useCVStore((s) => s.redo);

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={undo}
        disabled={past.length === 0}
        title="Undo (Ctrl+Z)"
        className="h-7 w-7 rounded flex items-center justify-center text-[#1B2430] hover:bg-[#F1EFEA] disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ↺
      </button>
      <button
        onClick={redo}
        disabled={future.length === 0}
        title="Redo (Ctrl+Shift+Z)"
        className="h-7 w-7 rounded flex items-center justify-center text-[#1B2430] hover:bg-[#F1EFEA] disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ↻
      </button>
    </div>
  );
}
