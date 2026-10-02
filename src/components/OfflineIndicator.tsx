import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-xl ring-1 ring-white/20 animate-bounce">
      <WifiOff className="h-4 w-4" />
      <span>Modo sin conexión — La app sigue funcionando 100% en tu dispositivo</span>
    </div>
  );
};
