import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>PWA Installed</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={async () => {
          const success = await install();
          if (success) {
            setJustInstalled(true);
            setTimeout(() => setJustInstalled(false), 4000);
          }
        }}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all active:scale-95"
        title="Install AutoCRM as Native Web App on Mobile/Laptop"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Add to iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed space-y-2">
                <span className="block font-medium text-slate-200">Follow these 2 steps in Safari:</span>
                <span className="block bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  1. Tap the <strong className="text-blue-400">Share</strong> icon (box with upward arrow) at the bottom toolbar.
                </span>
                <span className="block bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  2. Scroll down and tap <strong className="text-blue-400">Add to Home Screen</strong>.
                </span>
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-semibold text-white transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback indicator showing app is mobile & laptop ready
  return (
    <button
      onClick={() => alert("AutoCRM Pro is PWA-ready! To install on your device, use your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.")}
      className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-850 hover:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition"
      title="PWA Ready for All Devices"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
      <span>Install PWA</span>
    </button>
  );
};
