"use client";

import { createRoot } from "react-dom/client";
import JSZip from "jszip";
import { CVProfile } from "./types";
import { TEMPLATES } from "./templates";
import { PAGE_DIMENSIONS } from "@/components/Preview";

// Renders a single profile's CV off-screen (so html2canvas can capture it),
// exports it to a PDF blob, then cleans up.
async function profileToPDFBlob(profile: CVProfile): Promise<Blob> {
  const { exportToPDFBlob } = await import("./export");
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const page = PAGE_DIMENSIONS[profile.data.settings.pageSize] ?? PAGE_DIMENSIONS.a4;
  const wrapper = document.createElement("div");
  wrapper.style.width = `${page.width}px`;
  wrapper.style.minHeight = `${page.height}px`;
  container.appendChild(wrapper);

  const Template = TEMPLATES[profile.data.templateId]?.component ?? TEMPLATES.modern.component;
  const root = createRoot(wrapper);

  await new Promise<void>((resolve) => {
    root.render(<Template cv={profile.data} />);
    // Give React + web fonts a tick to paint before capturing.
    setTimeout(resolve, 150);
  });

  try {
    return await exportToPDFBlob(wrapper, profile.data.settings.pageSize);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

export async function exportAllProfilesZip(profiles: CVProfile[]) {
  const zip = new JSZip();
  for (const profile of profiles) {
    const blob = await profileToPDFBlob(profile);
    const safeName = profile.name.trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_") || "cv";
    zip.file(`${safeName}.pdf`, blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "all_cvs.zip";
  a.click();
  URL.revokeObjectURL(url);
}
