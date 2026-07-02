/* ============================================================
 *  Service Worker — Inventario Hazmat (PWA)
 *  - Cachea el "app shell" para poder abrir la app sin conexión.
 *  - NUNCA cachea las llamadas al servidor de datos (Apps Script):
 *    esas van siempre a la red; los datos se cachean aparte en la
 *    propia app (localStorage).
 *  Sube la versión (CACHE) cada vez que cambies index.html.
 * ============================================================ */
const CACHE = 'hazmat-v9';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

// Instala y precachea el shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

// Limpia versiones antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function esApiDatos(url) {
  return url.hostname.includes('script.google.com') ||
         url.hostname.includes('script.googleusercontent.com') ||
         url.hostname.includes('drive.google.com') ||
         url.hostname.includes('googleusercontent.com');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // no tocar POST (guardados)
  const url = new URL(req.url);

  // Datos y fotos de Google: siempre a la red, sin cachear
  if (esApiDatos(url)) return;

  // Navegación (abrir la app): red primero, si falla → index cacheado
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Scripts de CDN (tailwind, heic2any): stale-while-revalidate
  if (url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }

  // Resto (iconos, shell): cache primero, red de reserva
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && url.origin === self.location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
