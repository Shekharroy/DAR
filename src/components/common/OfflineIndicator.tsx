import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl shadow-amber-900/50 border border-amber-400/30 animate-pulse">
      <WifiOff className="w-4 h-4 text-white" />
      <div className="flex flex-col">
        <span>Offline Mode Active</span>
        <span className="text-[10px] text-amber-100 font-normal flex items-center gap-1">
          <Database className="w-3 h-3" /> Reports &amp; hourly logs cached locally in device memory
        </span>
      </div>
    </div>
  );
};
