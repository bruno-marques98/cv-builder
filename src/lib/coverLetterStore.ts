import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CoverLetterData, emptyCoverLetter } from "./types";

interface CoverLetterStore {
  letter: CoverLetterData;
  update: (patch: Partial<CoverLetterData>) => void;
  applyCVContact: (contact: { name: string; email: string; phone: string }) => void;
  reset: () => void;
}

export const useCoverLetterStore = create<CoverLetterStore>()(
  persist(
    (set) => ({
      letter: emptyCoverLetter,
      update: (patch) => set((s) => ({ letter: { ...s.letter, ...patch } })),
      applyCVContact: (contact) =>
        set((s) => ({
          letter: {
            ...s.letter,
            senderName: contact.name,
            senderEmail: contact.email,
            senderPhone: contact.phone,
          },
        })),
      reset: () => set({ letter: emptyCoverLetter }),
    }),
    { name: "cover-letter-storage" }
  )
);
