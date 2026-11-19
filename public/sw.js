const CACHE_NAME = 'nfc-tag-manager-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// Install — cache shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache (same-origin HTTP(S) GET only)
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    let url;
    try {
        url = new URL(req.url);
    } catch {
        return;
    }

    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(req)
            .then((response) => {
                if (response && response.ok && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
                }
                return response;
            })
            .catch(() => caches.match(req))
    );
});
