// installing service worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('me-notes').then(cache => {
      return cache.addAll([
        '/',
        '/me-notes/index.html',
        '/me-notes/assets/vendors/tailwind/tailwind.js',
        '/me-notes/assets/js/main.js',
        '/me-notes/assets/vendors/fontawesome/css/all.min.css',
        '/me-notes/assets/vendors/fontawesome/webfonts/fa-solid-900.woff2'
      ]);
    })
  );
});

// responding further request
self.addEventListener('fetch', e => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
