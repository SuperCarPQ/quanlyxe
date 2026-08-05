/* Đổi VERSION mỗi lần deploy bản mới -> máy người dùng tự nhận ra */
const VERSION = "1.4.0";
const CACHE = `qlx-${VERSION}`;
const SHELL = ["./", "./index.html", "./firebase-config.js", "./manifest.json"];

self.addEventListener("install", e => {
  // KHÔNG skipWaiting ở đây: chờ người dùng bấm "Cập nhật" mới đổi,
  // tránh app tự đổi giữa lúc đang nhập liệu dở.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Trang gọi khi người dùng bấm "Cập nhật"
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
  if (e.data && e.data.type === "GET_VERSION" && e.source) {
    e.source.postMessage({ type: "VERSION", version: VERSION });
  }
});

// Bấm vào thông báo thì mở app (hoặc nhảy về tab đang mở sẵn)
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
      for (const c of cs) if ("focus" in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./index.html");
    })
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Firestore luôn đi thẳng ra mạng, để SDK tự lo cache offline
  if (url.hostname.includes("googleapis.com") && url.pathname.includes("firestore")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
