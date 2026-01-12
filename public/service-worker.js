const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `ruang360-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ruang360-dynamic-${CACHE_VERSION}`;

// Assets to precache on install
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/Logo/Logo_Ruang360.webp',
    '/Logo/Logo_Ruang360.ico',
    '/Hero/photo_hero.avif',
];

// Install - Precache critical assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Precaching critical assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// Activate - Cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch - Caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests (except fonts)
    if (!url.origin.includes(self.location.origin) &&
        !url.hostname.includes('fonts.googleapis.com') &&
        !url.hostname.includes('fonts.gstatic.com')) {
        return;
    }

    // Strategy selection based on request type
    if (isStaticAsset(url)) {
        // Cache-first for static assets (images, fonts, CSS, JS with hash)
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isHtmlRequest(request)) {
        // Network-first for HTML (always try to get fresh)
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } else if (isApiRequest(url)) {
        // Network-first for API calls
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } else {
        // Stale-while-revalidate for everything else
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    }
});

// Helper: Identify static assets
function isStaticAsset(url) {
    const staticExts = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.ico', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'];
    return staticExts.some(ext => url.pathname.endsWith(ext)) ||
        url.pathname.includes('/assets/') ||
        url.pathname.includes('/js/') ||
        url.hostname.includes('fonts.');
}

// Helper: Identify HTML requests
function isHtmlRequest(request) {
    return request.headers.get('accept')?.includes('text/html') ||
        request.mode === 'navigate';
}

// Helper: Identify API requests
function isApiRequest(url) {
    return url.pathname.startsWith('/api/') ||
        url.hostname.includes('supabase');
}

// Strategy: Cache-first (for static assets)
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW] Cache-first fetch failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Strategy: Network-first (for HTML and API)
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW] Network-first fallback to cache');
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        // Return offline page for navigation requests
        if (isHtmlRequest(request)) {
            return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
    }
}

// Strategy: Stale-while-revalidate
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Fetch in background regardless
    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);

    // Return cached immediately if available, otherwise wait for network
    return cached || fetchPromise || new Response('Offline', { status: 503 });
}

// Listen for messages from client (e.g., skip waiting)
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
