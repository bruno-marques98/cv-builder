"use client";

import { useState, useMemo, useEffect } from "react";
import { useCVStore } from "@/lib/store";
import { Field, Card, AddButton } from "./fields";
import { SectionList } from "./SectionList";
import { PhotoUpload } from "./PhotoUpload";
import { SortableEntryList } from "./SortableEntryList";
import { useT } from "@/lib/i18n";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3" data-editor-group>
      <h3 className="text-[13px] font-semibold text-[#1B2430] scroll-mt-4">{title}</h3>
      {children}
    </div>
  );
}

const SUMMARY_SOFT_LIMIT = 480; // roughly 3-4 lines at typical CV point sizes

export function Editor() {
  const t = useT();
  const cv = useCVStore((s) => s.cv);
  const updatePersonal = useCVStore((s) => s.updatePersonal);
  const setSummary = useCVStore((s) => s.setSummary);

  // Alt+ArrowDown / Alt+ArrowUp jump between editor sections (Personal
  // details, Experience, Education, ...) without needing to scroll manually.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.altKey || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
      const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-editor-group]"));
      if (groups.length === 0) return;
      e.preventDefault();
      const scrollTop = groups[0].closest(".overflow-y-auto")?.scrollTop ?? window.scrollY;
      const positions = groups.map((g) => g.offsetTop);
      let idx = positions.findIndex((p) => p > scrollTop + 8);
      if (idx === -1) idx = groups.length - 1;
      if (e.key === "ArrowUp") idx = Math.max(0, idx - 2);
      groups[Math.max(0, Math.min(idx, groups.length - 1))].scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const addExperience = useCVStore((s) => s.addExperience);
  const updateExperience = useCVStore((s) => s.updateExperience);
  const removeExperience = useCVStore((s) => s.removeExperience);
  const reorderExperience = useCVStore((s) => s.reorderExperience);
  const duplicateExperience = useCVStore((s) => s.duplicateExperience);

  const addEducation = useCVStore((s) => s.addEducation);
  const updateEducation = useCVStore((s) => s.updateEducation);
  const removeEducation = useCVStore((s) => s.removeEducation);
  const reorderEducation = useCVStore((s) => s.reorderEducation);
  const duplicateEducation = useCVStore((s) => s.duplicateEducation);

  const addProject = useCVStore((s) => s.addProject);
  const updateProject = useCVStore((s) => s.updateProject);
  const removeProject = useCVStore((s) => s.removeProject);
  const reorderProjects = useCVStore((s) => s.reorderProjects);
  const duplicateProject = useCVStore((s) => s.duplicateProject);

  const addSkill = useCVStore((s) => s.addSkill);
  const updateSkill = useCVStore((s) => s.updateSkill);
  const removeSkill = useCVStore((s) => s.removeSkill);
  const reorderSkills = useCVStore((s) => s.reorderSkills);

  const addLanguage = useCVStore((s) => s.addLanguage);
  const updateLanguage = useCVStore((s) => s.updateLanguage);
  const removeLanguage = useCVStore((s) => s.removeLanguage);
  const reorderLanguages = useCVStore((s) => s.reorderLanguages);

  const customSections = useCVStore((s) => s.cv.customSections);
  const addCustomSection = useCVStore((s) => s.addCustomSection);
  const renameCustomSection = useCVStore((s) => s.renameCustomSection);
  const removeCustomSection = useCVStore((s) => s.removeCustomSection);
  const addCustomEntry = useCVStore((s) => s.addCustomEntry);
  const updateCustomEntry = useCVStore((s) => s.updateCustomEntry);
  const removeCustomEntry = useCVStore((s) => s.removeCustomEntry);
  const reorderCustomEntries = useCVStore((s) => s.reorderCustomEntries);
  const duplicateCustomEntry = useCVStore((s) => s.duplicateCustomEntry);
  const [newSectionName, setNewSectionName] = useState("");

  // Flags companies that appear more than once in Experience, in case it's
  // an accidental duplicate entry rather than two separate stints.
  const duplicateCompanies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of cv.experience) {
      const key = e.company.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  }, [cv.experience]);

  return (
    <div className="flex flex-col gap-8 pb-24">
      <Group title={t("sectionOrder")}>
        <p className="text-[11px] text-[#9CA3AF] -mt-1">{t("sectionOrderHint")}</p>
        <SectionList />
      </Group>

      <Group title={t("personalDetails")}>
        <PhotoUpload />
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t("fullName")} value={cv.personal.fullName} onChange={(v) => updatePersonal({ fullName: v })} />
          <Field label={t("roleTitle")} value={cv.personal.role} onChange={(v) => updatePersonal({ role: v })} />
          <Field label={t("email_field")} value={cv.personal.email} onChange={(v) => updatePersonal({ email: v })} />
          <Field label={t("phone")} value={cv.personal.phone} onChange={(v) => updatePersonal({ phone: v })} />
          <Field label={t("location")} value={cv.personal.location} onChange={(v) => updatePersonal({ location: v })} />
          <Field label={t("website")} value={cv.personal.website} onChange={(v) => updatePersonal({ website: v })} />
        </div>
      </Group>

      <Group title={t("summary")}>
        <Field label="" value={cv.summary} onChange={setSummary} textarea placeholder={t("summaryPlaceholder")} />
        <p className={`text-[10px] -mt-1 ${cv.summary.length > SUMMARY_SOFT_LIMIT ? "text-[#B45247]" : "text-[#9CA3AF]"}`}>
          {cv.summary.length} {t("charactersLabel")}
          {cv.summary.length > SUMMARY_SOFT_LIMIT ? ` — ${t("summaryTooLong")}` : ""}
        </p>
      </Group>

      <Group title={t("experience")}>
        <SortableEntryList
          items={cv.experience}
          onReorder={reorderExperience}
          renderItem={(e) => (
            <Card onRemove={() => removeExperience(e.id)} onDuplicate={() => duplicateExperience(e.id)}>
              {duplicateCompanies.has(e.company.trim().toLowerCase()) && (
                <p className="text-[10px] text-[#8A6D3B] bg-[#8A6D3B1A] rounded px-2 py-1">
                  {t("duplicateCompanyWarning")}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <Field label={t("role")} value={e.role} onChange={(v) => updateExperience(e.id, { role: v })} />
                <Field label={t("company")} value={e.company} onChange={(v) => updateExperience(e.id, { company: v })} />
                <Field label={t("start")} value={e.start} onChange={(v) => updateExperience(e.id, { start: v })} placeholder="Jan 2022" />
                <Field label={t("end")} value={e.end} onChange={(v) => updateExperience(e.id, { end: v })} placeholder="Present" />
                <Field label={t("location")} value={e.location} onChange={(v) => updateExperience(e.id, { location: v })} />
              </div>
              <Field label={t("description")} value={e.description} onChange={(v) => updateExperience(e.id, { description: v })} textarea />
            </Card>
          )}
        />
        <AddButton onClick={addExperience} label={t("addExperience").replace("+ ", "")} />
      </Group>

      <Group title={t("education")}>
        <SortableEntryList
          items={cv.education}
          onReorder={reorderEducation}
          renderItem={(e) => (
            <Card onRemove={() => removeEducation(e.id)} onDuplicate={() => duplicateEducation(e.id)}>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label={t("degree")} value={e.degree} onChange={(v) => updateEducation(e.id, { degree: v })} />
                <Field label={t("school")} value={e.school} onChange={(v) => updateEducation(e.id, { school: v })} />
                <Field label={t("start")} value={e.start} onChange={(v) => updateEducation(e.id, { start: v })} />
                <Field label={t("end")} value={e.end} onChange={(v) => updateEducation(e.id, { end: v })} />
              </div>
              <Field label={t("description")} value={e.description} onChange={(v) => updateEducation(e.id, { description: v })} textarea />
            </Card>
          )}
        />
        <AddButton onClick={addEducation} label={t("addEducation").replace("+ ", "")} />
      </Group>

      <Group title={t("skills")}>
        <SortableEntryList
          items={cv.skills}
          onReorder={reorderSkills}
          renderItem={(s) => (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                className="flex-1 min-w-[110px] rounded-md border border-[#E4E0D8] px-2.5 py-1.5 text-sm outline-none focus:border-[#3F7368]"
                value={s.name}
                placeholder={t("skills")}
                onChange={(e) => updateSkill(s.id, { name: e.target.value })}
              />
              <input
                className="w-24 min-w-0 rounded-md border border-[#E4E0D8] px-2.5 py-1.5 text-sm outline-none focus:border-[#3F7368]"
                value={s.category}
                placeholder={t("category")}
                onChange={(e) => updateSkill(s.id, { category: e.target.value })}
              />
              <input
                type="range"
                className="w-16 shrink-0"
                min={1}
                max={5}
                value={s.level}
                onChange={(e) => updateSkill(s.id, { level: Number(e.target.value) })}
              />
              <button onClick={() => removeSkill(s.id)} className="shrink-0 text-[#9CA3AF] hover:text-[#B45247] text-xs">
                {t("remove")}
              </button>
            </div>
          )}
        />
        <p className="text-[10px] text-[#9CA3AF] -mt-1">{t("skillCategoryHint")}</p>
        <AddButton onClick={addSkill} label={t("addSkill").replace("+ ", "")} />
      </Group>

      <Group title={t("projects")}>
        <SortableEntryList
          items={cv.projects}
          onReorder={reorderProjects}
          renderItem={(p) => (
            <Card onRemove={() => removeProject(p.id)} onDuplicate={() => duplicateProject(p.id)}>
              <Field label={t("name")} value={p.name} onChange={(v) => updateProject(p.id, { name: v })} />
              <Field label={t("link")} value={p.link} onChange={(v) => updateProject(p.id, { link: v })} />
              <Field label={t("description")} value={p.description} onChange={(v) => updateProject(p.id, { description: v })} textarea />
            </Card>
          )}
        />
        <AddButton onClick={addProject} label={t("addProject").replace("+ ", "")} />
      </Group>

      <Group title={t("languages")}>
        <SortableEntryList
          items={cv.languages}
          onReorder={reorderLanguages}
          renderItem={(l) => (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-md border border-[#E4E0D8] px-2.5 py-1.5 text-sm outline-none focus:border-[#3F7368]"
                value={l.name}
                placeholder={t("language")}
                onChange={(e) => updateLanguage(l.id, { name: e.target.value })}
              />
              <input
                className="w-28 rounded-md border border-[#E4E0D8] px-2.5 py-1.5 text-sm outline-none focus:border-[#3F7368]"
                value={l.level}
                placeholder={t("fluency")}
                onChange={(e) => updateLanguage(l.id, { level: e.target.value })}
              />
              <button onClick={() => removeLanguage(l.id)} className="text-[#9CA3AF] hover:text-[#B45247] text-xs">
                {t("remove")}
              </button>
            </div>
          )}
        />
        <AddButton onClick={addLanguage} label={t("addLanguage").replace("+ ", "")} />
      </Group>

      <Group title={t("customSections")}>
        <p className="text-[11px] text-[#9CA3AF] -mt-1">{t("customSectionsHint")}</p>
        {customSections.map((block) => (
          <div key={block.id} className="flex flex-col gap-2 rounded-lg border border-[#E4E0D8] p-3">
            <div className="flex items-center gap-2">
              <input
                value={block.title}
                onChange={(e) => renameCustomSection(block.id, e.target.value)}
                className="flex-1 text-[13px] font-semibold text-[#1B2430] border-b border-transparent hover:border-[#E4E0D8] focus:border-[#3F7368] outline-none px-0.5"
              />
              <button
                onClick={() => {
                  if (confirm(`Remove section "${block.title}"?`)) removeCustomSection(block.id);
                }}
                className="text-[11px] text-[#B45247] hover:underline"
              >
                {t("removeSection")}
              </button>
            </div>
            <SortableEntryList
              items={block.entries}
              onReorder={(fromId, toId) => reorderCustomEntries(block.id, fromId, toId)}
              renderItem={(en) => (
                <Card
                  onRemove={() => removeCustomEntry(block.id, en.id)}
                  onDuplicate={() => duplicateCustomEntry(block.id, en.id)}
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label={t("entryTitle")}
                      value={en.heading}
                      onChange={(v) => updateCustomEntry(block.id, en.id, { heading: v })}
                      placeholder="e.g. AWS Certified Solutions Architect"
                    />
                    <Field
                      label={t("entrySubtitle")}
                      value={en.subheading}
                      onChange={(v) => updateCustomEntry(block.id, en.id, { subheading: v })}
                      placeholder="e.g. Amazon Web Services"
                    />
                    <Field label={t("start")} value={en.start} onChange={(v) => updateCustomEntry(block.id, en.id, { start: v })} />
                    <Field label={t("end")} value={en.end} onChange={(v) => updateCustomEntry(block.id, en.id, { end: v })} />
                  </div>
                  <Field
                    label={t("description")}
                    value={en.description}
                    onChange={(v) => updateCustomEntry(block.id, en.id, { description: v })}
                    textarea
                  />
                </Card>
              )}
            />
            <AddButton onClick={() => addCustomEntry(block.id)} label={t("addEntry").replace("+ ", "")} />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder={t("newSectionPlaceholder")}
            className="flex-1 rounded-md border border-[#E4E0D8] px-2.5 py-1.5 text-sm outline-none focus:border-[#3F7368]"
          />
          <button
            onClick={() => {
              const name = newSectionName.trim();
              if (!name) return;
              addCustomSection(name);
              setNewSectionName("");
            }}
            className="text-sm text-white bg-[#1B2430] px-3 py-1.5 rounded-md font-medium"
          >
            {t("add")}
          </button>
        </div>
      </Group>
    </div>
  );
}
