# SITAC NBQ — Resumen del desarrollo

Recopilación de todo lo que hemos ido implementando en la aplicación **SITAC NBQ** (herramienta táctica de apoyo a la decisión para emergencias NBQ y mercancías peligrosas), desde el inicio hasta hoy. El desarrollo se ha hecho de forma iterativa sobre un único archivo `index.html`, más un manual en Word y el paquete PWA para publicar en GitHub Pages.

---

## 1. Meteorología automática y modelo de viento

- Conexión a una **API meteorológica gratuita** (Open-Meteo) que, con la posición GPS, descarga automáticamente viento, temperatura, humedad, presión y visibilidad, y traza la pluma sin teclear nada.
- **Refresco automático cada 15 minutos** que actualiza meteo, pluma y registro.
- Corrección de errores del módulo (parámetros de la API, función `degToCard`, volcado de datos).
- La meteorología quedó separada en **su propia pantalla**, sin duplicarse en otras.

## 2. Identificación de sustancias por número ONU

- Módulo que, introduciendo el **número ONU**, obtiene las propiedades fisicoquímicas, activa los sensores adecuados y calcula a partir de sus mediciones.
- Teclado a pantalla completa para introducir el ONU.
- Base de datos ampliada con las **15 mercancías peligrosas más frecuentes** transportadas por carretera, con propiedades fisicoquímicas y presión de transporte.
- Añadido el **ONU 1831 (óleum / ácido sulfúrico fumante)**, distinguiéndolo del 1830 (ácido sulfúrico común) por su volatilidad y emisión de SO₃.

## 3. Sensores y sensibilidad cruzada

- Modelización del **detector MPS** y sus limitaciones con vapores (gasolina, etc.), con las concentraciones esperadas en cada celda.
- Investigación de los gases que el MPS puede detectar según fuentes de prestigio y experiencia de bomberos, e incorporación de esas sustancias con sus ONU.
- **Corrección importante:** el MPS mide explosividad en **% LEL** (con alarmas A1 al 20% y A2 al 40%), no en ppm. Se reescribió todo ese canal para trabajar en % LEL.
- Lógica de **sensibilidad cruzada**: cuando hay ONU identificado pero no hay sensor específico, se indica la probabilidad de que el producto se corrobore por sensibilidad cruzada y las ppm esperadas en cada sensor.

## 4. Modelo físico de dispersión de la pluma

- Modelo dinámico completo de dispersión integrado con **topografía** (modelo digital de elevaciones).
- **Vista de planta y perfil** de la pluma en el mismo cuadro dividido (planta a la izquierda, perfil a la derecha), con la altura de la nube en función del tiempo y la sustancia (envolvente vertical ≈ 2·σz, corregida por densidad).
- Para fugas a presión, el perfil refleja la **subida inicial del chorro** y su evolución según densidad y temperatura.
- **El terreno modifica planta y perfil**: los gases densos que se comportan como líquidos siguen el relieve, se asientan en las depresiones y se ensanchan o estrechan según el terreno.
- Cuadrícula de elevación **dimensionada al alcance de la pluma en 30 minutos** según el viento (con corrección de los problemas de carga del DEM: límites de URL, número de puntos y detección de red poco fiable).
- Rastro de la **evolución de la nube sobre la cartografía**, autozoom según la pluma y actualización del log.
- Integración con la huella de **ALOHA** (importación combinada A+B).

## 5. Estimación de concentración sin lectura directa

- Cálculo de las **ppm a partir del derrame** cuando no hay lectura de sensor.
- **Corrección del método** (clave): se pasó de un modelo gaussiano inverso a un enfoque físico anclado en la **volatilidad → fracción en volumen → dilución en el aire → ppm**, con tope de saturación. Distingue evaporación de charco frente a fuga a presión y toma el mecanismo dominante.
- Corrección de la **presión de transporte**: la marca la sustancia, no el contenedor (esto arregló ppm desorbitadas del ácido sulfúrico).
- La estimación usa la **temperatura y el viento reales** de la meteo (afectan a la volatilidad), con indicación clara del origen del dato (real / manual / por defecto) y botón de captura de meteo en el propio paso.
- Para **sustancias inflamables**: del % en volumen se calcula el **% LEL** (con la tabla de LEL de cada sustancia) y se contrasta con A1 (20%) y A2 (40%) para determinar el nivel de intervención. Ese resultado se **respeta y arrastra** al cuadro de mando sin saltar al peor escenario.

## 6. Asistente guiado (wizard) y flujo de la app

- **Asistente paso a paso** para lanzar una intervención, rediseñado varias veces hasta quedar en **6 pasos**: sustancia → meteo → riesgo/reacciones → equipos y lecturas → sector/actividad → modelo de dispersión, con un único botón de avance.
- Paso de **equipos y lecturas** completo: configuración de detectores y mediciones, y si ningún sensor puede medir la sustancia identificada, se indica y se ofrece la estimación.
- **Estimación por orificio y tiempo de fuga** o por diámetro de charco, con campo de distancia detector-foco, que se vuelca a la Zonificación táctica (escenario ERG).
- Desplegable del **tipo de envase / almacenamiento / transporte** (reacciona con la cisterna, las conducciones, etc.).
- Selección de **sector / actividad**, incluyendo **transporte por carretera/ferrocarril (ADR/RID)**.
- Acordeones para trabajar cómodamente en el **móvil**, eliminando el scroll en pantallas largas.
- El botón "Analizar atmósfera" pasa directamente al **Cuadro de Mando**.

## 7. Cuadro de Mando y pantallas de operación

- **Pantalla de inicio** tras "Empezar" con cuatro accesos: Nueva intervención, Cuadro de Mando, Compartir y Guía (la guía rápida pasó a su propia pantalla).
- **Cuadro de Mando** (antes "Operación") con botones grandes por área: Meteo, Análisis, Zonas, Mapa, Orden, Registro.
- **Indicador de estado tipo semáforo** en cada icono: verde (completo), ámbar (acción pendiente), rojo (sin datos).
- **Resumen superior** con semáforo de nivel y dictamen táctico.
- Botón **atrás** de cada área vuelve siempre al Cuadro de Mando.
- **Dos botones de Fichas ERG** (incendio y derrame) con la guía de intervención de la sustancia activa.
- Deduplicación de datos entre pantallas (cada dato vive en un solo sitio).

## 8. Reanálisis y zonificación

- **Reanálisis de 4 vías**: por nueva lectura de sensor, por charco, por fuga, y por forzado de la meteorología.
- Zonificación táctica con escenario ERG, perímetros y evolución dinámica.

## 9. Compartir y exportar

- Panel de **compartir el dictamen**: copiar, WhatsApp, SMS, y enlace COP (imagen operativa codificada en la URL, sin servidor).
- **Informe PDF** con dictamen, cuadro de mando y la cartografía de la pluma (planta y perfil).
- Pantalla de compartir reorganizada para que **quepa todo sin scroll**.

## 10. Niveles de riesgo y dictamen

- Cuadro de mando tipo **semáforo** con niveles de riesgo basados en umbrales **EPA AEGL** (toxicidad) y **% LEL / ATEX** (explosividad).
- Dictamen táctico con EPI recomendado y acciones, bajo criterio de máxima restricción ante incertidumbre.
- Eliminado el módulo de ERA y la presentación PowerPoint (que existieron en versiones intermedias).

## 11. Documentación y publicación

- **Manual de usuario en Word** mantenido y actualizado a lo largo del desarrollo (≈398 párrafos, 13 secciones).
- Aplicación empaquetada como **PWA instalable** (manifest, service worker con caché offline, iconos) para publicar en **GitHub Pages**.
- Guía para publicar y actualizar el repositorio por la web.

## 12. Validación y honestidad técnica

- A lo largo del proyecto se han hecho **pruebas numéricas** de los modelos físicos y comparativas de tiempos de intervención con y sin la herramienta.
- Discusión honesta sobre el **alcance del modelo** (estimación de gabinete orientativa, distancia respecto a un CFD o modelo de jet validado tipo HGSYSTEM) y advertencias de que no sustituye la confirmación de campo ni el criterio del mando.

---

*Nota: este resumen recoge las funcionalidades principales solicitadas e implementadas. Cada una incluyó además numerosas correcciones, validaciones y ajustes finos durante el desarrollo iterativo.*
