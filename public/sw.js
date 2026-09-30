const CACHE_NAME = "buildmy-cv-v1";
// Paths relative to this file's own scope (wherever sw.js is served from —
// works whether the app is hosted at a domain root or a GitHub Pages
// project subpath, since self.registration.scope reflects that for us).
const SCOPE = self.registration.scope;
const APP_SHELL = ["", "manifest.webmanifest", "icon.svg", "icon-512.svg", "pdf.worker.min.mjs"].map(
  (p) => new URL(p, SCOPE).toString()
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for same-origin GET requests, falling back to network, so the
// builder keeps working (with whatever was last loaded) when offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
