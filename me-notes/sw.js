const cacheName = 'me-notes';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/js/main.js',
  '/assets/vendors/tailwind/tailwind.js',
  '/assets/vendors/fontawesome/js/solid.min.js',
  '/assets/vendors/fontawesome/js/fontawesome.min.js'
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
