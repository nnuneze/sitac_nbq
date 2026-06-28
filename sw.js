/**
 * @file SITAC NBQ — Visor Táctico de Emergencias Tecnológicas (Service Worker)
 * @version 1.0.0
 * @author Nabil Núñez
 * @copyright (c) 2026 Nabil Núñez. Todos los derechos reservados.
 *
 * AVISO DE PROPIEDAD INTELECTUAL Y CONFIDENCIALIDAD:
 * Este programa informático, incluyendo su código fuente, arquitectura de datos,
 * algoritmos de dispersión y reanálisis vectorial, interfaces y lógicas asociadas,
 * está protegido por la legislación nacional e internacional de Propiedad Intelectual.
 * Queda estrictamente prohibida la copia, reproducción, distribución, comunicación
 * pública, ingeniería inversa, descifrado o transformación total o parcial de este
 * código sin el consentimiento expreso y por escrito del titular de los derechos.
 */
/* SITAC NBQ — Service Worker v14
   Permite el uso OFFLINE de la aplicación (crítico en intervención sin cobertura).

   Estrategias por tipo de recurso:
   · APP SHELL (html, manifest, iconos, Leaflet CDN) → cache-first (precargado en la instalación)
   · TESELAS DE MAPA (OSM / Esri)                    → network-first con caché de respaldo:
       las zonas ya visitadas con cobertura quedan disponibles sin red.
   · API METEO (Open-Meteo)                          → solo red, nunca caché:
       un dato de viento antiguo es peor que ninguno; si falla, la app
       ya gestiona el error y pide introducción manual.

   Si cambias de versión, sube CACHE y TILES. */

const CACHE = "sitac-nbq-v51";
const TILES = "sitac-tiles-v1";
const TILES_MAX = 600;          // límite de teselas guardadas (~30-40 MB)

const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png",
  // Leaflet desde CDN — imprescindible para el mapa táctico offline
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// ── Instalación: precarga el shell ───────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// ── Activación: limpia versiones antiguas ────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== TILES)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Utilidades ───────────────────────────────────────────────────────────────
function esTesela(url) {
  return url.hostname.endsWith("tile.openstreetmap.org") ||
         url.hostname === "server.arcgisonline.com";
}

function esApiMeteo(url) {
  return url.hostname === "api.open-meteo.com";
}

// Proveedores de elevación (terreno estático → cache-first para uso offline)
function esApiElevacion(url) {
  return url.hostname === "api.open-meteo.com" && url.pathname.includes("/elevation")
      || url.hostname === "api.opentopodata.org"
      || url.hostname === "api.open-elevation.com";
}

// Recorta la caché de teselas para no crecer sin límite
async function podarTeselas() {
  const cache = await caches.open(TILES);
  const keys = await cache.keys();
  if (keys.length > TILES_MAX) {
    // elimina las más antiguas (FIFO aproximado)
    const sobrantes = keys.length - TILES_MAX;
    for (let i = 0; i < sobrantes; i++) await cache.delete(keys[i]);
  }
}

// ── Fetch: enruta cada petición a su estrategia ──────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1) Elevación (cualquier proveedor): cache-first (el terreno no cambia).
  if (esApiElevacion(url)) {
    event.respondWith(
      caches.match(event.request).then(c => c || fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(TILES).then(cc => cc.put(event.request, copy)).catch(()=>{});
        return resp;
      }))
    );
    return;
  }

  // 1b) Resto de API meteo: SOLO red. Nunca servir viento/temperatura caducados.
  if (esApiMeteo(url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2) Teselas de mapa: network-first, respaldo en caché propia con poda.
  if (esTesela(url)) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(TILES)
            .then((c) => c.put(event.request, copy))
            .then(podarTeselas)
            .catch(() => {});
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3) Resto (shell + Leaflet + cualquier GET): cache-first con relleno.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(() => {});
        return resp;
      }).catch(() => cached);
    })
  );
});
