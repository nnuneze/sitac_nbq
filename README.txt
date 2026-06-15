═══════════════════════════════════════════════════════════════
 SITAC NBQ — Visor Operativo (PWA)
 Estructura de archivos y despliegue
═══════════════════════════════════════════════════════════════

CONTENIDO DEL PAQUETE
  index.html      Aplicación completa (HUD, análisis, mapa, log, meteo…)
  manifest.json   Manifiesto PWA (nombre, iconos, color, standalone)
  sw.js           Service Worker v10 (funcionamiento offline)
  icono-192.png   Icono PWA 192×192
  icono-512.png   Icono PWA 512×512 (any + maskable)

DESPLIEGUE
  1. Sube los 5 archivos JUNTOS a la raíz (o a una misma carpeta)
     de cualquier servidor con HTTPS:
        · GitHub Pages  · Netlify  · Vercel  · servidor propio
     ⚠ El Service Worker y el GPS SOLO funcionan bajo HTTPS
       (o en http://localhost para pruebas).

  2. Abre la URL en el móvil → menú del navegador →
     "Añadir a pantalla de inicio". Se instala como app.

OFFLINE
  · El shell de la app y Leaflet quedan precargados al instalar.
  · Las teselas de mapa se guardan al navegarlas CON cobertura:
    recorre la zona de intervención en el mapa antes de perder señal.
  · La meteo automática requiere red (nunca se sirve caducada);
    sin cobertura, introduce el viento a mano.

ACTUALIZACIONES
  Al cambiar index.html, edita sw.js y sube la versión:
     const CACHE = "sitac-nbq-v11";   ← incrementar
  El SW antiguo se limpia solo en la siguiente visita.
