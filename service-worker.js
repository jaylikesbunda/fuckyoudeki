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
  '/firebaseInit.js',
  '/assets/images/folder-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
