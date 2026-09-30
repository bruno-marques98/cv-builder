// Runs after `npm install`. Keeps public/pdf.worker.min.mjs in sync with the
// installed pdfjs-dist version, so the CV-import feature never depends on a
// third-party CDN (unpkg) at runtime — avoids a supply-chain / integrity risk
// and means the app works fully offline once cached by the service worker.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs");
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

try {
  fs.copyFileSync(src, dest);
  console.log("Copied pdfjs worker to public/pdf.worker.min.mjs");
} catch (err) {
  console.warn("Could not copy pdfjs worker (CV import from PDF may not work):", err.message);
}
