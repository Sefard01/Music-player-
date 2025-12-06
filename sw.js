const cacheName = "music-player-cache-v1";

const assetsToCache = [
    "/",
    "/index.html",
    "/player.js",
    "/1.m4a",
    "/2.m4a",
    "/1.m4a"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
