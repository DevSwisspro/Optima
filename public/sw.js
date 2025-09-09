// OPTIMA - Service Worker pour PWA
// Fonctionnalités offline et cache intelligent

const CACHE_NAME = 'optima-v1.0.0'
const STATIC_CACHE_NAME = 'optima-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'optima-dynamic-v1.0.0'

// Ressources statiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        return self.clients.claim()
      })
  )
})

// Stratégie de cache : Cache First pour les assets, Network First pour les API
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return

  // Stratégie pour les API Supabase (Network First)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Stratégie pour les assets statiques (Cache First)
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Stratégie pour les pages HTML (Network First avec fallback)
  event.respondWith(networkFirstWithFallback(request))
})

// Stratégie Cache First (pour les assets)
async function cacheFirstStrategy(request) {
  try {
    const cacheResponse = await caches.match(request)
    if (cacheResponse) {
      return cacheResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Cache first failed:', error)
    // Fallback pour les images
    if (request.destination === 'image') {
      return new Response('', { status: 200, statusText: 'OK' })
    }
    throw error
  }
}

// Stratégie Network First (pour les API)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network first fallback to cache:', error)
    const cacheResponse = await caches.match(request)
    
    if (cacheResponse) {
      return cacheResponse
    }
    
    // Retourner une réponse d'erreur JSON pour les API
    return new Response(
      JSON.stringify({ error: 'Offline - données non disponibles' }), 
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Stratégie Network First avec fallback (pour les pages)
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error)
    const cacheResponse = await caches.match(request)
    
    if (cacheResponse) {
      return cacheResponse
    }
    
    // Fallback vers la page principale en cache
    const fallbackResponse = await caches.match('/')
    if (fallbackResponse) {
      return fallbackResponse
    }
    
    // Page d'erreur offline
    return new Response(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OPTIMA - Offline</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #0f0f0f; 
            color: #fff;
            text-align: center;
          }
          .offline { 
            padding: 2rem; 
            background: #1f1f1f; 
            border-radius: 12px; 
            border: 1px solid #dc2626;
          }
          h1 { color: #dc2626; margin-bottom: 1rem; }
          p { opacity: 0.8; margin-bottom: 1.5rem; }
          button { 
            padding: 12px 24px; 
            background: #dc2626; 
            color: white; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer;
            font-size: 16px;
          }
          button:hover { background: #b91c1c; }
        </style>
      </head>
      <body>
        <div class="offline">
          <h1>📱 OPTIMA</h1>
          <p>Vous êtes hors ligne</p>
          <p>Reconnectez-vous à Internet pour accéder à vos données.</p>
          <button onclick="window.location.reload()">🔄 Réessayer</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Notifications push (optionnel)
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body || 'Nouveau message OPTIMA',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icons/action-dismiss.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'OPTIMA', options)
  )
})

// Gestion des clics sur notifications
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('[SW] OPTIMA Service Worker loaded successfully')