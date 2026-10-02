import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Share2,
  Download,
  Wand2,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  FileImage,
  FileCode,
  FileText,
  Eye,
  X,
} from 'lucide-react';
import { SavedQRCodeItem } from '../../types/qr';
import { removeSavedCode } from '../../utils/storage';
import {
  renderQRToCanvas,
  downloadQRPNG,
  downloadQRJPG,
  downloadQRSVG,
  downloadQRPDF,
  shareQRCode,
} from '../../utils/qrGenerator';

interface SavedCodesViewProps {
  savedCodes: SavedQRCodeItem[];
  onSavedCodesChange: (updated: SavedQRCodeItem[]) => void;
  onEditCode: (code: SavedQRCodeItem) => void;
}

export const SavedCodesView: React.FC<SavedCodesViewProps> = ({
  savedCodes,
  onSavedCodesChange,
  onEditCode,
}) => {
  const [selectedForExport, setSelectedForExport] = useState<SavedQRCodeItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const updated = removeSavedCode(id);
    onSavedCodesChange(updated);
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Alternativa en caso de error al copiar
    }
  };

  const handleShare = async (item: SavedQRCodeItem) => {
    const tempCanvas = document.createElement('canvas');
    await renderQRToCanvas(tempCanvas, item.content, item.styles, 800);
    await shareQRCode(tempCanvas, item.title, item.content);
  };

  const handleExport = async (format: 'png' | 'jpg' | 'svg' | 'pdf', item: SavedQRCodeItem) => {
    const tempCanvas = document.createElement('canvas');
    await renderQRToCanvas(tempCanvas, item.content, item.styles, 1024);
    const safeTitle = (item.title || 'codigo-qr')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 30);

    if (format === 'png') {
      await downloadQRPNG(tempCanvas, `${safeTitle}.png`);
    } else if (format === 'jpg') {
      await downloadQRJPG(tempCanvas, item.styles.bgColor, `${safeTitle}.jpg`);
    } else if (format === 'svg') {
      downloadQRSVG(item.content, item.styles, `${safeTitle}.svg`);
    } else if (format === 'pdf') {
      downloadQRPDF(tempCanvas, item.title, item.content, `${safeTitle}.pdf`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Galería de Códigos Guardados
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {savedCodes.length} {savedCodes.length === 1 ? 'diseño guardado' : 'diseños guardados'} en este dispositivo
            </p>
          </div>
        </div>
      </div>

      {/* Cuadrícula de códigos guardados */}
      {savedCodes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tu galería está vacía
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Personaliza un código en la pestaña de Generador y pulsa el botón «Guardar en Galería» para tenerlo siempre disponible aquí, incluso sin conexión.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCodes.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Contenedor de la imagen QR */}
              <div
                className="p-6 flex items-center justify-center relative group"
                style={{ backgroundColor: item.styles.bgColor || '#ffffff' }}
              >
                <img
                  src={item.previewDataUrl}
                  alt={item.title}
                  className="w-40 h-40 object-contain rounded-lg drop-shadow-sm transition-transform group-hover:scale-105"
                />

                {/* Acciones rápidas superpuestas al pasar el cursor */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                  <button
                    onClick={() => setSelectedForExport(item)}
                    className="p-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-medium shadow-lg transition"
                    title="Exportar formatos"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare(item)}
                    className="p-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-medium shadow-lg transition"
                    title="Compartir"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditCode(item)}
                    className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium shadow-lg transition"
                    title="Editar en el generador"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Información y pie de la tarjeta */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {item.contentType}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    title="Eliminar de galería"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg">
                  {item.content}
                </p>

                {/* Barra de acciones */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(item.id, item.content)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                      title="Copiar texto"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedForExport(item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-medium hover:bg-indigo-100 transition cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de exportación */}
      {selectedForExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Exportar «{selectedForExport.title}»
              </h3>
              <button
                onClick={() => setSelectedForExport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => handleExport('png', selectedForExport)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <FileImage className="w-4 h-4 text-blue-600" />
                <span>Descargar PNG</span>
              </button>

              <button
                onClick={() => handleExport('jpg', selectedForExport)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <FileImage className="w-4 h-4 text-amber-600" />
                <span>Descargar JPG</span>
              </button>

              <button
                onClick={() => handleExport('svg', selectedForExport)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <FileCode className="w-4 h-4 text-purple-600" />
                <span>Descargar SVG</span>
              </button>

              <button
                onClick={() => handleExport('pdf', selectedForExport)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>PDF Imprimible</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
