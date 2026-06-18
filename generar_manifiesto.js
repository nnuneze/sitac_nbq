/**
 * @file generar_manifiesto.js — Generador de huellas digitales criptográficas
 * @copyright (c) 2026 Nabil Núñez. Todos los derechos reservados.
 *
 * Genera un manifiesto SHA-256 de los archivos críticos de SITAC NBQ.
 * Sirve como prueba matemática de integridad y autoría en una fecha concreta,
 * útil para depósito notarial o registro en plataformas como Safe Creative.
 *
 * USO:  node generar_manifiesto.js
 *       (ejecutar desde la carpeta que contiene los archivos del proyecto)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Archivos clave de la aplicación SITAC NBQ.
const ARCHIVOS_CRITICOS = [
    'index.html',
    'sw.js',
    'manifest.json',
    'Manual_SITAC_NBQ.docx'
];
const TITULAR = 'Nabil Núñez';
const OUTPUT_FILE = 'MANIFIESTO_PROPIEDAD_INTELECTUAL.txt';

let manifiesto = '';
manifiesto += '=========================================================\n';
manifiesto += 'MANIFIESTO DE HUELLAS DIGITALES CRIPTOGRÁFICAS — SITAC NBQ\n';
manifiesto += 'Visor Táctico de Emergencias Tecnológicas · Versión 1.0.0\n';
manifiesto += `Fecha de Generación: ${new Date().toISOString()}\n`;
manifiesto += `Titular de Derechos: ${TITULAR}\n`;
manifiesto += '© 2026 ' + TITULAR + '. Todos los derechos reservados.\n';
manifiesto += '=========================================================\n\n';

let encontrados = 0;
ARCHIVOS_CRITICOS.forEach(archivo => {
    const ruta = path.join(__dirname, archivo);
    if (fs.existsSync(ruta)) {
        const datos = fs.readFileSync(ruta);
        const hash = crypto.createHash('sha256').update(datos).digest('hex');
        const bytes = datos.length;
        manifiesto += `Archivo: ${archivo}\n`;
        manifiesto += `Tamaño: ${bytes} bytes\n`;
        manifiesto += `SHA-256: ${hash}\n`;
        manifiesto += '---------------------------------------------------------\n';
        encontrados++;
    } else {
        manifiesto += `Archivo: ${archivo}  (NO ENCONTRADO en esta carpeta)\n`;
        manifiesto += '---------------------------------------------------------\n';
    }
});

manifiesto += `\nTotal de archivos con huella: ${encontrados} de ${ARCHIVOS_CRITICOS.length}\n`;
manifiesto += '\nNota: cualquier alteración posterior de un archivo cambiará su huella\n';
manifiesto += 'SHA-256, lo que permite demostrar la integridad de esta versión.\n';

fs.writeFileSync(path.join(__dirname, OUTPUT_FILE), manifiesto);
console.log(`✅ ${OUTPUT_FILE} generado con ${encontrados} huella(s). Adjúntalo a tu documentación de registro.`);
