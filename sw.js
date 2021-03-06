const cacheName = 'nisaulfadillah';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/js/main.js',
  '/assets/vendors/tailwind/tailwind.js'
];

// install service worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
 });

// responding further request
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
