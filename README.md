# Buildmy CV

A free, no-account CV + cover letter builder. Pick a template, fill in your info, drag
sections to reorder, and export to PDF or Word -- all client-side, nothing sent to a server.

## Features

### Templates & design
- 9 CV templates: Modern, Classic, Minimal, Timeline, Compact (ATS-friendly), Bold, Corporate, Creative, Dark
- Template thumbnails in the picker
- Custom accent color, font pairing (Default/Serif/Grotesk), page size (A4/Letter), density
  (Compact/Roomy), text size (S/M/L) -- under "More styling"
- Per-section accent color override (set a different color for e.g. just the Skills heading)
- Photo position (left/right) on templates with a photo+name header
- QR code (links to LinkedIn/portfolio/etc.) on Modern, Corporate, Bold, Creative, Dark

### Content
- Drag-and-drop section reordering, show/hide sections
- Drag-and-drop reordering *within* a section (experience, education, skills, languages,
  projects, custom entries)
- Duplicate any entry (experience, education, project, custom entry) or a whole CV profile
- Custom sections -- add your own (certifications, awards, publications, references, anything)
- Photo upload
- Bullet-point descriptions with **bold** / *italic* inline markup -- renders correctly in
  both the preview and the Word export
- Skill categories/grouping (e.g. "Tools", "Soft skills")
- Summary character-count guidance
- Duplicate-company detection warning in Experience

### Profiles & data
- Multiple CV profiles -- switch/duplicate/rename/delete from the header
- Import from file -- upload an existing PDF/DOCX/TXT CV; contact details are extracted
  automatically, and Experience/Education/Skills are bucketed by section headers found in the
  document (best-effort, not a full resume parser)
- Undo/redo (buttons + Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)
- Auto-save indicator + a "leave without saving?" browser prompt if you've made edits
- Save/Load as JSON (manual backup/portability)

### Sharing & export
- Multi-page PDF export
- Word (.docx) export
- Shareable link -- encodes the whole CV into a URL, no server; opening it shows a clean
  read-only view (e.g. for a recruiter) with an "Edit this CV" button to import it as your own
- Combined "Download CV + Letter" as one PDF
- "Export all as ZIP" -- every saved profile as a PDF, zipped
- Copy as plain text (for pasting into application forms that don't accept file uploads)
- Email button (opens your mail client with a share link)
- Print button

### Builder UX
- A completeness indicator in the header
- Onboarding checklist on first visit (dismissible)
- Mobile-friendly layout -- Edit/Preview tab switcher below the lg breakpoint
- EN/PT/ES/FR language toggle, covering all UI chrome and field labels
- A landing screen before the builder
- Cover letter builder -- separate tab, same export options, can pull contact info from the
  active CV

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Zustand (state, persisted to localStorage)
- @dnd-kit (drag-and-drop, section and entry reordering)
- jsPDF + html2canvas (PDF export)
- docx (Word export)
- lz-string (compress CV data into a shareable URL)
- qrcode (client-side QR generation)
- mammoth + pdfjs-dist (CV import: DOCX / PDF text extraction)
- jszip (export-all-profiles as a zip)

## Run locally
npm install
npm run dev

Open http://localhost:3000

## Deploy to Vercel (free)
1. Push this folder to a GitHub repo.
2. Go to vercel.com -> New Project -> import the repo.
3. Framework preset: Next.js (auto-detected). No env vars needed.
4. Deploy. Every push to main auto-deploys.

No database, no backend, no paid services required -- Vercel's Hobby tier is enough.
The build produces a pure static export (see "Static export" below) -- Vercel serves that
directly, so this is effectively free static hosting even though it's on Vercel's platform.

## Static export (works on any static host, including GitHub Pages)

The whole app is client-side -- no API routes, no server actions, no database -- so `next
build` always produces a self-contained `./out` folder (`output: "export"` in
next.config.ts). That folder can be served by literally any static file host: Vercel,
Netlify, Cloudflare Pages, S3, or GitHub Pages.

### Deploy to GitHub Pages
A workflow is already set up at `.github/workflows/deploy-pages.yml`:
1. Push this repo to GitHub.
2. In the repo settings -> Pages, set Source to "GitHub Actions".
3. Push to `main` (or run the workflow manually from the Actions tab).

That workflow builds with `NEXT_PUBLIC_BASE_PATH=/<repo-name>`, which is what a GitHub
Pages *project* page needs (served at `username.github.io/repo-name/`). If this repo is
instead your `username.github.io` *user/org* page (served at the domain root), edit the
workflow and set `NEXT_PUBLIC_BASE_PATH` to an empty string.

To build and check the export locally before pushing:
```
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run build
npx serve out   # or: cd out && python3 -m http.server 8080
```

All of the app's own static assets (manifest, icons, service worker, the PDF-parsing
worker) use relative paths specifically so they resolve correctly under a subpath like
`/your-repo-name/` -- this was tested by serving the `out/` folder under a simulated
subpath, not just at a domain root.

## Notes on testing

This was verified, not just written and assumed to work:
- `npm run build` (default, root path) -- clean
- `npm run build` with `GITHUB_PAGES=true` + `NEXT_PUBLIC_BASE_PATH=/cv-builder` -- clean,
  and the output was served locally under a simulated `/cv-builder/` subpath to confirm
  every asset (JS chunks, manifest, icons, service worker, PDF worker) resolves correctly
  there, not just at the domain root
- `npm run lint` -- clean
- `npx tsc --noEmit` (strict typecheck, not just the build's incremental check) -- clean
- `npm audit` -- 0 known vulnerabilities in any dependency
- Static scan for `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write` -- none
  present anywhere in the app
- Confirmed no API routes, server actions, middleware, or dynamic routes exist that would
  be incompatible with a static export

## Security notes

- **No backend, so no server-side attack surface.** All data (CV content, profiles,
  settings) lives in the visitor's own browser (localStorage) and never leaves it, except
  when the visitor explicitly generates a share link, exports a file, or emails one.
- **Share links carry the CV data in the URL itself** (compressed with lz-string), by
  design -- that's what makes sharing possible with no server. Anyone with a link can view
  the CV; there's no way to revoke a link once shared, since there's no server to revoke it
  from.
- **Password-protected share links (🔒 Share) are a deterrent, not real access control.**
  The payload is encrypted client-side with AES-256-GCM (Web Crypto API, PBKDF2-derived
  key), so the link isn't human-readable without the password -- but the ciphertext still
  travels in the URL, so it's exposed to offline brute-forcing. Fine for "don't want this
  showing up in a casual link preview"; not fine for anything that actually needs to stay
  private.
- **The CV-import (PDF/DOCX parsing) worker script is self-hosted**, not loaded from a CDN
  at runtime -- see `scripts/copy-pdf-worker.js`. This closes what would otherwise be a
  supply-chain risk (a compromised CDN file running arbitrary JS in the visitor's browser).
- **The service worker only caches the app's own static assets** (same-origin GET
  requests) for offline use -- it doesn't cache or transmit any CV data anywhere.
- `npm audit` reports 0 known vulnerabilities as of this build; re-run it periodically since
  that changes over time as new CVEs are disclosed.

## Project structure
- src/lib/types.ts -- CV + cover letter data shapes
- src/lib/store.ts -- CV Zustand store: profiles, settings, undo/redo, reorder/duplicate, all mutators (persisted)
- src/lib/coverLetterStore.ts -- cover letter Zustand store (persisted)
- src/lib/i18n.ts -- locale store + EN/PT/ES/FR dictionary
- src/lib/richText.ts -- shared **bold**/*italic* inline parser (preview + docx export)
- src/lib/templates/ -- CV templates (index.tsx, 9 templates) and the cover letter template (coverLetter.tsx)
- src/lib/export.ts -- PDF / Word / JSON / combined-PDF / plain-text export logic
- src/lib/exportAll.tsx -- renders every profile off-screen and zips the PDFs
- src/lib/share.ts -- encode/decode CV data for shareable links
- src/lib/importCV.ts -- heuristic PDF/DOCX/TXT -> CV field + section extraction
- src/components/ -- Editor, SortableEntryList (drag-and-drop within a section), SectionList,
  TemplatePicker, TemplateIcon, SettingsPopover, ProfileBar, ExportBar, Preview,
  UndoRedoButtons, CompletenessBadge, AutoSaveIndicator, OnboardingChecklist, LocaleToggle,
  QRCodeImg, ImportCVButton, SharedCVView, and the cover-letter equivalents
- src/app/page.tsx -- main layout: landing screen, shared-CV read-only view, CV / Cover letter
  tabs, mobile pane switcher

## Adding a new CV template
Add a component to src/lib/templates/index.tsx following the existing pattern (receives cv: CVData),
then register it in the TEMPLATES map and add an icon case to TemplateIcon.tsx.
Use customBlockFor(cv, section.id) + <CustomBlock> or <CustomEntries>/groupedSkills(cv) to support
custom sections and skill categories in the new template.

## Notes
- All data lives in the browser (localStorage). "Save data" / "Load data" export/import a .json backup file per CV.
- A shared link's data is embedded entirely in the URL (compressed) -- nothing is uploaded anywhere.
- CV import is best-effort: it reliably pulls name/email/phone/website and buckets content under
  Experience/Education/Skills when it recognizes a section header, but it doesn't split multiple jobs
  within one Experience block into separate dated entries -- some manual cleanup is expected.
- Not implemented: AI-assisted writing (explicitly out of scope for this build).

## Latest additions
- Keyword matcher and resume health check (Tools ▾)
- "Fit to one page" auto-adjusts density/text-size until the CV fits one page
- A/B template comparison modal (Compare ▾)
- Named snapshots per profile (Versions ▾) — separate from undo/redo, for deliberate checkpoints
- "Last updated" nudge on a profile untouched for 90+ days
- Contrast checker on the custom accent color (Settings ▾)
- Photo crop/zoom tool on upload
- PNG/JPG export alongside PDF/Word
- Password-protected share links (🔒 Share) — encrypts the payload with the Web Crypto API so
  the URL isn't readable at a glance; this is a deterrent, not real access control, since the
  encrypted data still travels in the link itself and could be attacked offline
- Keyboard navigation between editor sections (Alt+↑ / Alt+↓)
- PWA support — installable, and keeps working offline after the first load (manifest.json + a
  cache-first service worker for the app shell)
