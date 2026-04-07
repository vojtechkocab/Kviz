const CACHE_NAME = "kralicek-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./matematika_400_pro_deti_upraveno.json",
  "./TOP_500_dataset_OPRAVENY.json",
  "./assets/rabbit-sick.png",
  "./assets/rabbit-win.mp4",
  "./assets/rabbit-01.mp4",
  "./assets/rabbit-02.mp4",
  "./assets/rabbit-03.mp4",
  "./assets/rabbit-04.mp4",
  "./icons/icon.svg",
  "./icons/apple-touch-icon.svg",
  "./icons/maskable-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      });
    }),
  );
});
