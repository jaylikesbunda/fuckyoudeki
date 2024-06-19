const CACHE_NAME = 'fuckyoudeki-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/responsive.css',
  '/script.js',
  '/terminalApp.js',
  '/snakeGame.js',
  '/responsive.js',
  '/paint_App.js',
  '/messagingApp.js',
  '/browserApp.js',
  '/deathPrediction.js',
  '/minesweeper.js',
  '/calendar.js',
  '/adventure.json',
  '/firebaseInit.js',
  '/assets/images/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to open cache or add resources during install', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Returning cached response for', event.request.url);
          return response;
        }
        console.log('Fetching from network', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch((error) => {
            console.error('Network fetch failed for', event.request.url, error);
            return caches.match('/index.html'); // Fall back to cached homepage for offline experience
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
