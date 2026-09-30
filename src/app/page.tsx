"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { TemplatePicker } from "@/components/TemplatePicker";
import { ExportBar } from "@/components/ExportBar";
import { ProfileBar } from "@/components/ProfileBar";
import { CoverLetterEditor } from "@/components/CoverLetterEditor";
import { CoverLetterPreview } from "@/components/CoverLetterPreview";
import { CoverLetterExportBar } from "@/components/CoverLetterExportBar";
import { SettingsPopover } from "@/components/SettingsPopover";
import { UndoRedoButtons } from "@/components/UndoRedoButtons";
import { CompletenessBadge } from "@/components/CompletenessBadge";
import { LocaleToggle } from "@/components/LocaleToggle";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { SharedCVView } from "@/components/SharedCVView";
import { ToolsPopover } from "@/components/ToolsPopover";
import { SnapshotsPopover } from "@/components/SnapshotsPopover";
import { FitToOneButton } from "@/components/FitToOneBtn";
import { CompareTemplatesModal } from "@/components/CompareTemplatesModal";
import { useCVStore } from "@/lib/store";
import { decodeCVFromURL } from "@/lib/share";
import { decryptCV } from "@/lib/shareEncrypt";
import { useT } from "@/lib/i18n";
import { CVData } from "@/lib/types";

type Tab = "cv" | "cover-letter";
type MobilePane = "edit" | "preview";

export default function Home() {
  const previewRef = useRef<HTMLDivElement>(null);
  const coverLetterPreviewRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("cv");
  const [mobilePane, setMobilePane] = useState<MobilePane>("edit");
  const [showCompare, setShowCompare] = useState(false);
  const hasShareParam = () =>
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("cv") ||
      new URLSearchParams(window.location.search).get("cve"));
  const [showLanding, setShowLanding] = useState(() => !hasShareParam());
  const [sharedCV, setSharedCV] = useState<CVData | null>(() => {
    if (typeof window === "undefined") return null;
    const encoded = new URLSearchParams(window.location.search).get("cv");
    return encoded ? decodeCVFromURL(encoded) : null;
  });
  const [decryptingProtectedLink, setDecryptingProtectedLink] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!new URLSearchParams(window.location.search).get("cve");
  });
  const newProfile = useCVStore((s) => s.newProfile);
  const undo = useCVStore((s) => s.undo);
  const redo = useCVStore((s) => s.redo);
  const hasEdited = useCVStore((s) => s.past.length > 0);
  const t = useT();

  // If the link is password-protected (?cve=...), prompt for the password
  // (retrying on a wrong guess, since decryption failing is the only signal
  // we have) before showing anything.
  useEffect(() => {
    const encrypted = new URLSearchParams(window.location.search).get("cve");
    if (!encrypted) return;
    (async () => {
      let data: CVData | null = null;
      while (!data) {
        const password = prompt("This CV is password-protected. Enter the password:");
        if (password === null) break; // user cancelled
        data = await decryptCV(encrypted, password);
        if (!data) alert("That password didn't work — try again.");
      }
      setSharedCV(data);
      setDecryptingProtectedLink(false);
      if (!data) setShowLanding(true);
    })();
  }, []);

  // Strip the ?cv=/?cve= param from the URL once we've read it, so
  // refreshing or sharing the page again doesn't keep re-triggering this.
  useEffect(() => {
    if (hasShareParam()) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Warn before closing/navigating away if there are unsaved edits this
  // session — reassuring even though everything is already saved to
  // localStorage, since a browser crash mid-edit is still possible.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!hasEdited) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasEdited]);

  // Keyboard shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo,
  // Ctrl/Cmd+1 / +2 switch tabs.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === "1") {
        e.preventDefault();
        setTab("cv");
      } else if (e.key === "2") {
        e.preventDefault();
        setTab("cover-letter");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  if (decryptingProtectedLink && !sharedCV) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-[#6B7280] text-sm">Unlocking…</p>
      </div>
    );
  }

  if (sharedCV) {
    return (
      <SharedCVView
        cv={sharedCV}
        onEdit={() => {
          newProfile(sharedCV.personal.fullName ? `${sharedCV.personal.fullName}'s CV` : "Shared CV", sharedCV);
          setSharedCV(null);
          setShowLanding(false);
        }}
      />
    );
  }

  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-6 text-center gap-6">
        <span
          className="text-2xl font-semibold text-[#1B2430]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("appName")}
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1B2430] max-w-xl" style={{ fontFamily: "var(--font-display)" }}>
          {t("landingTitle")}
        </h1>
        <p className="text-[#6B7280] max-w-md">{t("landingSubtitle")}</p>
        <button
          onClick={() => setShowLanding(false)}
          className="rounded-md bg-[#1B2430] text-white px-6 py-3 font-medium"
        >
          {t("landingCTA")}
        </button>
        <div className="mt-2">
          <LocaleToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] relative">
      <header className="border-b border-[#E4E0D8] bg-white sticky top-0 z-10 print:hidden">
        <div className="mx-auto max-w-[1400px] px-6 py-3 flex items-center gap-3">
          <span
            className="text-lg font-semibold text-[#1B2430] shrink-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("appName")}
          </span>
          <div className="flex rounded-md border border-[#E4E0D8] overflow-hidden shrink-0">
            <button
              onClick={() => setTab("cv")}
              className={`px-3 py-1.5 text-sm font-medium ${
                tab === "cv" ? "bg-[#1B2430] text-white" : "bg-white text-[#1B2430]"
              }`}
            >
              {t("tabCV")}
            </button>
            <button
              onClick={() => setTab("cover-letter")}
              className={`px-3 py-1.5 text-sm font-medium ${
                tab === "cover-letter" ? "bg-[#1B2430] text-white" : "bg-white text-[#1B2430]"
              }`}
            >
              {t("tabCoverLetter")}
            </button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {tab === "cv" && <UndoRedoButtons />}
            {tab === "cv" && <SnapshotsPopover />}
            {tab === "cv" && (
              <button
                onClick={() => setShowCompare(true)}
                className="text-sm px-3 py-1.5 rounded-md border border-[#E4E0D8] text-[#1B2430] hover:border-[#1B2430]"
              >
                Compare ▾
              </button>
            )}
            {tab === "cv" && <ToolsPopover />}
            {tab === "cv" && <SettingsPopover />}
            <LocaleToggle />
          </div>
        </div>
        {/* Mobile Edit/Preview switcher */}
        <div className="lg:hidden border-t border-[#E4E0D8] flex">
          <button
            onClick={() => setMobilePane("edit")}
            className={`flex-1 py-2 text-sm font-medium ${
              mobilePane === "edit" ? "text-[#1B2430] border-b-2 border-[#1B2430]" : "text-[#9CA3AF]"
            }`}
          >
            {t("editTab")}
          </button>
          <button
            onClick={() => setMobilePane("preview")}
            className={`flex-1 py-2 text-sm font-medium ${
              mobilePane === "preview" ? "text-[#1B2430] border-b-2 border-[#1B2430]" : "text-[#9CA3AF]"
            }`}
          >
            {t("previewTab")}
          </button>
        </div>
      </header>

      {/* Secondary toolbar: CV profile + template controls (scrolls away). */}
      {tab === "cv" && (
        <div className="border-b border-[#E4E0D8] bg-[#FCFBF9] print:hidden">
          <div className="mx-auto max-w-[1400px] px-6 py-2.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <ProfileBar />
              <div className="flex items-center gap-3">
                <AutoSaveIndicator />
                <CompletenessBadge />
              </div>
            </div>
            <TemplatePicker />
          </div>
        </div>
      )}

      {tab === "cv" && <OnboardingChecklist />}

      {/* Both tabs stay mounted (just shown/hidden) so their preview refs
          are always valid — this is what lets "Download CV + Letter" work
          from either tab without re-rendering anything on demand. */}
      <main
        className={`${
          tab === "cv" ? "grid" : "grid absolute -left-[200vw] top-0 print:hidden"
        } mx-auto max-w-[1400px] px-6 py-6 grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-6`}
      >
        <section
          className={`${mobilePane === "edit" ? "block" : "hidden"} lg:block bg-white border border-[#E4E0D8] rounded-lg p-5 max-h-[calc(100vh-140px)] overflow-y-auto print:hidden`}
        >
          <Editor />
        </section>

        <section className={`${mobilePane === "preview" ? "flex" : "hidden"} lg:flex flex-col-reverse xl:flex-row gap-4 min-w-0`}>
          <div className="overflow-auto pb-10 min-w-0 flex-1 print:overflow-visible print:pb-0">
            <Preview ref={previewRef} />
          </div>
          <aside className="xl:w-52 shrink-0 bg-white border border-[#E4E0D8] rounded-lg p-2 xl:sticky xl:top-[70px] xl:self-start print:hidden">
            <ExportBar previewRef={previewRef} coverLetterPreviewRef={coverLetterPreviewRef} />
            <div className="h-px bg-[#E4E0D8] my-1" />
            <FitToOneButton previewRef={previewRef} />
          </aside>
        </section>
      </main>

      <main
        className={`${
          tab === "cover-letter" ? "grid" : "grid absolute -left-[200vw] top-0 print:hidden"
        } mx-auto max-w-[1400px] px-6 py-6 grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-6`}
      >
        <section
          className={`${mobilePane === "edit" ? "block" : "hidden"} lg:block bg-white border border-[#E4E0D8] rounded-lg p-5 max-h-[calc(100vh-140px)] overflow-y-auto print:hidden`}
        >
          <CoverLetterEditor />
        </section>

        <section className={`${mobilePane === "preview" ? "flex" : "hidden"} lg:flex flex-col-reverse xl:flex-row gap-4 min-w-0`}>
          <div className="overflow-auto pb-10 min-w-0 flex-1 print:overflow-visible print:pb-0">
            <CoverLetterPreview ref={coverLetterPreviewRef} />
          </div>
          <aside className="xl:w-52 shrink-0 bg-white border border-[#E4E0D8] rounded-lg p-2 xl:sticky xl:top-[70px] xl:self-start print:hidden">
            <CoverLetterExportBar previewRef={coverLetterPreviewRef} />
          </aside>
        </section>
      </main>

      {showCompare && <CompareTemplatesModal onClose={() => setShowCompare(false)} />}
    </div>
  );
}
