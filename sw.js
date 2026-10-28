const CACHE = "raspisanie-v3";
const FILES = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Сначала берём свежую версию из интернета, без сети открываем сохранённую
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      const copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return resp;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});

// Нажатие на уведомление открывает приложение
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then(function (list) {
      if (list.length) return list[0].focus();
      return clients.openWindow("./index.html");
    })
  );
});
