self.addEventListener('install', e => { 
  e.waitUntil( 
    caches.open('stopwatch').then(cache => { 
      return cache.addAll([ 
        '/stop-the-watch/',
        '/stop-the-watch/index.html',
        '/stop-the-watch/assets/js/main.js',
        '/stop-the-watch/assets/vendors/tailwind/tailwind.js'
      ]); 
    })
  ); 
});

self.addEventListener('fetch', e => { 
  e.respondWith( 
    caches.match(e.request).then(response => { 
      return response || fetch(e.request); 
    }) 
  ); 
});