const CACHE_NAME = 'fittrack-cache-v4';
const IMAGE_BASE_NAMES = [
  'about-fitness',
  'almonds',
  'avocado',
  'banana',
  'brown-rice',
  'chicken',
  'eggs',
  'greek-yogurt',
  'oats',
  'salmon',
  'spinach'
];

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index-backup.html',
  '/app.html',
  '/about.html',
  '/distance.html',
  '/nutrition.html',
  '/profile.html',
  '/progress.html',
  '/quotes.html',
  '/settings.html',
  '/steps.html',
  '/test-name-feature.html',
  '/water.html',
  '/weekly.html',
  '/style.css',
  '/app.js',
  '/router.js',
  '/theme.js',
  '/user-name.js',
  '/index.js',
  '/steps.js',
  '/weekly.js',
  '/water.js',
  '/quotes.js',
  '/profile.js',
  '/progress.js',
  '/settings.js',
  '/distance.js',
  ...IMAGE_BASE_NAMES.flatMap((name) => [`/images/${name}.webp`, `/images/${name}.jpg`])
];

async function cacheStaticAssets() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(STATIC_ASSETS);
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    cacheStaticAssets().then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => (key === CACHE_NAME ? undefined : caches.delete(key)))))
      .then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      cacheFirst(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(cacheFirst(request));
});