import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Wand2,
  Wifi,
  Phone,
  MessageCircle,
  FileText,
  Bookmark,
} from 'lucide-react';
import { parseScannedContent } from '../../utils/qrScanner';

interface ScanResultModalProps {
  rawContent: string;
  onClose: () => void;
  onUseInGenerator?: (content: string, type: any) => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  rawContent,
  onClose,
  onUseInGenerator,
}) => {
  const [copied, setCopied] = useState(false);
  const parsed = parseScannedContent(rawContent);

  const handleCopy = async (textToCopy?: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy || rawContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Alternativa en caso de error al copiar
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: parsed.title,
          text: rawContent,
        });
      } catch {
        // El usuario canceló o hubo error al compartir
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {parsed.type === 'url' && <ExternalLink className="w-5 h-5" />}
              {parsed.type === 'wifi' && <Wifi className="w-5 h-5" />}
              {parsed.type === 'phone' && <Phone className="w-5 h-5" />}
              {parsed.type === 'whatsapp' && <MessageCircle className="w-5 h-5" />}
              {parsed.type !== 'url' &&
                parsed.type !== 'wifi' &&
                parsed.type !== 'phone' &&
                parsed.type !== 'whatsapp' && <FileText className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Código Detectado
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {parsed.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del contenido */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Campos interpretados clave-valor */}
          {parsed.details && Object.keys(parsed.details).length > 0 && (
            <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60">
              {Object.entries(parsed.details).map(([k, v]) => (
                <div key={k} className="flex flex-col sm:flex-row sm:justify-between text-xs gap-0.5">
                  <span className="font-medium text-slate-500 dark:text-slate-400">{k}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 break-all select-all">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Cuadro de texto sin procesar */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Contenido en Bruto
            </label>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 break-all max-h-36 overflow-y-auto select-all">
              {rawContent}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-2">
          {/* Botón de acción principal */}
          {parsed.type === 'url' && (
            <a
              href={rawContent}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Enlace en el Navegador</span>
            </a>
          )}

          {parsed.type === 'wifi' && parsed.details?.Contraseña && parsed.details.Contraseña !== '(Sin contraseña)' && (
            <button
              onClick={() => handleCopy(parsed.details?.Contraseña)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Contraseña de Wi-Fi</span>
            </button>
          )}

          {parsed.type === 'phone' && (
            <a
              href={rawContent}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition"
            >
              <Phone className="w-4 h-4" />
              <span>Llamar al Número</span>
            </a>
          )}

          {parsed.type === 'whatsapp' && (
            <a
              href={rawContent}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Abrir en WhatsApp</span>
            </a>
          )}

          {/* Acciones secundarias */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCopy()}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir</span>
            </button>

            {onUseInGenerator && (
              <button
                onClick={() => {
                  onUseInGenerator(rawContent, parsed.type);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 transition cursor-pointer"
                title="Cargar en el generador para personalizar"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Editar QR</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
