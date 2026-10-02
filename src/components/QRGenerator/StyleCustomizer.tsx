import React, { useRef } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Upload,
  Trash2,
  Sliders,
  Check,
  Sparkles,
} from 'lucide-react';
import { QRStyleOptions, ModuleShape, EyeShape } from '../../types/qr';

interface StyleCustomizerProps {
  options: QRStyleOptions;
  onChange: (options: QRStyleOptions) => void;
}

const COLOR_PRESETS = [
  { name: 'Clásico', fg: '#000000', bg: '#ffffff', eye: '#000000' },
  { name: 'Índigo Moderno', fg: '#4f46e5', bg: '#ffffff', eye: '#4338ca' },
  { name: 'Azul Marino', fg: '#1e3a8a', bg: '#eff6ff', eye: '#1d4ed8' },
  { name: 'Esmeralda Pro', fg: '#047857', bg: '#f0fdf4', eye: '#065f46' },
  { name: 'Violeta Neón', fg: '#7c3aed', bg: '#faf5ff', eye: '#6d28d9' },
  { name: 'Atardecer Coral', fg: '#ea580c', bg: '#fff7ed', eye: '#c2410c' },
  { name: 'Modo Oscuro', fg: '#f8fafc', bg: '#0f172a', eye: '#38bdf8' },
  { name: 'Grafito & Oro', fg: '#18181b', bg: '#fefce8', eye: '#d97706' },
];

// Data URLs en formato SVG para logotipos rápidos de muestra
const QUICK_LOGOS = [
  {
    name: 'WhatsApp',
    color: '#25D366',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="%2325D366"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`,
  },
  {
    name: 'Wi-Fi',
    color: '#4f46e5',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  },
  {
    name: 'Web / Link',
    color: '#0284c7',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%230284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  },
  {
    name: 'Email',
    color: '#e11d48',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  },
  {
    name: 'Estrella',
    color: '#f59e0b',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b" stroke="%23f59e0b" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
];

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({ options, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compatible con JPG, PNG, WEBP, SVG y GIF
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        ...options,
        logoDataUrl: dataUrl,
        errorCorrectionLevel: 'H', // Siempre forzar corrección de error alta (H) al añadir un logo
      });
    };
    reader.readAsDataURL(file);
    // Restablecer el selector de archivos
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeLogo = () => {
    onChange({
      ...options,
      logoDataUrl: undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* 1. Colores y Paletas */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Colores del Código
          </h3>
        </div>

        {/* Paletas de colores predefinidas */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
          {COLOR_PRESETS.map((p) => {
            const isSelected =
              options.fgColor.toLowerCase() === p.fg.toLowerCase() &&
              options.bgColor.toLowerCase() === p.bg.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                onClick={() =>
                  onChange({
                    ...options,
                    fgColor: p.fg,
                    bgColor: p.bg,
                    eyeColor: p.eye,
                  })
                }
                title={p.name}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm scale-105'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg shadow-inner flex items-center justify-center border border-black/10 relative"
                  style={{ backgroundColor: p.bg }}
                >
                  <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: p.fg }} />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full text-center">
                  {p.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selectores de color personalizados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Módulos (QR)</p>
              <p className="text-[10px] text-slate-400 uppercase font-mono">{options.fgColor}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={options.fgColor}
                onChange={(e) => onChange({ ...options, fgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Fondo</p>
              <p className="text-[10px] text-slate-400 uppercase font-mono">{options.bgColor}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={options.bgColor}
                onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Esquinas (Ojos)</p>
              <p className="text-[10px] text-slate-400 uppercase font-mono">{options.eyeColor}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={options.eyeColor}
                onChange={(e) => onChange({ ...options, eyeColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Formas & Estilo de Módulos */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Forma de los Módulos y Esquinas
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">
              Forma de puntos internos
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'square', label: 'Cuadrado' },
                  { id: 'rounded', label: 'Redondo' },
                  { id: 'dots', label: 'Puntos' },
                  { id: 'smooth', label: 'Suave' },
                ] as { id: ModuleShape; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange({ ...options, moduleShape: m.id })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                    options.moduleShape === m.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">
              Estilo de ojos (Esquinas)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'square', label: 'Cuadrado' },
                  { id: 'rounded', label: 'Redondeado' },
                  { id: 'circle', label: 'Círculo' },
                ] as { id: EyeShape; label: string }[]
              ).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onChange({ ...options, eyeShape: e.id })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                    options.eyeShape === e.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Logo Central */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Logo en el Centro del Código
            </h3>
          </div>
          {options.logoDataUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Corrección de error H (30%) activa
            </span>
          )}
        </div>

        {/* Botón de subida y zona para arrastrar archivos */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            onChange={handleFileUpload}
            className="hidden"
          />

          {options.logoDataUrl ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={options.logoDataUrl}
                    alt="Logo actual"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Logo cargado</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    JPG, PNG, WebP o SVG listo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="p-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                  title="Eliminar logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-5 text-center cursor-pointer transition bg-slate-50/60 hover:bg-indigo-50/20 dark:bg-slate-800/40"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Sube tu logo aquí (JPG, PNG, WebP, SVG)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Haz clic o arrastra una imagen. Se centrará automáticamente sin afectar la lectura.
              </p>
            </div>
          )}

          {/* Iconos y logos rápidos predefinidos */}
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              O elige un icono rápido predefinido:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_LOGOS.map((ql) => (
                <button
                  key={ql.name}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...options,
                      logoDataUrl: ql.dataUrl,
                      errorCorrectionLevel: 'H',
                    })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-500 bg-white dark:bg-slate-800 cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 inline-block"
                    dangerouslySetInnerHTML={{
                      __html: decodeURIComponent(ql.dataUrl.replace('data:image/svg+xml;utf8,', '')),
                    }}
                  />
                  <span>{ql.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Opciones de ajuste fino del logo si existe */}
          {options.logoDataUrl && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Tamaño del logo</span>
                  <span className="font-semibold">{options.logoSizePercent}%</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={options.logoSizePercent}
                  onChange={(e) =>
                    onChange({ ...options, logoSizePercent: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                  Forma del fondo
                </label>
                <select
                  value={options.logoBgShape}
                  onChange={(e) =>
                    onChange({ ...options, logoBgShape: e.target.value as any })
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="circle">Circular</option>
                  <option value="rounded">Bordes redondeados</option>
                  <option value="square">Cuadrado</option>
                  <option value="none">Sin fondo (transparente)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                  Color de fondo logo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.logoBgColor}
                    onChange={(e) => onChange({ ...options, logoBgColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono uppercase text-slate-500">
                    {options.logoBgColor}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
