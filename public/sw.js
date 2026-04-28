const CACHE_NAME = 'nutrack-v1';
const RUNTIME_CACHE = 'nutrack-runtime-v1';
const ASSETS_CACHE = 'nutrack-assets-v1';
const API_CACHE = 'nutrack-api-v1';

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/diary',
  '/history',
  '/profile',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching precache assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.log('[SW] Some precache assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== ASSETS_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Auth routes - always network (never cache)
  if (url.pathname.includes('/api/auth')) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => new Response(JSON.stringify({ error: 'Offline' }), { status: 503 }))
    );
    return;
  }

  // API routes - network first, fallback to cache
  // NEVER cache search/barcode endpoints (they have dynamic data)
  if (url.pathname.includes('/api/foods/search') || url.pathname.includes('/api/foods/barcode')) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ error: 'Offline' }), { status: 503 })));
    return;
  }

  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, clone).catch(() => {});
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('[SW] Returning cached API response for:', url.pathname);
              return cached;
            }
            return new Response(JSON.stringify({ error: 'No cached data available' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // HTML pages - network first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return offline page if available
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Assets (JS, CSS, images) - cache first, fallback to network
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/icons/') ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(ASSETS_CACHE).then((cache) => {
              cache.put(request, clone);
            });
            return response;
          })
          .catch(() => {
            // Return placeholder for images
            if (request.destination === 'image') {
              return new Response(
                `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect fill="#f0f0f0" width="100" height="100"/></svg>`,
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
          });
      })
    );
    return;
  }

  // Default - network first
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Handle background sync for offline changes
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  if (event.tag === 'sync-diary') {
    event.waitUntil(syncDiary());
  }
  if (event.tag === 'sync-foods') {
    event.waitUntil(syncFoods());
  }
});

async function syncDiary() {
  console.log('[SW] Syncing diary entries...');
  try {
    const response = await fetch('/api/diary');
    if (!response.ok) throw new Error('Sync failed');
    console.log('[SW] Diary sync successful');
  } catch (err) {
    console.error('[SW] Diary sync error:', err);
    throw err;
  }
}

async function syncFoods() {
  console.log('[SW] Syncing foods...');
  try {
    const response = await fetch('/api/foods');
    if (!response.ok) throw new Error('Sync failed');
    console.log('[SW] Foods sync successful');
  } catch (err) {
    console.error('[SW] Foods sync error:', err);
    throw err;
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});
