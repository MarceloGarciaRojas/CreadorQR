import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Share2,
  Bookmark,
  Check,
  Sparkles,
  FileImage,
  FileCode,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRStyleOptions, QRContentType } from '../../types/qr';
import {
  renderQRToCanvas,
  downloadQRPNG,
  downloadQRJPG,
  downloadQRSVG,
  downloadQRPDF,
  shareQRCode,
} from '../../utils/qrGenerator';
import { saveCodeToGallery } from '../../utils/storage';

interface QRPreviewProps {
  content: string;
  contentType: QRContentType;
  title: string;
  options: QRStyleOptions;
  onCodeSaved?: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  content,
  contentType,
  title,
  options,
  onCodeSaved,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exportResolution, setExportResolution] = useState<number>(1024);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  // Volver a renderizar el código QR cuando cambie el contenido o las opciones de estilo
  useEffect(() => {
    if (!canvasRef.current) return;
    renderQRToCanvas(canvasRef.current, content, options, 800);
  }, [content, options]);

  const handleDownload = async (format: 'png' | 'jpg' | 'svg' | 'pdf') => {
    if (!canvasRef.current || !content) return;

    // Crear un lienzo fuera de pantalla en alta resolución para la exportación
    const offscreenCanvas = document.createElement('canvas');
    await renderQRToCanvas(offscreenCanvas, content, options, exportResolution);

    const safeTitle = (title.trim() || 'codigo-qr')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 30);

    if (format === 'png') {
      await downloadQRPNG(offscreenCanvas, `${safeTitle}.png`);
    } else if (format === 'jpg') {
      await downloadQRJPG(offscreenCanvas, options.bgColor, `${safeTitle}.jpg`);
    } else if (format === 'svg') {
      downloadQRSVG(content, options, `${safeTitle}.svg`);
    } else if (format === 'pdf') {
      downloadQRPDF(offscreenCanvas, title || 'Código QR', content, `${safeTitle}.pdf`);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignorar posibles excepciones de confetti
    }
  };

  const handleSaveToGallery = () => {
    if (!canvasRef.current || !content) return;
    const previewDataUrl = canvasRef.current.toDataURL('image/png');

    saveCodeToGallery({
      title: title.trim() || `Código ${contentType.toUpperCase()}`,
      content,
      contentType,
      styles: options,
      previewDataUrl,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignorar
    }

    if (onCodeSaved) onCodeSaved();
  };

  const handleShare = async () => {
    if (!canvasRef.current || !content) return;
    const res = await shareQRCode(canvasRef.current, title || 'Código QR', content);
    if (res.success) {
      if (res.method === 'clipboard') {
        setShareStatus('¡Copiado al portapapeles!');
      } else {
        setShareStatus('¡Compartido!');
      }
    } else {
      setShareStatus('Enlace copiado');
    }
    setTimeout(() => setShareStatus(null), 3000);
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Alternativa en caso de error
    }
  };

  const hasContent = Boolean(content.trim());

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm sticky top-20 flex flex-col items-center">
      {/* Indicador superior y título */}
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Vista Previa en Vivo
          </h3>
          <p className="text-[11px] text-slate-400">
            {hasContent ? 'Listo para escanear y exportar' : 'Introduce información a la izquierda'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                hasContent ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                hasContent ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {hasContent ? 'Activo' : 'Esperando datos'}
          </span>
        </div>
      </div>

      {/* Visualizador del lienzo QR */}
      <div
        className="w-full max-w-[280px] aspect-square rounded-2xl p-4 flex items-center justify-center shadow-inner border border-slate-100 dark:border-slate-800 relative transition-all"
        style={{ backgroundColor: options.bgColor }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain rounded-lg drop-shadow-sm"
        />

        {!hasContent && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4 text-center">
            <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Escribe un texto o URL para generar tu código
            </p>
          </div>
        )}
      </div>

      {/* Previsualización del contenido y botón de copiar */}
      {hasContent && (
        <div className="w-full mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
          <div className="truncate text-slate-600 dark:text-slate-300 font-mono text-[11px] flex-1">
            {content}
          </div>
          <button
            onClick={handleCopyContent}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0 transition"
            title="Copiar contenido"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Botones de acción rápida: Guardar en Galería y Compartir */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          disabled={!hasContent}
          onClick={handleSaveToGallery}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          <span>{saved ? '¡Guardado!' : 'Guardar en Galería'}</span>
        </button>

        <button
          type="button"
          disabled={!hasContent}
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{shareStatus || 'Compartir'}</span>
        </button>
      </div>

      {/* Sección de formatos de exportación */}
      <div className="w-full mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Descargar en Formatos
          </span>

          {/* Selector de resolución para mapa de bits */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Calidad:</span>
            <select
              value={exportResolution}
              onChange={(e) => setExportResolution(parseInt(e.target.value, 10))}
              className="bg-slate-100 dark:bg-slate-800 border-0 rounded px-1.5 py-0.5 text-[11px] font-mono outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="512">512 px</option>
              <option value="1024">1024 px (HD)</option>
              <option value="2048">2048 px (Ultra HD)</option>
            </select>
          </div>
        </div>

        {/* 4 botones de descarga de formato: PNG, JPG, SVG y PDF */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!hasContent}
            onClick={() => handleDownload('png')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileImage className="w-3.5 h-3.5 text-blue-600" />
            <span>PNG</span>
          </button>

          <button
            type="button"
            disabled={!hasContent}
            onClick={() => handleDownload('jpg')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileImage className="w-3.5 h-3.5 text-amber-600" />
            <span>JPG</span>
          </button>

          <button
            type="button"
            disabled={!hasContent}
            onClick={() => handleDownload('svg')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Vectorial escalable sin pérdida"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-600" />
            <span>SVG (Vector)</span>
          </button>

          <button
            type="button"
            disabled={!hasContent}
            onClick={() => handleDownload('pdf')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Documento imprimible A4"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF Imprimible</span>
          </button>
        </div>
      </div>
    </div>
  );
};
