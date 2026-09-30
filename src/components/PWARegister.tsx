"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Relative path + explicit relative scope so this resolves correctly
      // whether the app is served from a domain root or a subpath (e.g. a
      // GitHub Pages project page at /repo-name/).
      navigator.serviceWorker.register("sw.js", { scope: "." }).catch(() => {});
    }
  }, []);
  return null;
}
