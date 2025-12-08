// Service Worker for Music-player-
const SHELL_CACHE = 'music-player-shell-v1';
const MEDIA_CACHE = 'music-player-media-v1';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/music.css',
  '/player.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Helper: respond with cache-first for media, cache-first for shell but update when missing
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Only handle same-origin requests (avoid interfering with third-party requests)
  if (url.origin !== location.origin) return;

  // Media (Songs/ and cover/) - cache-first: serve from cache if present, else fetch+cache
  if (url.pathname.startsWith('/Songs/') || url.pathname.startsWith('/Songs') || url.pathname.startsWith('/cover/')) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            // only cache valid responses
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          }).catch(() => cached || Response.error());
        })
      )
    );
    return;
  }

  // App shell: try cache first, then network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // cache the fetched shell resources for future
        if (res && res.status === 200) {
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
