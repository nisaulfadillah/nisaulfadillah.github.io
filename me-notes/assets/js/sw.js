// installing service worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('me-notes').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/vendors/tailwind/tailwind.js',
        '/assets/js/main.js',
        '/assets/vendors/fontawesome/css/all.min.css',
        '/assets/vendors/fontawesome/webfonts/fa-solid-900.woff2'
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
