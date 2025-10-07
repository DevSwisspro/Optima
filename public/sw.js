// Service Worker pour Optima PWA
// IMPORTANT: Incrémenter ces versions à chaque déploiement pour forcer la mise à jour
const CACHE_NAME = 'optima-v2025-10-07T15-55-59';
const STATIC_CACHE = 'optima-static-v2025-10-07T15-55-59';
const DYNAMIC_CACHE = 'optima-dynamic-v2025-10-07T15-55-59';

// Fichiers à mettre en cache immédiatement
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs d'API à ne pas mettre en cache
const SKIP_CACHE_URLS = [
  'api.themoviedb.org',
  'graphql.anilist.co',
  'supabase'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation en cours...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cache statique créé');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation terminée');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation en cours...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Service Worker: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Stratégie de cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne pas mettre en cache les APIs externes
  const shouldSkipCache = SKIP_CACHE_URLS.some(skipUrl =>
    url.hostname.includes(skipUrl)
  );

  if (shouldSkipCache) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Stratégie Cache First pour les assets statiques
  if (event.request.destination === 'image' ||
      event.request.destination === 'script' ||
      event.request.destination === 'style') {

    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request).then((fetchResponse) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          });
        })
    );
    return;
  }

  // Stratégie Network First pour les pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache les réponses réussies
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback vers le cache en cas d'échec réseau
        return caches.match(event.request)
          .then((response) => {
            return response || caches.match('/index.html');
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notification de mise à jour disponible
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({version: CACHE_NAME});
  }
});