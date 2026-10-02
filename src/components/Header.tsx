import React from 'react';
import {
  QrCode,
  Scan,
  Bookmark,
  History,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export type ActiveTab = 'generator' | 'scanner' | 'gallery' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedCount: number;
  historyCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  historyCount,
  darkMode,
  onToggleDarkMode,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logotipo y Nombre de la Marca */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base md:text-lg tracking-tight text-slate-900 dark:text-white">
                QR Studio <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Marcelo
            </p>
          </div>
        </div>

        {/* Pestañas de navegación para escritorio y tabletas */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => onTabChange('generator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Generador</span>
          </button>

          <button
            onClick={() => onTabChange('scanner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Escáner</span>
          </button>

          <button
            onClick={() => onTabChange('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Galería</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Botones de utilidad: Instalar, modo oscuro, indicador de conexión */}
        <div className="flex items-center gap-2">
          {/* Indicador de estado en línea / sin conexión */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/60'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/60'
            }`}
            title={isOnline ? 'Conexión activa' : 'Sin conexión — Funcionando 100% offline'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Alternar modo claro / oscuro */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Botón de instalación PWA */}
          <PWAInstallButton />
        </div>
      </div>

      {/* Barra de navegación inferior móvil para ergonomía */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onTabChange('generator')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-medium transition cursor-pointer ${
            activeTab === 'generator'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span>Generar</span>
        </button>

        <button
          onClick={() => onTabChange('scanner')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-medium transition cursor-pointer ${
            activeTab === 'scanner'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Scan className="w-5 h-5" />
          <span>Escanear</span>
        </button>

        <button
          onClick={() => onTabChange('gallery')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-medium transition relative cursor-pointer ${
            activeTab === 'gallery'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-indigo-600 text-white leading-tight">
                {savedCount}
              </span>
            )}
          </div>
          <span>Galería</span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-medium transition relative cursor-pointer ${
            activeTab === 'history'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-slate-600 text-white leading-tight">
                {historyCount}
              </span>
            )}
          </div>
          <span>Historial</span>
        </button>
      </div>
    </header>
  );
};
