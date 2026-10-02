import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, drawFn) {
  // Búfer RGBA sin comprimir
  const rowSize = width * 4 + 1; // 1 byte de filtro por cada línea de escaneo
  const buffer = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filtro: Ninguno
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[pixelOffset] = r;
      buffer[pixelOffset + 1] = g;
      buffer[pixelOffset + 2] = b;
      buffer[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(buffer);

  // Firma estándar de archivo PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Fragmento IHDR (información de cabecera)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profundidad de bits
  ihdr[9] = 6; // tipo de color RGBA
  ihdr[10] = 0; // método de compresión
  ihdr[11] = 0; // método de filtrado
  ihdr[12] = 0; // método de entrelazado
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Fragmento IDAT (datos comprimidos)
  const idatChunk = makeChunk('IDAT', compressedData);

  // Fragmento IEND (fin de archivo)
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Asegurar que el directorio public existe
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Dibujar un icono estilizado de código QR moderno con degradado índigo a violeta y módulos blancos
function qrDraw(x, y, w, h, isMaskable = false) {
  const normX = x / w;
  const normY = y / h;

  // Degradado de fondo: #4f46e5 (79, 70, 229) a #7c3aed (124, 58, 237)
  const rBg = Math.round(79 + (124 - 79) * normY);
  const gBg = Math.round(70 + (58 - 70) * normY);
  const bBg = Math.round(229 + (237 - 229) * normY);

  // Margen para icono enmascarable (la zona segura está dentro del 80% circular)
  const margin = isMaskable ? 0.2 : 0.12;
  if (normX < margin || normX > 1 - margin || normY < margin || normY > 1 - margin) {
    return [rBg, gBg, bBg, 255];
  }

  // Cuadrícula local interna: 7x7 módulos
  const innerX = (normX - margin) / (1 - 2 * margin);
  const innerY = (normY - margin) / (1 - 2 * margin);

  const col = Math.floor(innerX * 7);
  const row = Math.floor(innerY * 7);

  // Patrón QR con 3 patrones de detección (sup-izq, sup-der, inf-izq) y elementos centrales
  // Detección de patrones de búsqueda (ojos):
  const isTLFinder = row <= 2 && col <= 2;
  const isTRFinder = row <= 2 && col >= 4;
  const isBLFinder = row >= 4 && col <= 2;

  let isDark = false;
  if (isTLFinder || isTRFinder || isBLFinder) {
    const localR = isBLFinder ? row - 4 : row;
    const localC = isTRFinder ? col - 4 : col;
    // Anillo exterior 3x3 o punto central
    if (localR === 0 || localR === 2 || localC === 0 || localC === 2) {
      isDark = true;
    } else if (localR === 1 && localC === 1) {
      isDark = true;
    }
  } else {
    // Módulos decorativos
    const pattern = [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 0, 1, 1, 1, 0, 1],
      [0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 1, 0, 1, 0]
    ];
    if (pattern[row] && pattern[row][col]) {
      isDark = true;
    }
  }

  // Añadir estética sutil de módulos con contraste
  if (isDark) {
    return [255, 255, 255, 255];
  } else {
    return [rBg, gBg, bBg, 255];
  }
}

// Generar iconos PNG
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => qrDraw(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => qrDraw(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => qrDraw(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => qrDraw(x, y, w, h, false)));

console.log('PWA icons successfully generated in public/');
