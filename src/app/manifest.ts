import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buildmy CV",
    short_name: "Buildmy CV",
    description: "Build and export a polished CV in minutes — free, no account, everything stays in your browser.",
    start_url: ".",
    display: "standalone",
    background_color: "#FAF8F4",
    theme_color: "#1B2430",
    icons: [
      { src: "icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
