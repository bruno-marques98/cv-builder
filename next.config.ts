import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // The whole app is client-side (no API routes, no server actions), so a
  // pure static export works everywhere: Vercel, Netlify, GitHub Pages, or
  // any static file host. `next build` always produces ./out.
  output: "export",
  basePath: isGithubPages ? basePath : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
