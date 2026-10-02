import { ScannedQRItem, SavedQRCodeItem } from '../types/qr';

const SCAN_HISTORY_KEY = 'qr_studio_scan_history_v1';
const SAVED_CODES_KEY = 'qr_studio_saved_codes_v1';

// Historial de escaneos
export function getScanHistory(): ScannedQRItem[] {
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read scan history:', e);
    return [];
  }
}

export function addScanToHistory(content: string, type: string, note?: string): ScannedQRItem {
  const current = getScanHistory();
  // Evitar duplicados inmediatos dentro de un intervalo de 3 segundos
  if (current.length > 0 && current[0].content === content && Date.now() - current[0].scannedAt < 3000) {
    return current[0];
  }

  const newItem: ScannedQRItem = {
    id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    content,
    type,
    scannedAt: Date.now(),
    note,
  };

  const updated = [newItem, ...current].slice(0, 200); // Limitar a un máximo de 200 elementos
  try {
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save scan item:', e);
  }
  return newItem;
}

export function removeScanFromHistory(id: string): ScannedQRItem[] {
  const current = getScanHistory().filter((item) => item.id !== id);
  try {
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to update scan history:', e);
  }
  return current;
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(SCAN_HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear scan history:', e);
  }
}

export function exportScanHistoryAsCSV(items: ScannedQRItem[]): void {
  const headers = ['Fecha y Hora', 'Tipo', 'Contenido', 'Nota'];
  const rows = items.map((i) => [
    new Date(i.scannedAt).toLocaleString('es-ES'),
    `"${(i.type || '').replace(/"/g, '""')}"`,
    `"${(i.content || '').replace(/"/g, '""')}"`,
    `"${(i.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historial-escaneos-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Galería / Códigos guardados
export function getSavedCodes(): SavedQRCodeItem[] {
  try {
    const raw = localStorage.getItem(SAVED_CODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read saved codes:', e);
    return [];
  }
}

export function saveCodeToGallery(code: Omit<SavedQRCodeItem, 'id' | 'createdAt'>): SavedQRCodeItem {
  const current = getSavedCodes();
  const newItem: SavedQRCodeItem = {
    ...code,
    id: 'saved_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: Date.now(),
  };

  const updated = [newItem, ...current];
  try {
    localStorage.setItem(SAVED_CODES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save code to gallery:', e);
  }
  return newItem;
}

export function removeSavedCode(id: string): SavedQRCodeItem[] {
  const current = getSavedCodes().filter((item) => item.id !== id);
  try {
    localStorage.setItem(SAVED_CODES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete saved code:', e);
  }
  return current;
}
