// installing service worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('me-notes').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/vendors/tailwind/tailwind.js',
        '/assets/js/main.js',
        '/assets/vendors/fontawesome/css/all.min.css'
      ]);
    })
  );
});

// responding further request
self.addEventListener('fetch', e => {
  e.respondWidth(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});