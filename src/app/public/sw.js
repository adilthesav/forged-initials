// Service Worker for Forged Initials
// Provides caching, offline support, and performance improvements

const CACHE_VERSION = 'v1';
const CACHE_NAME = `forged-initials-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/globals.css',
  '/styles/mobile-optimizations.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Service worker installed');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls and Stripe
  if (
    url.pathname.includes('/server/') ||
    url.hostname.includes('stripe.com') ||
    url.hostname.includes('supabase')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        // Fetch in background to update cache
        fetchAndCache(request);
        return cachedResponse;
      }

      // Fetch from network and cache
      return fetchAndCache(request);
    }).catch((error) => {
      console.error('[SW] Fetch error:', error);
      
      // Return offline page for HTML requests
      if (request.headers.get('accept').includes('text/html')) {
        return caches.match('/offline.html').then((response) => {
          return response || new Response('Offline', { status: 503 });
        });
      }
      
      throw error;
    })
  );
});

// Helper function to fetch and cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      
      // Clone response before caching
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    throw error;
  }
}

// Background sync for offline order submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  console.log('[SW] Syncing offline orders...');
  // Implementation would sync any orders stored in IndexedDB
  // while the user was offline
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification from Forged Initials',
    icon: '/favicon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Forged Initials',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Message handler for cache control
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return caches.open(CACHE_NAME);
      })
    );
  }
});

console.log('[SW] Service worker script loaded');
