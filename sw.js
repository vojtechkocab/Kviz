const CACHE_NAME = "kralicek-v7";
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
  "./assets/rabbit-story/1.mp4",
  "./assets/rabbit-story/2.mp4",
  "./assets/rabbit-story/3.mp4",
  "./assets/rabbit-story/4.mp4",
  "./assets/rabbit-story/5.mp4",
  "./assets/rabbit-story/6.mp4",
  "./assets/rabbit-story/7.mp4",
  "./assets/rabbit-prompt-01.png",
  "./assets/rabbit-prompt-02.png",
  "./assets/rabbit-prompt-03.png",
  "./assets/rabbit-prompt-04.png",
  "./assets/question-images/horse.jpg",
  "./assets/question-images/dog.jpg",
  "./assets/question-images/cat.jpg",
  "./assets/question-images/cow.jpg",
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
