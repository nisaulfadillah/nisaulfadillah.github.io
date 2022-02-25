const cacheName = 'me-notes';
const urlsToCache = [
  '/me-notes/',
  '/me-notes/index.html',
  '/me-notes/assets/js/main.js',
  '/me-notes/assets/vendors/tailwind/tailwind.js',
  '/me-notes/assets/vendors/fontawesome/js/solid.min.js',
  '/me-notes/assets/vendors/fontawesome/js/fontawesome.min.js'
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
