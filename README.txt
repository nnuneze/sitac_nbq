═══════════════════════════════════════════════════════════════
 SITAC NBQ — Visor Operativo (PWA)
 Estructura de archivos y despliegue
═══════════════════════════════════════════════════════════════

ARCHIVOS DE LA APLICACIÓN (subir JUNTOS a la raíz del servidor)
  index.html      Aplicación completa (asistente, análisis, zonas,
                  mapa, meteo, orden GOM, registro y bibliografía)
  manifest.json   Manifiesto PWA (nombre, iconos, color, standalone)
  sw.js           Service Worker (funcionamiento offline)
  icono-192.png   Icono PWA 192×192
  icono-512.png   Icono PWA 512×512 (any + maskable)

DOCUMENTACIÓN Y LICENCIA (no se sirven a la app, son material de apoyo)
  Manual_SITAC_NBQ.docx              Manual de usuario y referencia técnica
  README.txt                         Este archivo
  LICENSE.txt                        Licencia
  MANIFIESTO_PROPIEDAD_INTELECTUAL.txt   Declaración de autoría
  generar_manifiesto.js              Utilidad para regenerar el manifiesto

DESPLIEGUE
  1. Sube los 5 archivos de la aplicación JUNTOS a la raíz (o a una
     misma carpeta) de cualquier servidor con HTTPS:
        · GitHub Pages  · Netlify  · Vercel  · servidor propio
     ⚠ El Service Worker, el GPS y la brújula SOLO funcionan bajo HTTPS
       (o en http://localhost para pruebas).

  2. Abre la URL en el móvil → menú del navegador →
     "Añadir a pantalla de inicio". Se instala como app independiente.

OFFLINE
  · El shell de la app y Leaflet quedan precargados al instalar.
  · Las teselas de mapa se guardan al navegarlas CON cobertura:
    recorre la zona de intervención en el mapa antes de perder señal.
  · El modelo de elevación (topografía/DEM) también se cachea.
  · La meteo automática requiere red (nunca se sirve caducada);
    sin cobertura, introduce el viento a mano.

ACTUALIZACIONES
  Al cambiar index.html, edita sw.js y sube la versión de caché:
     const CACHE = "sitac-nbq-v45";   ← incrementar en cada cambio
  Si no se incrementa, las apps ya instaladas seguirán sirviendo el
  HTML cacheado antiguo. El SW antiguo se limpia solo en la siguiente visita.

NOVEDADES DE ESTA VERSIÓN (junio 2026)
  · Base de 76 sustancias (alta del difluoruro de oxígeno, OF₂, UN 2190).
  · Predominio del Nº ONU: la identificación documental manda sobre la
    inferencia de firma; una lectura cruzada se atribuye a la sustancia
    identificada (no propone otra sustancia distinta).
  · Modelo de dispersión corregido para gases licuados a presión
    (Cl₂, NH₃, SO₂, H₂S, fosgeno, acetileno…): calculan concentración por
    chorro aunque no haya charco; los líquidos muy volátiles (HF, HCN, NO₂…)
    estiman el charco a partir de la fuga. Ningún tóxico da 0 con charco 0.
  · Asistente de 7 pasos más esquemático: indicador superior persistente
    (producto + detectores + detectabilidad 🟢🟡🔴 + concentración
    estimada/leída), autosaltos entre pasos y textos reducidos.
  · Cuadro de mando reordenado: Análisis · Zonas · Mapa · Meteo · Orden · Registro.
  · Pantalla de Zonas con resultados en primer plano y configuración en acordeón.
  · Mapa simplificado: botón único Ubicación (GPS ↔ Marcar) que carga
    cartografía y meteo del punto automáticamente; herramientas avanzadas
    (topografía, ALOHA) en acordeón.
  · Nueva pantalla de Bibliografía con las fuentes consolidadas.
