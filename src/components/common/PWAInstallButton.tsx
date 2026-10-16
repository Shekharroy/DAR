import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share2, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const { showToast } = useToast();

  // If already running as an installed PWA, show clean badge
  if (isInstalled) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>DAR App Active</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        showToast('App Installed', 'success', 'DAR AutoCRM is now installed on your home screen!');
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer border border-blue-400/30"
        title="Install DAR Mobile App on Android, iPhone, Tablet or Desktop"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span className="flex items-center gap-1">
          <span className="bg-white/20 px-1 py-0.2 rounded text-[10px] font-black">DAR</span>
          <span className="hidden sm:inline">Install App</span>
        </span>
      </button>

      {/* Cross-platform Install & Home Screen Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center shadow-lg">
                  <img
                    src="/pwa-192x192.png"
                    alt="DAR App Icon"
                    className="w-10 h-10 rounded-xl object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Install DAR App
                    <span className="px-1.5 py-0.2 rounded bg-blue-600 text-[10px] font-black">DAR</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Mobile &amp; Laptop Standalone App</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="text-slate-200 font-semibold">
                This app will install with the iconic <strong>DAR</strong> logo on your home screen and run in 100% full-screen mobile app mode:
              </p>

              {isIOS ? (
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Apple iOS (Safari):
                  </p>
                  <p className="text-[11px]">
                    1. Tap the <strong className="text-blue-400">Share</strong> icon (<Share2 className="w-3 h-3 inline text-blue-400" />) in Safari's bottom toolbar.
                  </p>
                  <p className="text-[11px]">
                    2. Scroll down and tap <strong className="text-blue-400">Add to Home Screen</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                  <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Android / Chrome / Edge:
                  </p>
                  <p className="text-[11px]">
                    1. Tap the browser menu (<strong className="text-slate-200">⋮</strong> or <strong>Share</strong>).
                  </p>
                  <p className="text-[11px]">
                    2. Select <strong className="text-cyan-400">Install app</strong> or <strong className="text-cyan-400">Add to Home screen</strong>.
                  </p>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/50 flex items-center gap-2 text-[11px] text-blue-200">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Supports offline DAR caching, instant punch-in &amp; push notification alerts!</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
