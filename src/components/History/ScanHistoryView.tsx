import React, { useState } from 'react';
import {
  History,
  Trash2,
  FileSpreadsheet,
  Search,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Wifi,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Eye,
} from 'lucide-react';
import { ScannedQRItem } from '../../types/qr';
import {
  exportScanHistoryAsCSV,
  removeScanFromHistory,
  clearScanHistory,
} from '../../utils/storage';

interface ScanHistoryViewProps {
  history: ScannedQRItem[];
  onHistoryChange: (updated: ScannedQRItem[]) => void;
  onSelectItem: (item: ScannedQRItem) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  history,
  onHistoryChange,
  onSelectItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.content.toLowerCase().includes(q) ||
      (item.type && item.type.toLowerCase().includes(q)) ||
      (item.note && item.note.toLowerCase().includes(q))
    );
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeScanFromHistory(id);
    onHistoryChange(updated);
  };

  const handleClearAll = () => {
    clearScanHistory();
    onHistoryChange([]);
    setShowClearConfirm(false);
  };

  const handleCopy = async (id: string, content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Alternativa en caso de error al copiar
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <ExternalLink className="w-3.5 h-3.5 text-blue-500" />;
      case 'wifi':
        return <Wifi className="w-3.5 h-3.5 text-indigo-500" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-500" />;
      case 'whatsapp':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado superior y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Historial de Escaneos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {history.length} {history.length === 1 ? 'código escaneado' : 'códigos escaneados'} guardados localmente
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportScanHistoryAsCSV(history)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Exportar a archivo Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium text-rose-600 dark:text-rose-400 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vaciar Historial</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmación para vaciar el historial */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">¿Vaciar todo el historial?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Se eliminarán permanentemente los registros de escaneo almacenados en este dispositivo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
              >
                Sí, vaciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por texto, enlace o tipo de código..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Lista de elementos del historial */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {searchTerm ? 'No se encontraron coincidencias' : 'Aún no hay escaneos en el historial'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchTerm
              ? 'Prueba con otro término de búsqueda.'
              : 'Cuando escanees códigos QR usando la cámara o subiendo una imagen, aparecerán guardados automáticamente aquí.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.scannedAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5 max-w-md sm:max-w-xl">
                    {item.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleCopy(item.id, item.content, e)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  title="Copiar"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
