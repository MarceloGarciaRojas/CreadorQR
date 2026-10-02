import jsQR from 'jsqr';

export interface ParsedQRScan {
  raw: string;
  type: 'url' | 'wifi' | 'vcard' | 'email' | 'phone' | 'whatsapp' | 'text';
  title: string;
  details?: Record<string, string>;
}

export function parseScannedContent(raw: string): ParsedQRScan {
  const trimmed = raw.trim();

  // Enlace Web (URL)
  if (/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes('wa.me') || trimmed.includes('api.whatsapp.com')) {
      return {
        raw,
        type: 'whatsapp',
        title: 'Mensaje de WhatsApp',
        details: { Enlace: trimmed },
      };
    }
    return {
      raw,
      type: 'url',
      title: 'Enlace Web',
      details: { URL: trimmed },
    };
  }

  // Red Wi-Fi
  if (/^WIFI:/i.test(trimmed)) {
    const ssidMatch = trimmed.match(/S:([^;]+)/i);
    const passMatch = trimmed.match(/P:([^;]*)/i);
    const typeMatch = trimmed.match(/T:([^;]+)/i);
    const hiddenMatch = trimmed.match(/H:([^;]+)/i);

    return {
      raw,
      type: 'wifi',
      title: 'Red Wi-Fi',
      details: {
        'Nombre de Red (SSID)': ssidMatch ? ssidMatch[1] : 'Desconocido',
        'Contraseña': passMatch ? passMatch[1] : '(Sin contraseña)',
        'Seguridad': typeMatch ? typeMatch[1] : 'WPA',
        'Oculta': hiddenMatch && hiddenMatch[1] === 'true' ? 'Sí' : 'No',
      },
    };
  }

  // Contacto vCard
  if (/BEGIN:VCARD/i.test(trimmed)) {
    const fnMatch = trimmed.match(/FN:(.+)/i);
    const telMatch = trimmed.match(/TEL.*:(.+)/i);
    const emailMatch = trimmed.match(/EMAIL.*:(.+)/i);
    const orgMatch = trimmed.match(/ORG:(.+)/i);
    const urlMatch = trimmed.match(/URL:(.+)/i);

    return {
      raw,
      type: 'vcard',
      title: 'Contacto vCard',
      details: {
        'Nombre': fnMatch ? fnMatch[1].trim() : 'Contacto',
        'Teléfono': telMatch ? telMatch[1].trim() : '',
        'Correo': emailMatch ? emailMatch[1].trim() : '',
        'Organización': orgMatch ? orgMatch[1].trim() : '',
        'Web': urlMatch ? urlMatch[1].trim() : '',
      },
    };
  }

  // Correo electrónico (mailto)
  if (/^mailto:/i.test(trimmed)) {
    const clean = trimmed.replace(/^mailto:/i, '');
    const [email, search] = clean.split('?');
    const params = new URLSearchParams(search || '');
    return {
      raw,
      type: 'email',
      title: 'Correo Electrónico',
      details: {
        'Destinatario': email,
        'Asunto': params.get('subject') || '',
        'Mensaje': params.get('body') || '',
      },
    };
  }

  // Número telefónico (tel)
  if (/^tel:/i.test(trimmed)) {
    const phone = trimmed.replace(/^tel:/i, '');
    return {
      raw,
      type: 'phone',
      title: 'Número Telefónico',
      details: { 'Teléfono': phone },
    };
  }

  return {
    raw,
    type: 'text',
    title: 'Texto Libre',
    details: { 'Contenido': raw },
  };
}

// Reproducir pitido agradable de escaneo mediante Web Audio API
export function playScanChirp() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Doble tono arpegiado
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Restricciones de reproducción automática o no compatible
  }

  // Respuesta háptica / vibración
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 50, 40]);
    } catch {
      // Ignorar error de vibración si no está soportado
    }
  }
}

// Escanear código QR a partir de un archivo de imagen
export async function scanQRFromFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // Mantener dimensiones óptimas para la velocidad de procesamiento
      const maxDim = 1200;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        resolve(code.data);
      } else {
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
}
