import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { QRStyleOptions, QRContentType, WifiData, VCardData, EmailData, WhatsAppData, CalendarData } from '../types/qr';

export function formatQRContent(
  type: QRContentType,
  data: {
    url?: string;
    text?: string;
    wifi?: WifiData;
    vcard?: VCardData;
    email?: EmailData;
    phone?: string;
    whatsapp?: WhatsAppData;
    calendar?: CalendarData;
  }
): string {
  switch (type) {
    case 'url': {
      let url = (data.url || '').trim();
      if (!url) return '';
      if (!/^https?:\/\//i.test(url) && !url.startsWith('//')) {
        url = 'https://' + url;
      }
      return url;
    }
    case 'text':
      return data.text || '';
    case 'wifi': {
      const w = data.wifi;
      if (!w || !w.ssid) return '';
      const enc = w.encryption || 'WPA';
      const hidden = w.hidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${escapeWifi(w.ssid)};P:${escapeWifi(w.password || '')};H:${hidden};;`;
    }
    case 'vcard': {
      const v = data.vcard;
      if (!v) return '';
      const fullName = `${v.firstName || ''} ${v.lastName || ''}`.trim();
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${v.lastName || ''};${v.firstName || ''};;;`,
        `FN:${fullName || 'Contacto'}`,
        v.company ? `ORG:${v.company}` : '',
        v.jobTitle ? `TITLE:${v.jobTitle}` : '',
        v.phone ? `TEL;TYPE=CELL:${v.phone}` : '',
        v.email ? `EMAIL:${v.email}` : '',
        v.website ? `URL:${v.website}` : '',
        v.address ? `ADR;TYPE=WORK:;;${v.address};;;;` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }
    case 'email': {
      const e = data.email;
      if (!e || !e.address) return '';
      const params = new URLSearchParams();
      if (e.subject) params.append('subject', e.subject);
      if (e.body) params.append('body', e.body);
      const queryString = params.toString();
      return `mailto:${e.address}${queryString ? '?' + queryString : ''}`;
    }
    case 'phone':
      return data.phone ? `tel:${data.phone.trim()}` : '';
    case 'whatsapp': {
      const wa = data.whatsapp;
      if (!wa || !wa.phoneNumber) return '';
      const cleanNum = wa.phoneNumber.replace(/[^0-9]/g, '');
      const query = wa.message ? `?text=${encodeURIComponent(wa.message)}` : '';
      return `https://wa.me/${cleanNum}${query}`;
    }
    case 'calendar': {
      const c = data.calendar;
      if (!c || !c.title) return '';
      const start = c.startDate ? toICalDate(c.startDate) : '';
      const end = c.endDate ? toICalDate(c.endDate) : '';
      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${c.title}`,
        start ? `DTSTART:${start}` : '',
        end ? `DTEND:${end}` : '',
        c.location ? `LOCATION:${c.location}` : '',
        c.description ? `DESCRIPTION:${c.description}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ]
        .filter(Boolean)
        .join('\n');
    }
    default:
      return '';
  }
}

function escapeWifi(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

function toICalDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch {
    return '';
  }
}

// Comprobar si un módulo forma parte de los 3 ojos/patrones de detección (7x7 en sup-izq, sup-der, inf-izq)
export function isFinderPattern(row: number, col: number, size: number): boolean {
  // Ojo superior izquierdo
  if (row < 7 && col < 7) return true;
  // Ojo superior derecho
  if (row < 7 && col >= size - 7) return true;
  // Ojo inferior izquierdo
  if (row >= size - 7 && col < 7) return true;
  return false;
}

// Renderizar el código QR en un lienzo con estilos personalizados, formas de módulo, colores y logo incrustado
export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  content: string,
  options: QRStyleOptions,
  renderSize = 1000
): Promise<void> {
  if (!content) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = renderSize;
      canvas.height = renderSize;
      ctx.fillStyle = options.bgColor || '#ffffff';
      ctx.fillRect(0, 0, renderSize, renderSize);
    }
    return;
  }

  // Forzar nivel 'H' si hay logo para máxima tolerancia a errores (30%)
  const ecLevel = options.logoDataUrl ? 'H' : options.errorCorrectionLevel || 'M';
  const qr = QRCode.create(content, {
    errorCorrectionLevel: ecLevel,
  });

  const moduleCount = qr.modules.size;
  const marginModules = options.margin ?? 3;
  const totalModules = moduleCount + marginModules * 2;
  const cellSize = renderSize / totalModules;

  canvas.width = renderSize;
  canvas.height = renderSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Limpiar y rellenar el fondo
  ctx.fillStyle = options.bgColor || '#ffffff';
  ctx.fillRect(0, 0, renderSize, renderSize);

  const offset = marginModules * cellSize;

  // Calcular la zona reservada del logo en coordenadas de módulo para colocarlo con una placa de fondo estilizada
  const logoPercent = (options.logoDataUrl ? options.logoSizePercent : 0) / 100;
  const logoPixelSize = renderSize * logoPercent;
  const logoModules = Math.ceil(logoPixelSize / cellSize);
  const centerModule = moduleCount / 2;
  const logoStartMod = Math.floor(centerModule - logoModules / 2);
  const logoEndMod = logoStartMod + logoModules;

  // Dibujar módulos del código QR
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = qr.modules.get(row, col);
      if (!isDark) continue;

      const isFinder = isFinderPattern(row, col, moduleCount);
      const x = offset + col * cellSize;
      const y = offset + row * cellSize;

      ctx.fillStyle = isFinder ? options.eyeColor || options.fgColor : options.fgColor;

      // Dibujo según la forma del módulo
      if (isFinder) {
        // Estilo para el patrón de los ojos
        drawEyeModule(ctx, x, y, cellSize, options.eyeShape);
      } else {
        // Estilo para los módulos de datos regulares
        drawBodyModule(ctx, x, y, cellSize, options.moduleShape);
      }
    }
  }

  // Dibujar el logo central si está especificado
  if (options.logoDataUrl) {
    try {
      const img = await loadImage(options.logoDataUrl);
      const centerX = renderSize / 2;
      const centerY = renderSize / 2;
      const size = renderSize * (options.logoSizePercent / 100);
      const halfSize = size / 2;
      const pad = (options.logoPadding ?? 8) * (renderSize / 400);

      const plateX = centerX - halfSize - pad;
      const plateY = centerY - halfSize - pad;
      const plateSize = size + pad * 2;

      // Dibujar la placa de fondo del logo
      if (options.logoBgShape !== 'none') {
        ctx.save();
        ctx.fillStyle = options.logoBgColor || '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 12 * (renderSize / 400);
        ctx.shadowOffsetY = 4 * (renderSize / 400);

        if (options.logoBgShape === 'circle') {
          ctx.beginPath();
          ctx.arc(centerX, centerY, plateSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (options.logoBgShape === 'rounded') {
          const radius = plateSize * 0.25;
          drawRoundedRect(ctx, plateX, plateY, plateSize, plateSize, radius);
          ctx.fill();
        } else {
          // cuadrado
          ctx.fillRect(plateX, plateY, plateSize, plateSize);
        }
        ctx.restore();
      }

      // Dibujar la imagen recortada según la forma del logo
      ctx.save();
      if (options.logoBgShape === 'circle') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, halfSize, 0, Math.PI * 2);
        ctx.clip();
      } else if (options.logoBgShape === 'rounded') {
        const radius = size * 0.2;
        drawRoundedRect(ctx, centerX - halfSize, centerY - halfSize, size, size, radius);
        ctx.clip();
      }

      // Dibujar la imagen conservando la proporción de aspecto
      const imgAspect = img.width / img.height;
      let drawW = size;
      let drawH = size;
      let drawX = centerX - halfSize;
      let drawY = centerY - halfSize;

      if (imgAspect > 1) {
        drawH = size / imgAspect;
        drawY = centerY - drawH / 2;
      } else {
        drawW = size * imgAspect;
        drawX = centerX - drawW / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.warn('Error loading logo into QR canvas:', e);
    }
  }
}

function drawBodyModule(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: QRStyleOptions['moduleShape']) {
  switch (shape) {
    case 'dots': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.42, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      drawRoundedRect(ctx, x + size * 0.05, y + size * 0.05, size * 0.9, size * 0.9, size * 0.35);
      ctx.fill();
      break;
    }
    case 'smooth': {
      drawRoundedRect(ctx, x, y, size, size, size * 0.22);
      ctx.fill();
      break;
    }
    case 'square':
    default:
      ctx.fillRect(x, y, size + 0.1, size + 0.1);
      break;
  }
}

function drawEyeModule(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: QRStyleOptions['eyeShape']) {
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.48, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'rounded') {
    drawRoundedRect(ctx, x, y, size, size, size * 0.3);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, size + 0.1, size + 0.1);
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// Generar cadena SVG pura para descarga
export function generateQRSVG(content: string, options: QRStyleOptions, svgSize = 1000): string {
  if (!content) return '';
  const ecLevel = options.logoDataUrl ? 'H' : options.errorCorrectionLevel || 'M';
  const qr = QRCode.create(content, { errorCorrectionLevel: ecLevel });
  const moduleCount = qr.modules.size;
  const marginModules = options.margin ?? 3;
  const totalModules = moduleCount + marginModules * 2;
  const cellSize = svgSize / totalModules;
  const offset = marginModules * cellSize;

  let elements = '';

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.modules.get(row, col)) continue;
      const isFinder = isFinderPattern(row, col, moduleCount);
      const x = offset + col * cellSize;
      const y = offset + row * cellSize;
      const fill = isFinder ? options.eyeColor || options.fgColor : options.fgColor;

      if (isFinder && options.eyeShape === 'circle') {
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        const r = cellSize * 0.48;
        elements += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}" />\n`;
      } else if (options.moduleShape === 'dots' && !isFinder) {
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        const r = cellSize * 0.42;
        elements += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}" />\n`;
      } else if (options.moduleShape === 'rounded' || options.moduleShape === 'smooth' || isFinder) {
        const rx = cellSize * (options.moduleShape === 'rounded' ? 0.35 : 0.22);
        elements += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx.toFixed(2)}" fill="${fill}" />\n`;
      } else {
        elements += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(cellSize + 0.1).toFixed(2)}" height="${(cellSize + 0.1).toFixed(2)}" fill="${fill}" />\n`;
      }
    }
  }

  // Logo en formato SVG
  let logoMarkup = '';
  if (options.logoDataUrl) {
    const size = svgSize * (options.logoSizePercent / 100);
    const halfSize = size / 2;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const pad = (options.logoPadding ?? 8) * (svgSize / 400);
    const plateSize = size + pad * 2;
    const plateX = centerX - halfSize - pad;
    const plateY = centerY - halfSize - pad;

    let plateSvg = '';
    if (options.logoBgShape === 'circle') {
      plateSvg = `<circle cx="${centerX}" cy="${centerY}" r="${(plateSize / 2).toFixed(2)}" fill="${options.logoBgColor || '#ffffff'}" />`;
    } else if (options.logoBgShape === 'rounded') {
      plateSvg = `<rect x="${plateX.toFixed(2)}" y="${plateY.toFixed(2)}" width="${plateSize.toFixed(2)}" height="${plateSize.toFixed(2)}" rx="${(plateSize * 0.25).toFixed(2)}" fill="${options.logoBgColor || '#ffffff'}" />`;
    } else if (options.logoBgShape === 'square') {
      plateSvg = `<rect x="${plateX.toFixed(2)}" y="${plateY.toFixed(2)}" width="${plateSize.toFixed(2)}" height="${plateSize.toFixed(2)}" fill="${options.logoBgColor || '#ffffff'}" />`;
    }

    logoMarkup = `
      <g id="logo-container">
        ${plateSvg}
        <image href="${options.logoDataUrl}" x="${(centerX - halfSize).toFixed(2)}" y="${(centerY - halfSize).toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />
      </g>
    `;
  }

  return `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
  <rect width="100%" height="100%" fill="${options.bgColor || '#ffffff'}" />
  <g id="qr-modules">
    ${elements}
  </g>
  ${logoMarkup}
</svg>`;
}

// Funciones de exportación: PNG, JPG, SVG y PDF
export async function downloadQRPNG(canvas: HTMLCanvasElement, filename = 'codigo-qr.png'): Promise<void> {
  const dataUrl = canvas.toDataURL('image/png');
  downloadDataUrl(dataUrl, filename);
}

export async function downloadQRJPG(canvas: HTMLCanvasElement, bgColor = '#ffffff', filename = 'codigo-qr.jpg'): Promise<void> {
  // Garantizar fondo sólido para formato JPG
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = bgColor || '#ffffff';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  ctx.drawImage(canvas, 0, 0);

  const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
  downloadDataUrl(dataUrl, filename);
}

export function downloadQRSVG(content: string, options: QRStyleOptions, filename = 'codigo-qr.svg'): void {
  const svgString = generateQRSVG(content, options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadQRPDF(
  canvas: HTMLCanvasElement,
  title = 'Mi Código QR',
  content = '',
  filename = 'codigo-qr.pdf'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Banda decorativa del encabezado
  doc.setFillColor(79, 70, 229); // #4f46e5 indigo-600
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QR Studio Pro', 14, 15);

  // Título
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const safeTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
  doc.text(safeTitle, pageWidth / 2, 45, { align: 'center' });

  // Imagen del código QR
  const qrDataUrl = canvas.toDataURL('image/png');
  const qrSizeMm = 110;
  const qrX = (pageWidth - qrSizeMm) / 2;
  const qrY = 55;

  // Tarjeta con borde sutil para el código QR
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(qrX - 5, qrY - 5, qrSizeMm + 10, qrSizeMm + 10, 4, 4, 'S');

  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizeMm, qrSizeMm);

  // Texto del contenido debajo del código QR
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Contenido / Enlace:', pageWidth / 2, qrY + qrSizeMm + 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  // Ajustar el texto adecuadamente al ancho de la página
  const displayContent = content.length > 200 ? content.substring(0, 197) + '...' : content;
  const splitContent = doc.splitTextToSize(displayContent, pageWidth - 40);
  doc.text(splitContent, pageWidth / 2, qrY + qrSizeMm + 26, { align: 'center' });

  // Instrucciones y fecha en el pie de página
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  const now = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Generado el ${now} con QR Studio Pro • Escanee con la cámara de su móvil`, pageWidth / 2, pageHeight - 15, {
    align: 'center',
  });

  doc.save(filename);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// API nativa de compartir o alternativa de portapapeles
export async function shareQRCode(
  canvas: HTMLCanvasElement,
  title: string,
  content: string
): Promise<{ success: boolean; method: 'native-file' | 'native-link' | 'clipboard' }> {
  try {
    if (navigator.share) {
      // Intentar compartir el blob del lienzo como archivo de imagen
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'qr-code.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        await navigator.share({
          title: title || 'Código QR',
          text: content,
          files: [file],
        });
        return { success: true, method: 'native-file' };
      } else {
        // Alternativa compartiendo como texto o enlace
        await navigator.share({
          title: title || 'Código QR',
          text: `${title ? title + ': ' : ''}${content}`,
          url: content.startsWith('http') ? content : undefined,
        });
        return { success: true, method: 'native-link' };
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, method: 'native-file' }; // El usuario canceló el diálogo para compartir
    }
  }

  // Alternativa copiando al portapapeles
  try {
    await navigator.clipboard.writeText(content);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'clipboard' };
  }
}
