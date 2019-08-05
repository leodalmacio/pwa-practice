
// caches.match(resourceUrl) - use to a resource from cache
// evt.waitUntil(function) - used to make sure a function is executed before finishing the event
// evt.respondWith(function?) - used to on fetch to send back value when fetching
// caches.open(cacheName) - used to open a specific cache
// cache.put(url, value) - used to cache a single resource.
// cache.addAll(array) - used to add multiple resources
// caches.keys() - used to obtain cache names

const staticCacheName = 'site-static-v2';
const dynamicCacheName = 'site-dynamic-v2';
const assets = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/pages/fallback.html'
];

// cache size limit function
const limitCacheSize = (cacheName, size) => {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(cacheName, size))
            }
        })
    })
}

// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate eventtt
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
        console.log('keys', keys);
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  )
  //console.log('service worker activated');
});

// fetch event
self.addEventListener('fetch', evt => {
  //console.log('fetch event', evt);
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(dynamicCacheName).then(cache => {
          cache.put(evt.request.url, fetchRes.clone());
          limitCacheSize(dynamicCacheName, 3);
          return fetchRes
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1) {
          return caches.match('/pages/fallback.html');
        }
      })
    })
  );
});