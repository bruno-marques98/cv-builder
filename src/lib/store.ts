import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CVData,
  CVProfile,
  emptyCV,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillItem,
  LanguageItem,
  CVSection,
  CustomEntry,
  Density,
  FontScale,
  PageSize,
  FontPairId,
  PhotoPosition,
} from "./types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function cloneCV(data: CVData): CVData {
  return JSON.parse(JSON.stringify(data));
}

function reorder<T>(arr: T[], fromId: string, toId: string, getId: (t: T) => string): T[] {
  const from = arr.findIndex((x) => getId(x) === fromId);
  const to = arr.findIndex((x) => getId(x) === toId);
  if (from === -1 || to === -1) return arr;
  const copy = [...arr];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

function duplicateWithNewId<T extends { id: string }>(arr: T[], id: string): T[] {
  const idx = arr.findIndex((x) => x.id === id);
  if (idx === -1) return arr;
  const copy = [...arr];
  copy.splice(idx + 1, 0, { ...arr[idx], id: uid() });
  return copy;
}

function makeProfile(name: string, data: CVData): CVProfile {
  return { id: uid(), name, data: cloneCV(data), updatedAt: Date.now(), snapshots: [] };
}

const HISTORY_LIMIT = 50;

interface CVStore {
  cv: CVData;
  profiles: CVProfile[];
  activeProfileId: string;
  past: CVData[];
  future: CVData[];

  setTemplate: (id: string) => void;
  setAccentColor: (color: string) => void;
  setDensity: (d: Density) => void;
  setFontScale: (f: FontScale) => void;
  setPageSize: (p: PageSize) => void;
  setFontPair: (f: FontPairId) => void;
  setPhotoPosition: (p: PhotoPosition) => void;
  setDarkMode: (d: boolean) => void;
  setQR: (patch: { qrEnabled?: boolean; qrTarget?: string }) => void;
  setSectionColor: (id: string, color: string | undefined) => void;
  updatePersonal: (patch: Partial<CVData["personal"]>) => void;
  setSummary: (text: string) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (fromId: string, toId: string) => void;
  duplicateExperience: (id: string) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (fromId: string, toId: string) => void;
  duplicateEducation: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (fromId: string, toId: string) => void;
  duplicateProject: (id: string) => void;

  addSkill: () => void;
  updateSkill: (id: string, patch: Partial<SkillItem>) => void;
  removeSkill: (id: string) => void;
  reorderSkills: (fromId: string, toId: string) => void;

  addLanguage: () => void;
  updateLanguage: (id: string, patch: Partial<LanguageItem>) => void;
  removeLanguage: (id: string) => void;
  reorderLanguages: (fromId: string, toId: string) => void;

  addCustomSection: (title: string) => void;
  renameCustomSection: (blockId: string, title: string) => void;
  removeCustomSection: (blockId: string) => void;
  addCustomEntry: (blockId: string) => void;
  updateCustomEntry: (blockId: string, entryId: string, patch: Partial<CustomEntry>) => void;
  removeCustomEntry: (blockId: string, entryId: string) => void;
  reorderCustomEntries: (blockId: string, fromId: string, toId: string) => void;
  duplicateCustomEntry: (blockId: string, entryId: string) => void;

  reorderSections: (sections: CVSection[]) => void;
  toggleSection: (id: string) => void;

  reset: () => void;
  loadCV: (data: CVData) => void;

  newProfile: (name?: string, data?: CVData) => void;
  duplicateProfile: () => void;
  renameProfile: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;
  switchProfile: (id: string) => void;

  undo: () => void;
  redo: () => void;

  saveSnapshot: (name: string) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
  renameSnapshot: (id: string, name: string) => void;
}

// Wraps a cv-mutating update: applies it to `cv`, mirrors it into the
// active profile's stored data, and pushes the previous state onto the
// undo stack (clearing redo), so switching profiles or undoing never
// loses edits.
function withCV(
  state: Pick<CVStore, "cv" | "profiles" | "activeProfileId" | "past">,
  newCv: CVData
): Pick<CVStore, "cv" | "profiles" | "past" | "future"> {
  return {
    cv: newCv,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? { ...p, data: newCv, updatedAt: Date.now() } : p
    ),
    past: [...state.past, state.cv].slice(-HISTORY_LIMIT),
    future: [],
  };
}

const defaultProfile = makeProfile("My CV", emptyCV);

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      cv: defaultProfile.data,
      profiles: [defaultProfile],
      activeProfileId: defaultProfile.id,
      past: [],
      future: [],

      setTemplate: (id) => set((s) => withCV(s, { ...s.cv, templateId: id })),
      setAccentColor: (color) => set((s) => withCV(s, { ...s.cv, accentColor: color })),
      setDensity: (d) =>
        set((s) => withCV(s, { ...s.cv, settings: { ...s.cv.settings, density: d } })),
      setFontScale: (f) =>
        set((s) => withCV(s, { ...s.cv, settings: { ...s.cv.settings, fontScale: f } })),
      setPageSize: (p) =>
        set((s) => withCV(s, { ...s.cv, settings: { ...s.cv.settings, pageSize: p } })),
      setFontPair: (f) =>
        set((s) => withCV(s, { ...s.cv, settings: { ...s.cv.settings, fontPair: f } })),
      setPhotoPosition: (p) =>
        set((s) => withCV(s, { ...s.cv, settings: { ...s.cv.settings, photoPosition: p } })),
      setDarkMode: (d) =>
        set((s) => withCV(s, { ...s.cv, settings: { ...s.cv.settings, darkMode: d } })),
      setQR: (patch) =>
        set((s) => withCV(s, { ...s.cv, settings: { ...s.cv.settings, ...patch } })),
      setSectionColor: (id, color) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            sections: s.cv.sections.map((sec) => (sec.id === id ? { ...sec, color } : sec)),
          })
        ),
      updatePersonal: (patch) =>
        set((s) => withCV(s, { ...s.cv, personal: { ...s.cv.personal, ...patch } })),
      setSummary: (text) => set((s) => withCV(s, { ...s.cv, summary: text })),

      addExperience: () =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            experience: [
              ...s.cv.experience,
              { id: uid(), company: "", role: "", start: "", end: "", location: "", description: "" },
            ],
          })
        ),
      updateExperience: (id, patch) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            experience: s.cv.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          })
        ),
      removeExperience: (id) =>
        set((s) => withCV(s, { ...s.cv, experience: s.cv.experience.filter((e) => e.id !== id) })),
      reorderExperience: (fromId, toId) =>
        set((s) => withCV(s, { ...s.cv, experience: reorder(s.cv.experience, fromId, toId, (e) => e.id) })),
      duplicateExperience: (id) =>
        set((s) => withCV(s, { ...s.cv, experience: duplicateWithNewId(s.cv.experience, id) })),

      addEducation: () =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            education: [
              ...s.cv.education,
              { id: uid(), school: "", degree: "", start: "", end: "", description: "" },
            ],
          })
        ),
      updateEducation: (id, patch) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            education: s.cv.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          })
        ),
      removeEducation: (id) =>
        set((s) => withCV(s, { ...s.cv, education: s.cv.education.filter((e) => e.id !== id) })),
      reorderEducation: (fromId, toId) =>
        set((s) => withCV(s, { ...s.cv, education: reorder(s.cv.education, fromId, toId, (e) => e.id) })),
      duplicateEducation: (id) =>
        set((s) => withCV(s, { ...s.cv, education: duplicateWithNewId(s.cv.education, id) })),

      addProject: () =>
        set((s) =>
          withCV(s, { ...s.cv, projects: [...s.cv.projects, { id: uid(), name: "", link: "", description: "" }] })
        ),
      updateProject: (id, patch) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            projects: s.cv.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          })
        ),
      removeProject: (id) =>
        set((s) => withCV(s, { ...s.cv, projects: s.cv.projects.filter((p) => p.id !== id) })),
      reorderProjects: (fromId, toId) =>
        set((s) => withCV(s, { ...s.cv, projects: reorder(s.cv.projects, fromId, toId, (p) => p.id) })),
      duplicateProject: (id) =>
        set((s) => withCV(s, { ...s.cv, projects: duplicateWithNewId(s.cv.projects, id) })),

      addSkill: () =>
        set((s) =>
          withCV(s, { ...s.cv, skills: [...s.cv.skills, { id: uid(), name: "", level: 3, category: "" }] })
        ),
      updateSkill: (id, patch) =>
        set((s) =>
          withCV(s, { ...s.cv, skills: s.cv.skills.map((sk) => (sk.id === id ? { ...sk, ...patch } : sk)) })
        ),
      removeSkill: (id) =>
        set((s) => withCV(s, { ...s.cv, skills: s.cv.skills.filter((sk) => sk.id !== id) })),
      reorderSkills: (fromId, toId) =>
        set((s) => withCV(s, { ...s.cv, skills: reorder(s.cv.skills, fromId, toId, (sk) => sk.id) })),

      addLanguage: () =>
        set((s) =>
          withCV(s, { ...s.cv, languages: [...s.cv.languages, { id: uid(), name: "", level: "Fluent" }] })
        ),
      updateLanguage: (id, patch) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            languages: s.cv.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          })
        ),
      removeLanguage: (id) =>
        set((s) => withCV(s, { ...s.cv, languages: s.cv.languages.filter((l) => l.id !== id) })),
      reorderLanguages: (fromId, toId) =>
        set((s) => withCV(s, { ...s.cv, languages: reorder(s.cv.languages, fromId, toId, (l) => l.id) })),

      addCustomSection: (title) =>
        set((s) => {
          const blockId = uid();
          const newSections: CVSection[] = [
            ...s.cv.sections,
            { id: blockId, type: "custom", title, visible: true },
          ];
          return withCV(s, {
            ...s.cv,
            sections: newSections,
            customSections: [...s.cv.customSections, { id: blockId, title, entries: [] }],
          });
        }),
      renameCustomSection: (blockId, title) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            sections: s.cv.sections.map((sec) => (sec.id === blockId ? { ...sec, title } : sec)),
            customSections: s.cv.customSections.map((b) => (b.id === blockId ? { ...b, title } : b)),
          })
        ),
      removeCustomSection: (blockId) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            sections: s.cv.sections.filter((sec) => sec.id !== blockId),
            customSections: s.cv.customSections.filter((b) => b.id !== blockId),
          })
        ),
      addCustomEntry: (blockId) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            customSections: s.cv.customSections.map((b) =>
              b.id === blockId
                ? {
                    ...b,
                    entries: [
                      ...b.entries,
                      { id: uid(), heading: "", subheading: "", start: "", end: "", description: "" },
                    ],
                  }
                : b
            ),
          })
        ),
      updateCustomEntry: (blockId, entryId, patch) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            customSections: s.cv.customSections.map((b) =>
              b.id === blockId
                ? { ...b, entries: b.entries.map((en) => (en.id === entryId ? { ...en, ...patch } : en)) }
                : b
            ),
          })
        ),
      removeCustomEntry: (blockId, entryId) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            customSections: s.cv.customSections.map((b) =>
              b.id === blockId ? { ...b, entries: b.entries.filter((en) => en.id !== entryId) } : b
            ),
          })
        ),
      reorderCustomEntries: (blockId, fromId, toId) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            customSections: s.cv.customSections.map((b) =>
              b.id === blockId ? { ...b, entries: reorder(b.entries, fromId, toId, (en) => en.id) } : b
            ),
          })
        ),
      duplicateCustomEntry: (blockId, entryId) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            customSections: s.cv.customSections.map((b) =>
              b.id === blockId ? { ...b, entries: duplicateWithNewId(b.entries, entryId) } : b
            ),
          })
        ),

      reorderSections: (sections) => set((s) => withCV(s, { ...s.cv, sections })),
      toggleSection: (id) =>
        set((s) =>
          withCV(s, {
            ...s.cv,
            sections: s.cv.sections.map((sec) => (sec.id === id ? { ...sec, visible: !sec.visible } : sec)),
          })
        ),

      reset: () => set((s) => withCV(s, cloneCV(emptyCV))),
      loadCV: (data) => set((s) => withCV(s, data)),

      newProfile: (name, data) =>
        set((s) => {
          const profile = makeProfile(name || `CV ${s.profiles.length + 1}`, data || emptyCV);
          return {
            profiles: [...s.profiles, profile],
            activeProfileId: profile.id,
            cv: profile.data,
            past: [],
            future: [],
          };
        }),

      duplicateProfile: () =>
        set((s) => {
          const current = s.profiles.find((p) => p.id === s.activeProfileId);
          const profile = makeProfile(`${current?.name ?? "CV"} copy`, s.cv);
          return {
            profiles: [...s.profiles, profile],
            activeProfileId: profile.id,
            cv: profile.data,
            past: [],
            future: [],
          };
        }),

      renameProfile: (id, name) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, name } : p)) })),

      deleteProfile: (id) =>
        set((s) => {
          if (s.profiles.length <= 1) return s;
          const remaining = s.profiles.filter((p) => p.id !== id);
          const nextActive =
            id === s.activeProfileId ? remaining[0] : s.profiles.find((p) => p.id === s.activeProfileId)!;
          return {
            profiles: remaining,
            activeProfileId: nextActive.id,
            cv: nextActive.data,
            past: [],
            future: [],
          };
        }),

      switchProfile: (id) =>
        set((s) => {
          const target = s.profiles.find((p) => p.id === id);
          if (!target) return s;
          return { activeProfileId: id, cv: target.data, past: [], future: [] };
        }),

      undo: () =>
        set((s) => {
          if (s.past.length === 0) return s;
          const previous = s.past[s.past.length - 1];
          return {
            cv: previous,
            past: s.past.slice(0, -1),
            future: [s.cv, ...s.future].slice(0, HISTORY_LIMIT),
            profiles: s.profiles.map((p) =>
              p.id === s.activeProfileId ? { ...p, data: previous, updatedAt: Date.now() } : p
            ),
          };
        }),
      redo: () =>
        set((s) => {
          if (s.future.length === 0) return s;
          const next = s.future[0];
          return {
            cv: next,
            past: [...s.past, s.cv].slice(-HISTORY_LIMIT),
            future: s.future.slice(1),
            profiles: s.profiles.map((p) =>
              p.id === s.activeProfileId ? { ...p, data: next, updatedAt: Date.now() } : p
            ),
          };
        }),

      saveSnapshot: (name) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === s.activeProfileId
              ? {
                  ...p,
                  snapshots: [
                    ...p.snapshots,
                    { id: uid(), name, data: cloneCV(s.cv), createdAt: Date.now() },
                  ],
                }
              : p
          ),
        })),
      restoreSnapshot: (id) =>
        set((s) => {
          const profile = s.profiles.find((p) => p.id === s.activeProfileId);
          const snapshot = profile?.snapshots.find((sn) => sn.id === id);
          if (!snapshot) return s;
          return withCV(s, cloneCV(snapshot.data));
        }),
      deleteSnapshot: (id) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === s.activeProfileId ? { ...p, snapshots: p.snapshots.filter((sn) => sn.id !== id) } : p
          ),
        })),
      renameSnapshot: (id, name) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === s.activeProfileId
              ? { ...p, snapshots: p.snapshots.map((sn) => (sn.id === id ? { ...sn, name } : sn)) }
              : p
          ),
        })),
    }),
    {
      name: "cv-builder-storage",
      version: 2,
      partialize: (s) => ({ cv: s.cv, profiles: s.profiles, activeProfileId: s.activeProfileId }),
      // v1 profiles predate the `snapshots` field — backfill it so older
      // localStorage data doesn't crash on first load after an update.
      migrate: (persisted) => {
        const state = persisted as { profiles?: CVProfile[]; cv?: CVData };
        if (state?.profiles) {
          state.profiles = state.profiles.map((p) => ({ ...p, snapshots: p.snapshots ?? [] }));
        }
        return state;
      },
    }
  )
);

export function getActiveProfileName() {
  const s = useCVStore.getState();
  return s.profiles.find((p) => p.id === s.activeProfileId)?.name ?? "My CV";
}
