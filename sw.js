// Hotel Simran International - Lightweight Service Worker
const CACHE_NAME = 'hsi-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/crm.html',
  '/css/styles.css',
  '/css/admin.css',
  '/js/main.js',
  '/js/booking.js',
  '/js/admin.js',
  '/images/logo.jpg',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network first with cache fallback for fresh content
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
