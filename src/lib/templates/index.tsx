import { ReactElement, CSSProperties } from "react";
import { CVData, CustomSectionBlock } from "../types";
import { QRCodeImg } from "@/components/QRCodeImg";
import { parseInline } from "../richText";

function visible(cv: CVData, type: string) {
  return cv.sections.find((s) => s.type === type)?.visible;
}

function orderedSections(cv: CVData) {
  return cv.sections.filter((s) => s.visible);
}

function customBlockFor(cv: CVData, sectionId: string) {
  return cv.customSections.find((b) => b.id === sectionId);
}

// Groups skills by their optional category, preserving first-appearance
// order. Skills with no category land in a single group with title "".
function groupedSkills(cv: CVData) {
  const groups: { title: string; skills: CVData["skills"] }[] = [];
  for (const skill of cv.skills) {
    const title = skill.category?.trim() ?? "";
    let group = groups.find((g) => g.title === title);
    if (!group) {
      group = { title, skills: [] };
      groups.push(group);
    }
    group.skills.push(skill);
  }
  return groups;
}

// Renders a user-defined custom section (certifications, awards, etc.)
// using the same entry shape across all templates.
function CustomBlock({
  block,
  headingClass,
  headingStyle,
  itemGap = "gap-2",
}: {
  block: CustomSectionBlock;
  headingClass: string;
  headingStyle?: CSSProperties;
  itemGap?: string;
}) {
  if (block.entries.length === 0) return null;
  return (
    <div>
      <h2 className={headingClass} style={headingStyle}>
        {block.title}
      </h2>
      <div className={`flex flex-col ${itemGap}`}>
        {block.entries.map((en) => (
          <div key={en.id}>
            <div className="flex justify-between text-[10px] font-medium">
              <span>
                {en.heading}
                {en.subheading ? ` · ${en.subheading}` : ""}
              </span>
              {(en.start || en.end) && (
                <span className="text-[9px] opacity-60 shrink-0 ml-2">
                  {en.start} {en.end ? `— ${en.end}` : ""}
                </span>
              )}
            </div>
            <Bullets text={en.description} className="text-[9px] text-[#3a3a3a] mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomEntries({ entries, className }: { entries: CustomSectionBlock["entries"]; className?: string }) {
  return (
    <>
      {entries.map((en) => (
        <div key={en.id}>
          <div className={`flex justify-between font-medium ${className ?? ""}`}>
            <span>
              {en.heading}
              {en.subheading ? ` · ${en.subheading}` : ""}
            </span>
            {(en.start || en.end) && (
              <span className="text-[9px] opacity-60 shrink-0 ml-2">
                {en.start} {en.end ? `— ${en.end}` : ""}
              </span>
            )}
          </div>
          <Bullets text={en.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
        </div>
      ))}
    </>
  );
}

const levelLabel = (n: number) => "●".repeat(n) + "○".repeat(5 - n);

// Renders inline **bold** / *italic* markup as React nodes.
function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) => {
        if (seg.bold) return <strong key={i}>{seg.text}</strong>;
        if (seg.italic) return <em key={i}>{seg.text}</em>;
        return <span key={i}>{seg.text}</span>;
      })}
    </>
  );
}

// Renders a description as bullet points when it has multiple lines,
// otherwise as a plain paragraph. Supports **bold** / *italic* inline.
function Bullets({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  if (lines.length === 1) return <p className={className}><InlineText text={lines[0]} /></p>;
  return (
    <ul className={`${className ?? ""} list-disc pl-3.5 flex flex-col gap-0.5`}>
      {lines.map((l, i) => (
        <li key={i}><InlineText text={l} /></li>
      ))}
    </ul>
  );
}

// Density-aware spacing tokens, used by each template's outer containers.
function densityTokens(cv: CVData) {
  const compact = cv.settings?.density === "compact";
  return {
    pad: compact ? "p-5" : "p-8",
    padAside: compact ? "p-5" : "p-6",
    gapLg: compact ? "gap-3" : "gap-5",
    gapMd: compact ? "gap-2" : "gap-3",
    gapSm: compact ? "gap-1" : "gap-2",
  };
}

/* ---------------- MODERN: sidebar + main column ---------------- */
export function ModernTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  return (
    <div className="flex h-full w-full bg-white text-[#1B2430] text-[10.5px] leading-snug">
      <aside
        className={`w-[34%] shrink-0 ${t.padAside} text-white flex flex-col ${t.gapLg}`}
        style={{ backgroundColor: "#1B2430" }}
      >
        {cv.personal.photo && (
          <div
            className="h-24 w-24 rounded-full bg-cover bg-center border-2"
            style={{ backgroundImage: `url(${cv.personal.photo})`, borderColor: accent }}
          />
        )}
        <div>
          <h1 className="text-xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {cv.personal.fullName}
          </h1>
          <p className="mt-1 text-[11px] opacity-80">{cv.personal.role}</p>
        </div>
        <div className="flex flex-col gap-1.5 text-[9.5px] opacity-90">
          {cv.personal.email && <div>{cv.personal.email}</div>}
          {cv.personal.phone && <div>{cv.personal.phone}</div>}
          {cv.personal.location && <div>{cv.personal.location}</div>}
          {cv.personal.website && <div>{cv.personal.website}</div>}
        </div>
        {cv.settings.qrEnabled && cv.settings.qrTarget && (
          <div className="bg-white p-1.5 rounded w-fit">
            <QRCodeImg value={cv.settings.qrTarget} size={56} fgColor="#1B2430" />
          </div>
        )}
        {visible(cv, "skills") && cv.skills.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold tracking-wide mb-2" style={{ color: accent }}>
              Skills
            </h2>
            <div className="flex flex-col gap-2">
              {groupedSkills(cv).map((g) => (
                <div key={g.title || "_"} className="flex flex-col gap-1.5">
                  {g.title && <span className="text-[9px] font-semibold opacity-60">{g.title}</span>}
                  {g.skills.map((s) => (
                    <div key={s.id} className="flex justify-between text-[9.5px]">
                      <span>{s.name}</span>
                      <span className="opacity-70">{levelLabel(s.level)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {visible(cv, "languages") && cv.languages.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold tracking-wide mb-2" style={{ color: accent }}>
              Languages
            </h2>
            <div className="flex flex-col gap-1 text-[9.5px]">
              {cv.languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span>{l.name}</span>
                  <span className="opacity-70">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
      <main className={`flex-1 ${t.padAside} flex flex-col ${t.gapLg}`}>
        {orderedSections(cv)
          .filter((s) => !["skills", "languages"].includes(s.type))
          .map((section) => {
            if (section.type === "summary" && cv.summary)
              return (
                <div key={section.id}>
                  <h2 className="text-[11px] font-semibold tracking-wide mb-1.5" style={{ color: section.color ?? accent }}>
                    {section.title}
                  </h2>
                  <p className="text-[10px] text-[#3a3a3a]">{cv.summary}</p>
                </div>
              );
            if (section.type === "experience" && cv.experience.length > 0)
              return (
                <div key={section.id}>
                  <h2 className="text-[11px] font-semibold tracking-wide mb-2" style={{ color: section.color ?? accent }}>
                    {section.title}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {cv.experience.map((e) => (
                      <div key={e.id}>
                        <div className="flex justify-between text-[10.5px] font-medium">
                          <span>{e.role} · {e.company}</span>
                          <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                        </div>
                        {e.location && <div className="text-[9px] opacity-60">{e.location}</div>}
                        <Bullets text={e.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            if (section.type === "education" && cv.education.length > 0)
              return (
                <div key={section.id}>
                  <h2 className="text-[11px] font-semibold tracking-wide mb-2" style={{ color: section.color ?? accent }}>
                    {section.title}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {cv.education.map((e) => (
                      <div key={e.id}>
                        <div className="flex justify-between text-[10.5px] font-medium">
                          <span>{e.degree} · {e.school}</span>
                          <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                        </div>
                        <Bullets text={e.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            if (section.type === "projects" && cv.projects.length > 0)
              return (
                <div key={section.id}>
                  <h2 className="text-[11px] font-semibold tracking-wide mb-2" style={{ color: section.color ?? accent }}>
                    {section.title}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {cv.projects.map((p) => (
                      <div key={p.id}>
                        <div className="text-[10.5px] font-medium">{p.name}</div>
                        <Bullets text={p.description} className="text-[9.5px] text-[#3a3a3a]" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            if (section.type === "custom") {
              const block = customBlockFor(cv, section.id);
              if (!block) return null;
              return (
                <CustomBlock
                  key={section.id}
                  block={block}
                  headingClass="text-[11px] font-semibold tracking-wide mb-2"
                  headingStyle={{ color: section.color ?? accent }}
                />
              );
            }
            return null;
          })}
      </main>
    </div>
  );
}

/* ---------------- CLASSIC: single column, serif, rule lines ---------------- */
export function ClassicTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  return (
    <div className={`h-full w-full bg-white text-[#1B2430] ${t.pad} text-[10.5px] leading-snug`}>
      <div className="text-center border-b pb-4 mb-4" style={{ borderColor: accent }}>
        {cv.personal.photo && (
          <div
            className="h-20 w-20 rounded-full bg-cover bg-center mx-auto mb-2 border-2"
            style={{ backgroundImage: `url(${cv.personal.photo})`, borderColor: accent }}
          />
        )}
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          {cv.personal.fullName}
        </h1>
        <p className="text-[11px] opacity-70 mt-0.5">{cv.personal.role}</p>
        <div className="flex justify-center gap-3 text-[9px] opacity-60 mt-1.5 flex-wrap">
          {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
            .filter(Boolean)
            .map((v, i) => (
              <span key={i}>{v}</span>
            ))}
        </div>
      </div>
      <div className={`flex flex-col ${t.gapLg}`}>
        {orderedSections(cv).map((section) => {
          const sectionColor = section.color ?? accent;
          const heading = (
            <h2
              className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-1.5 pb-1 border-b"
              style={{ color: sectionColor, borderColor: "#E4E0D8" }}
            >
              {section.title}
            </h2>
          );
          if (section.type === "summary" && cv.summary)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a]">{cv.summary}</p>
              </div>
            );
          if (section.type === "experience" && cv.experience.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2.5">
                  {cv.experience.map((e) => (
                    <div key={e.id}>
                      <div className="flex justify-between font-medium">
                        <span>{e.role}, {e.company}</span>
                        <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                      </div>
                      <Bullets text={e.description} className="text-[#3a3a3a] text-[9.5px] mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "education" && cv.education.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.education.map((e) => (
                    <div key={e.id} className="flex justify-between">
                      <span className="font-medium">{e.degree}, {e.school}</span>
                      <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "skills" && cv.skills.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1">
                  {groupedSkills(cv).map((g) => (
                    <p key={g.title || "_"} className="text-[#3a3a3a]">
                      {g.title && <span className="font-medium">{g.title}: </span>}
                      {g.skills.map((s) => s.name).join("  ·  ")}
                    </p>
                  ))}
                </div>
              </div>
            );
          if (section.type === "languages" && cv.languages.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a]">
                  {cv.languages.map((l) => `${l.name} (${l.level})`).join("  ·  ")}
                </p>
              </div>
            );
          if (section.type === "projects" && cv.projects.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.projects.map((p) => (
                    <div key={p.id}>
                      <span className="font-medium">{p.name}</span>
                      <Bullets text={p.description} className="text-[#3a3a3a] text-[9.5px]" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "custom") {
            const block = customBlockFor(cv, section.id);
            if (!block || block.entries.length === 0) return null;
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2.5">
                  <CustomEntries entries={block.entries} />
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ---------------- MINIMAL: quiet, lots of whitespace ---------------- */
export function MinimalTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  return (
    <div className={`h-full w-full bg-white text-[#1B2430] ${t.pad} text-[10.5px] leading-relaxed`}>
      <div className={`flex items-center gap-4${cv.settings.photoPosition === "right" ? " flex-row-reverse text-right" : ""}`}>
        {cv.personal.photo && (
          <div
            className="h-16 w-16 rounded-full bg-cover bg-center shrink-0"
            style={{ backgroundImage: `url(${cv.personal.photo})` }}
          />
        )}
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {cv.personal.fullName}
          </h1>
        </div>
      </div>
      <p className="text-[11px] opacity-70">{cv.personal.role}</p>
      <div className="flex gap-3 text-[9px] opacity-50 mt-1 flex-wrap">
        {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
          .filter(Boolean)
          .map((v, i) => (
            <span key={i}>{v}</span>
          ))}
      </div>
      <div className="flex flex-col gap-5 mt-6">
        {orderedSections(cv).map((section) => {
          const sectionColor = section.color ?? accent;
          const heading = (
            <h2 className="text-[9.5px] font-medium mb-2" style={{ color: sectionColor }}>
              {section.title}
            </h2>
          );
          if (section.type === "summary" && cv.summary)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a] max-w-[90%]">{cv.summary}</p>
              </div>
            );
          if (section.type === "experience" && cv.experience.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-3">
                  {cv.experience.map((e) => (
                    <div key={e.id}>
                      <div className="flex gap-2 items-baseline">
                        <span className="font-medium">{e.role}</span>
                        <span className="opacity-50 text-[9px]">{e.company}</span>
                        <span className="opacity-40 text-[9px] ml-auto">{e.start} — {e.end}</span>
                      </div>
                      <Bullets text={e.description} className="text-[#3a3a3a] text-[9.5px] mt-0.5 max-w-[90%]" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "education" && cv.education.length > 0)
            return (
              <div key={section.id}>
                {heading}
                {cv.education.map((e) => (
                  <div key={e.id} className="flex gap-2 items-baseline">
                    <span className="font-medium">{e.degree}</span>
                    <span className="opacity-50 text-[9px]">{e.school}</span>
                    <span className="opacity-40 text-[9px] ml-auto">{e.start} — {e.end}</span>
                  </div>
                ))}
              </div>
            );
          if (section.type === "skills" && cv.skills.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1">
                  {groupedSkills(cv).map((g) => (
                    <p key={g.title || "_"} className="text-[#3a3a3a]">
                      {g.title && <span className="font-medium">{g.title}: </span>}
                      {g.skills.map((s) => s.name).join(", ")}
                    </p>
                  ))}
                </div>
              </div>
            );
          if (section.type === "languages" && cv.languages.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a]">{cv.languages.map((l) => l.name).join(", ")}</p>
              </div>
            );
          if (section.type === "projects" && cv.projects.length > 0)
            return (
              <div key={section.id}>
                {heading}
                {cv.projects.map((p) => (
                  <div key={p.id}>
                    <span className="font-medium">{p.name}</span>
                    <Bullets text={p.description} className="text-[#3a3a3a] text-[9.5px]" />
                  </div>
                ))}
              </div>
            );
          if (section.type === "custom") {
            const block = customBlockFor(cv, section.id);
            if (!block || block.entries.length === 0) return null;
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-3">
                  <CustomEntries entries={block.entries} />
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ---------------- TIMELINE: vertical line, date-forward ---------------- */
export function TimelineTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  return (
    <div className={`h-full w-full bg-white text-[#1B2430] ${t.pad} text-[10.5px] leading-snug`}>
      <div className={`flex items-center gap-4${cv.settings.photoPosition === "right" ? " flex-row-reverse text-right" : ""} mb-5`}>
        {cv.personal.photo && (
          <div
            className="h-16 w-16 rounded-full bg-cover bg-center shrink-0 border-2"
            style={{ backgroundImage: `url(${cv.personal.photo})`, borderColor: accent }}
          />
        )}
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {cv.personal.fullName}
          </h1>
          <p className="text-[11px]" style={{ color: accent }}>
            {cv.personal.role}
          </p>
        </div>
      </div>
      <div className="flex gap-3 text-[9px] opacity-60 mb-5 flex-wrap">
        {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
          .filter(Boolean)
          .map((v, i) => (
            <span key={i}>{v}</span>
          ))}
      </div>
      <div className={`flex flex-col ${t.gapLg}`}>
        {orderedSections(cv).map((section) => {
          const sectionColor = section.color ?? accent;
          const heading = (
            <h2 className="text-[11px] font-semibold tracking-wide mb-2" style={{ color: sectionColor }}>
              {section.title}
            </h2>
          );
          if (section.type === "summary" && cv.summary)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a]">{cv.summary}</p>
              </div>
            );
          if (section.type === "experience" && cv.experience.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="relative flex flex-col gap-3 pl-4 border-l-2" style={{ borderColor: "#E4E0D8" }}>
                  {cv.experience.map((e) => (
                    <div key={e.id} className="relative">
                      <span
                        className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: sectionColor }}
                      />
                      <div className="text-[9px] opacity-60">{e.start} — {e.end}</div>
                      <div className="text-[10.5px] font-medium">{e.role} · {e.company}</div>
                      <Bullets text={e.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "education" && cv.education.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="relative flex flex-col gap-2 pl-4 border-l-2" style={{ borderColor: "#E4E0D8" }}>
                  {cv.education.map((e) => (
                    <div key={e.id} className="relative">
                      <span
                        className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      <div className="text-[9px] opacity-60">{e.start} — {e.end}</div>
                      <div className="text-[10.5px] font-medium">{e.degree} · {e.school}</div>
                      <Bullets text={e.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "skills" && cv.skills.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1.5">
                  {groupedSkills(cv).map((g) => (
                    <div key={g.title || "_"} className="flex flex-wrap items-center gap-1.5">
                      {g.title && <span className="text-[9px] font-medium opacity-70 mr-1">{g.title}</span>}
                      {g.skills.map((s) => (
                        <span
                          key={s.id}
                          className="text-[9px] px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${accent}1A`, color: accent }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "languages" && cv.languages.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a]">{cv.languages.map((l) => `${l.name} (${l.level})`).join("  ·  ")}</p>
              </div>
            );
          if (section.type === "projects" && cv.projects.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.projects.map((p) => (
                    <div key={p.id}>
                      <div className="text-[10.5px] font-medium">{p.name}</div>
                      <Bullets text={p.description} className="text-[9.5px] text-[#3a3a3a]" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "custom") {
            const block = customBlockFor(cv, section.id);
            if (!block || block.entries.length === 0) return null;
            return (
              <div key={section.id}>
                {heading}
                <div className="relative flex flex-col gap-2 pl-4 border-l-2" style={{ borderColor: "#E4E0D8" }}>
                  {block.entries.map((en) => (
                    <div key={en.id} className="relative">
                      <span
                        className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      {(en.start || en.end) && (
                        <div className="text-[9px] opacity-60">
                          {en.start} {en.end ? `— ${en.end}` : ""}
                        </div>
                      )}
                      <div className="text-[10.5px] font-medium">
                        {en.heading}
                        {en.subheading ? ` · ${en.subheading}` : ""}
                      </div>
                      <Bullets text={en.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ---------------- COMPACT: dense, plain, ATS-friendly (no color, no graphics) ---------------- */
export function CompactTemplate({ cv }: { cv: CVData }) {
  const t = densityTokens(cv);
  return (
    <div className={`h-full w-full bg-white text-black ${t.pad} text-[10px] leading-snug`}>
      <div className="mb-3">
        <h1 className="text-[16px] font-bold">{cv.personal.fullName}</h1>
        <p className="text-[10.5px]">{cv.personal.role}</p>
        <p className="text-[9px] mt-0.5">
          {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>
      <div className={`flex flex-col ${t.gapMd}`}>
        {orderedSections(cv).map((section) => {
          const heading = (
            <h2 className="text-[10px] font-bold border-b border-black pb-0.5 mb-1">{section.title}</h2>
          );
          if (section.type === "summary" && cv.summary)
            return (
              <div key={section.id}>
                {heading}
                <p>{cv.summary}</p>
              </div>
            );
          if (section.type === "experience" && cv.experience.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1.5">
                  {cv.experience.map((e) => (
                    <div key={e.id}>
                      <div className="flex justify-between font-semibold">
                        <span>{e.role} — {e.company}</span>
                        <span>{e.start} - {e.end}</span>
                      </div>
                      <Bullets text={e.description} />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "education" && cv.education.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1">
                  {cv.education.map((e) => (
                    <div key={e.id} className="flex justify-between">
                      <span className="font-semibold">{e.degree}, {e.school}</span>
                      <span>{e.start} - {e.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "skills" && cv.skills.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-0.5">
                  {groupedSkills(cv).map((g) => (
                    <p key={g.title || "_"}>
                      {g.title && <span className="font-semibold">{g.title}: </span>}
                      {g.skills.map((s) => s.name).join(", ")}
                    </p>
                  ))}
                </div>
              </div>
            );
          if (section.type === "languages" && cv.languages.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <p>{cv.languages.map((l) => `${l.name} (${l.level})`).join(", ")}</p>
              </div>
            );
          if (section.type === "projects" && cv.projects.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1">
                  {cv.projects.map((p) => (
                    <div key={p.id}>
                      <span className="font-semibold">{p.name}</span>
                      <Bullets text={p.description} />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "custom") {
            const block = customBlockFor(cv, section.id);
            if (!block || block.entries.length === 0) return null;
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1">
                  {block.entries.map((en) => (
                    <div key={en.id}>
                      <div className="flex justify-between font-semibold">
                        <span>
                          {en.heading}
                          {en.subheading ? ` — ${en.subheading}` : ""}
                        </span>
                        <span>
                          {en.start} {en.end ? `- ${en.end}` : ""}
                        </span>
                      </div>
                      <Bullets text={en.description} />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ---------------- BOLD: full-width color header band ---------------- */
export function BoldTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  const initials = cv.personal.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="h-full w-full bg-white text-[#1B2430] text-[10.5px] leading-snug">
      <div className={`flex items-center gap-4 ${t.padAside}`} style={{ backgroundColor: accent }}>
        {cv.personal.photo ? (
          <div
            className="h-16 w-16 rounded-full bg-cover bg-center shrink-0 border-2 border-white"
            style={{ backgroundImage: `url(${cv.personal.photo})` }}
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white text-lg font-semibold">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            {cv.personal.fullName}
          </h1>
          <p className="text-[11px] text-white/85">{cv.personal.role}</p>
          <div className="flex gap-3 text-[9px] text-white/75 mt-1 flex-wrap">
            {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
              .filter(Boolean)
              .map((v, i) => (
                <span key={i}>{v}</span>
              ))}
          </div>
        </div>
        {cv.settings.qrEnabled && cv.settings.qrTarget && (
          <div className="ml-auto bg-white p-1.5 rounded shrink-0">
            <QRCodeImg value={cv.settings.qrTarget} size={48} fgColor="#1B2430" />
          </div>
        )}
      </div>
      <div className={`${t.padAside} flex flex-col ${t.gapLg}`}>
        {orderedSections(cv).map((section) => {
          const sectionColor = section.color ?? accent;
          const heading = (
            <h2
              className="text-[11px] font-semibold tracking-wide mb-2 pb-1 border-b-2"
              style={{ color: sectionColor, borderColor: sectionColor }}
            >
              {section.title}
            </h2>
          );
          if (section.type === "summary" && cv.summary)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a]">{cv.summary}</p>
              </div>
            );
          if (section.type === "experience" && cv.experience.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-3">
                  {cv.experience.map((e) => (
                    <div key={e.id}>
                      <div className="flex justify-between text-[10.5px] font-medium">
                        <span>{e.role} · {e.company}</span>
                        <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                      </div>
                      <Bullets text={e.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "education" && cv.education.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.education.map((e) => (
                    <div key={e.id} className="flex justify-between text-[10.5px]">
                      <span className="font-medium">{e.degree} · {e.school}</span>
                      <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "skills" && cv.skills.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1.5">
                  {groupedSkills(cv).map((g) => (
                    <div key={g.title || "_"} className="flex flex-wrap items-center gap-1.5">
                      {g.title && <span className="text-[9px] font-medium opacity-70 mr-1">{g.title}</span>}
                      {g.skills.map((s) => (
                        <span
                          key={s.id}
                          className="text-[9px] px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: accent }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "languages" && cv.languages.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a]">{cv.languages.map((l) => `${l.name} (${l.level})`).join("  ·  ")}</p>
              </div>
            );
          if (section.type === "projects" && cv.projects.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.projects.map((p) => (
                    <div key={p.id}>
                      <div className="text-[10.5px] font-medium">{p.name}</div>
                      <Bullets text={p.description} className="text-[9.5px] text-[#3a3a3a]" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "custom") {
            const block = customBlockFor(cv, section.id);
            if (!block || block.entries.length === 0) return null;
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  <CustomEntries entries={block.entries} className="text-[10.5px]" />
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ---------------- CORPORATE: formal letterhead, two-column body ---------------- */
export function CorporateTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  return (
    <div className={`h-full w-full bg-white text-[#1B2430] ${t.pad} text-[10.5px] leading-snug`}>
      <div className="flex justify-between items-start pb-3 mb-4 border-b-4" style={{ borderColor: accent }}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {cv.personal.fullName}
          </h1>
          <p className="text-[11px] opacity-70">{cv.personal.role}</p>
        </div>
        {cv.personal.photo && (
          <div
            className="h-16 w-16 rounded-sm bg-cover bg-center shrink-0"
            style={{ backgroundImage: `url(${cv.personal.photo})` }}
          />
        )}
        {cv.settings.qrEnabled && cv.settings.qrTarget && (
          <QRCodeImg value={cv.settings.qrTarget} size={56} fgColor="#1B2430" className="shrink-0" />
        )}
      </div>
      <div className="flex gap-4 text-[9px] opacity-60 mb-5 flex-wrap">
        {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
          .filter(Boolean)
          .map((v, i) => (
            <span key={i}>{v}</span>
          ))}
      </div>
      <div className={`grid grid-cols-[1fr_190px] ${t.gapLg}`}>
        <div className={`flex flex-col ${t.gapLg}`}>
          {orderedSections(cv)
            .filter((s) => ["summary", "experience", "education"].includes(s.type))
            .map((section) => {
              const sectionColor = section.color ?? accent;
              const heading = (
                <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.06em] mb-1.5" style={{ color: sectionColor }}>
                  {section.title}
                </h2>
              );
              if (section.type === "summary" && cv.summary)
                return (
                  <div key={section.id}>
                    {heading}
                    <p className="text-[#3a3a3a]">{cv.summary}</p>
                  </div>
                );
              if (section.type === "experience" && cv.experience.length > 0)
                return (
                  <div key={section.id}>
                    {heading}
                    <div className="flex flex-col gap-3">
                      {cv.experience.map((e) => (
                        <div key={e.id}>
                          <div className="flex justify-between text-[10.5px] font-medium">
                            <span>{e.role}, {e.company}</span>
                            <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                          </div>
                          <Bullets text={e.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              if (section.type === "education" && cv.education.length > 0)
                return (
                  <div key={section.id}>
                    {heading}
                    <div className="flex flex-col gap-2">
                      {cv.education.map((e) => (
                        <div key={e.id} className="flex justify-between text-[10.5px]">
                          <span className="font-medium">{e.degree}, {e.school}</span>
                          <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              return null;
            })}
        </div>
        <div className={`flex flex-col ${t.gapLg} border-l pl-4`} style={{ borderColor: "#E4E0D8" }}>
          {orderedSections(cv)
            .filter((s) => ["skills", "languages", "projects", "custom"].includes(s.type))
            .map((section) => {
              const sectionColor = section.color ?? accent;
              const heading = (
                <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.06em] mb-1.5" style={{ color: sectionColor }}>
                  {section.title}
                </h2>
              );
              if (section.type === "skills" && cv.skills.length > 0)
                return (
                  <div key={section.id}>
                    {heading}
                    <div className="flex flex-col gap-2">
                      {groupedSkills(cv).map((g) => (
                        <div key={g.title || "_"} className="flex flex-col gap-1">
                          {g.title && <span className="text-[9px] font-semibold opacity-60">{g.title}</span>}
                          {g.skills.map((s) => (
                            <div key={s.id} className="flex justify-between text-[9.5px]">
                              <span>{s.name}</span>
                              <span className="opacity-50">{levelLabel(s.level)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              if (section.type === "languages" && cv.languages.length > 0)
                return (
                  <div key={section.id}>
                    {heading}
                    <div className="flex flex-col gap-1 text-[9.5px]">
                      {cv.languages.map((l) => (
                        <div key={l.id} className="flex justify-between">
                          <span>{l.name}</span>
                          <span className="opacity-50">{l.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              if (section.type === "projects" && cv.projects.length > 0)
                return (
                  <div key={section.id}>
                    {heading}
                    <div className="flex flex-col gap-2">
                      {cv.projects.map((p) => (
                        <div key={p.id}>
                          <div className="text-[9.5px] font-medium">{p.name}</div>
                          <Bullets text={p.description} className="text-[9px] text-[#3a3a3a]" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              if (section.type === "custom") {
                const block = customBlockFor(cv, section.id);
                if (!block || block.entries.length === 0) return null;
                return (
                  <div key={section.id}>
                    {heading}
                    <div className="flex flex-col gap-2">
                      {block.entries.map((en) => (
                        <div key={en.id}>
                          <div className="text-[9.5px] font-medium">
                            {en.heading}
                            {en.subheading ? ` · ${en.subheading}` : ""}
                          </div>
                          {(en.start || en.end) && (
                            <div className="text-[9px] opacity-60">
                              {en.start} {en.end ? `— ${en.end}` : ""}
                            </div>
                          )}
                          <Bullets text={en.description} className="text-[9px] text-[#3a3a3a]" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- CREATIVE: asymmetric, soft color block, pill tags ---------------- */
export function CreativeTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  return (
    <div className={`h-full w-full bg-white text-[#1B2430] ${t.pad} text-[10.5px] leading-snug`}>
      <div className={`flex items-center gap-4${cv.settings.photoPosition === "right" ? " flex-row-reverse text-right" : ""} mb-1`}>
        {cv.personal.photo && (
          <div
            className="h-20 w-20 rounded-2xl bg-cover bg-center shrink-0"
            style={{ backgroundImage: `url(${cv.personal.photo})` }}
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: accent }}>
            {cv.personal.fullName}
          </h1>
          <p className="text-[11px] opacity-70">{cv.personal.role}</p>
        </div>
        {cv.settings.qrEnabled && cv.settings.qrTarget && (
          <div className="ml-auto">
            <QRCodeImg value={cv.settings.qrTarget} size={52} fgColor={accent} />
          </div>
        )}
      </div>
      <div className="flex gap-3 text-[9px] opacity-50 mt-2 mb-5 flex-wrap">
        {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
          .filter(Boolean)
          .map((v, i) => (
            <span key={i}>{v}</span>
          ))}
      </div>
      <div className={`flex flex-col ${t.gapLg}`}>
        {orderedSections(cv).map((section) => {
          const sectionColor = section.color ?? accent;
          const heading = (
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sectionColor }} />
              <h2 className="text-[11px] font-semibold tracking-wide" style={{ color: sectionColor }}>
                {section.title}
              </h2>
            </div>
          );
          if (section.type === "summary" && cv.summary)
            return (
              <div key={section.id}>
                {heading}
                <p className="text-[#3a3a3a] rounded-lg p-3" style={{ backgroundColor: `${accent}0D` }}>
                  {cv.summary}
                </p>
              </div>
            );
          if (section.type === "experience" && cv.experience.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-3">
                  {cv.experience.map((e) => (
                    <div key={e.id} className="rounded-lg p-3" style={{ backgroundColor: `${accent}0D` }}>
                      <div className="flex justify-between text-[10.5px] font-medium">
                        <span>{e.role} · {e.company}</span>
                        <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                      </div>
                      <Bullets text={e.description} className="text-[9.5px] text-[#3a3a3a] mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "education" && cv.education.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.education.map((e) => (
                    <div key={e.id} className="flex justify-between text-[10.5px]">
                      <span className="font-medium">{e.degree} · {e.school}</span>
                      <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "skills" && cv.skills.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1.5">
                  {groupedSkills(cv).map((g) => (
                    <div key={g.title || "_"} className="flex flex-wrap items-center gap-1.5">
                      {g.title && <span className="text-[9px] font-medium opacity-60 mr-1">{g.title}</span>}
                      {g.skills.map((s) => (
                        <span
                          key={s.id}
                          className="text-[9px] px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: `${accent}1A`, color: accent }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "languages" && cv.languages.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-wrap gap-1.5">
                  {cv.languages.map((l) => (
                    <span
                      key={l.id}
                      className="text-[9px] px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `${accent}1A`, color: accent }}
                    >
                      {l.name} · {l.level}
                    </span>
                  ))}
                </div>
              </div>
            );
          if (section.type === "projects" && cv.projects.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.projects.map((p) => (
                    <div key={p.id} className="rounded-lg p-3" style={{ backgroundColor: `${accent}0D` }}>
                      <div className="text-[10.5px] font-medium">{p.name}</div>
                      <Bullets text={p.description} className="text-[9.5px] text-[#3a3a3a]" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "custom") {
            const block = customBlockFor(cv, section.id);
            if (!block || block.entries.length === 0) return null;
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {block.entries.map((en) => (
                    <div key={en.id} className="rounded-lg p-3" style={{ backgroundColor: `${accent}0D` }}>
                      <div className="flex justify-between text-[10.5px] font-medium">
                        <span>
                          {en.heading}
                          {en.subheading ? ` · ${en.subheading}` : ""}
                        </span>
                        {(en.start || en.end) && (
                          <span className="text-[9px] opacity-60 shrink-0 ml-2">
                            {en.start} {en.end ? `— ${en.end}` : ""}
                          </span>
                        )}
                      </div>
                      <Bullets text={en.description} className="text-[9.5px] text-[#3a3a3a]" />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ---------------- DARK: dark background, light text ---------------- */
export function DarkTemplate({ cv }: { cv: CVData }) {
  const accent = cv.accentColor;
  const t = densityTokens(cv);
  return (
    <div className={`h-full w-full ${t.pad} text-[10.5px] leading-snug`} style={{ backgroundColor: "#1B2430", color: "#E9E6E0" }}>
      <div className={`flex items-center gap-4${cv.settings.photoPosition === "right" ? " flex-row-reverse text-right" : ""} mb-5`}>
        {cv.personal.photo && (
          <div
            className="h-16 w-16 rounded-full bg-cover bg-center shrink-0 border-2"
            style={{ backgroundImage: `url(${cv.personal.photo})`, borderColor: accent }}
          />
        )}
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            {cv.personal.fullName}
          </h1>
          <p className="text-[11px]" style={{ color: accent }}>
            {cv.personal.role}
          </p>
        </div>
        {cv.settings.qrEnabled && cv.settings.qrTarget && (
          <div className="ml-auto bg-white p-1.5 rounded shrink-0">
            <QRCodeImg value={cv.settings.qrTarget} size={48} fgColor="#1B2430" />
          </div>
        )}
      </div>
      <div className="flex gap-3 text-[9px] opacity-60 mb-5 flex-wrap">
        {[cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.website]
          .filter(Boolean)
          .map((v, i) => (
            <span key={i}>{v}</span>
          ))}
      </div>
      <div className={`flex flex-col ${t.gapLg}`}>
        {orderedSections(cv).map((section) => {
          const sectionColor = section.color ?? accent;
          const heading = (
            <h2 className="text-[11px] font-semibold tracking-wide mb-2" style={{ color: sectionColor }}>
              {section.title}
            </h2>
          );
          if (section.type === "summary" && cv.summary)
            return (
              <div key={section.id}>
                {heading}
                <p className="opacity-80">{cv.summary}</p>
              </div>
            );
          if (section.type === "experience" && cv.experience.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-3">
                  {cv.experience.map((e) => (
                    <div key={e.id}>
                      <div className="flex justify-between text-[10.5px] font-medium text-white">
                        <span>{e.role} · {e.company}</span>
                        <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                      </div>
                      <Bullets text={e.description} className="text-[9.5px] opacity-75 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "education" && cv.education.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.education.map((e) => (
                    <div key={e.id} className="flex justify-between text-[10.5px]">
                      <span className="font-medium text-white">{e.degree} · {e.school}</span>
                      <span className="text-[9px] opacity-60">{e.start} — {e.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "skills" && cv.skills.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-1.5">
                  {groupedSkills(cv).map((g) => (
                    <div key={g.title || "_"} className="flex flex-wrap items-center gap-1.5">
                      {g.title && <span className="text-[9px] font-medium opacity-60 mr-1">{g.title}</span>}
                      {g.skills.map((s) => (
                        <span
                          key={s.id}
                          className="text-[9px] px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${accent}33`, color: accent }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "languages" && cv.languages.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <p className="opacity-80">{cv.languages.map((l) => `${l.name} (${l.level})`).join("  ·  ")}</p>
              </div>
            );
          if (section.type === "projects" && cv.projects.length > 0)
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {cv.projects.map((p) => (
                    <div key={p.id}>
                      <div className="text-[10.5px] font-medium text-white">{p.name}</div>
                      <Bullets text={p.description} className="text-[9.5px] opacity-75" />
                    </div>
                  ))}
                </div>
              </div>
            );
          if (section.type === "custom") {
            const block = customBlockFor(cv, section.id);
            if (!block || block.entries.length === 0) return null;
            return (
              <div key={section.id}>
                {heading}
                <div className="flex flex-col gap-2">
                  {block.entries.map((en) => (
                    <div key={en.id}>
                      <div className="flex justify-between text-[10.5px] font-medium text-white">
                        <span>
                          {en.heading}
                          {en.subheading ? ` · ${en.subheading}` : ""}
                        </span>
                        {(en.start || en.end) && (
                          <span className="text-[9px] opacity-60 shrink-0 ml-2">
                            {en.start} {en.end ? `— ${en.end}` : ""}
                          </span>
                        )}
                      </div>
                      <Bullets text={en.description} className="text-[9.5px] opacity-75 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export const TEMPLATES: Record<string, { name: string; component: (props: { cv: CVData }) => ReactElement }> = {
  modern: { name: "Modern", component: ModernTemplate },
  classic: { name: "Classic", component: ClassicTemplate },
  minimal: { name: "Minimal", component: MinimalTemplate },
  timeline: { name: "Timeline", component: TimelineTemplate },
  compact: { name: "Compact (ATS)", component: CompactTemplate },
  bold: { name: "Bold", component: BoldTemplate },
  corporate: { name: "Corporate", component: CorporateTemplate },
  creative: { name: "Creative", component: CreativeTemplate },
  dark: { name: "Dark", component: DarkTemplate },
};
