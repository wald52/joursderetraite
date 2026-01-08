// Service worker pour l'application PWA

const CACHE_NAME = 'joursderetraite-v3'; // Mise à jour du numéro de version
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icone_retraite.svg',
  '/icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker installé et tous les fichiers sont mis en cache');
        return self.skipWaiting(); // Force l'activation immédiate
      })
      .catch(error => {
        console.error('Erreur lors de l\'installation du service worker:', error);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression du cache ancien:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activé');
      return self.clients.claim(); // Prend le contrôle immédiatement
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  // Vérifie si l'utilisateur est en ligne
  if (navigator.onLine) {
    // En ligne : essaie d'abord le réseau, puis le cache
    event.respondWith(
      fetch(event.request).then(response => {
        // Si la requête a réussi, met à jour le cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Si le réseau échoue, utilise le cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // En dernier recours, essaye de trouver dans le cache
          return caches.match('/');
        });
      })
    );
  } else {
    // Hors ligne : utilise le cache
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // En dernier recours, essaye de trouver dans le cache
        return caches.match('/');
      })
    );
  }
});