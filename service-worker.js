// v2: cambiare il nome della cache forza l'aggiornamento dell'app installata
const CACHE_NAME = 'jumplab-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  // ogni file è cacheato singolarmente: se manca un'icona l'installazione non fallisce
  e.waitUntil(caches.open(CACHE_NAME).then((c) => Promise.all(ASSETS.map((a) => c.add(a).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// pagina: prima la rete (così ricevi subito le correzioni), cache se offline
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
