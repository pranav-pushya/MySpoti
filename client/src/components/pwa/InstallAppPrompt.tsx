import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (standaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if user dismissed recently (24 hours cooldown)
    const dismissedTime = localStorage.getItem('myspoti_pwa_dismissed');
    if (dismissedTime) {
      const elapsed = Date.now() - parseInt(dismissedTime, 10);
      if (elapsed < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // 3. Detect iOS devices (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // 4. Capture native beforeinstallprompt (Android Chrome, Edge, Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Detect app installed event
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => {
        setIsStandalone(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // If browser doesn't support beforeinstallprompt, show instructional modal/guide
      setShowIosGuide(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('myspoti_pwa_dismissed', Date.now().toString());
  };

  // Do not render if already running as standalone installed PWA or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Install MySpoti App"
      className="fixed bottom-20 left-3 sm:bottom-24 sm:left-4 z-50 max-w-[340px] w-[calc(100vw-1.5rem)] sm:w-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="relative bg-[#181818]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {installedSuccess ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-spotify-green flex items-center justify-center text-black flex-shrink-0">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Installed Successfully!</h4>
              <p className="text-xs text-zinc-400">Launch MySpoti from your home screen.</p>
            </div>
          </div>
        ) : showIosGuide ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 text-spotify-green font-semibold text-xs tracking-wide uppercase">
              <Smartphone className="w-4 h-4" />
              <span>Install on iOS / Safari</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              To install <strong>MySpoti</strong> on your iPhone or iPad:
            </p>
            <ol className="text-xs text-zinc-300 space-y-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 text-center text-[10px] font-bold leading-4 flex-shrink-0">1</span>
                <span>Tap the <Share className="w-3.5 h-3.5 inline text-blue-400 mx-0.5" /> <strong>Share</strong> button in Safari toolbar.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 text-center text-[10px] font-bold leading-4 flex-shrink-0">2</span>
                <span>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-spotify-green mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 text-center text-[10px] font-bold leading-4 flex-shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner.</span>
              </li>
            </ol>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-spotify-green to-emerald-600 flex items-center justify-center p-2 flex-shrink-0 shadow-lg shadow-spotify-green/20">
              <svg viewBox="0 0 24 24" fill="#121212" className="w-full h-full">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.58 14.42c-.18.3-.57.4-.87.22-2.39-1.46-5.4-1.79-8.95-.98-.34.08-.68-.13-.76-.47-.08-.34.13-.68.47-.76 3.91-.89 7.26-.51 9.89 1.12.3.18.4.57.22.87zm1.22-2.73c-.23.38-.72.5-1.1.27-2.74-1.68-6.91-2.17-10.15-1.18-.42.13-.86-.11-.99-.53-.13-.42.11-.86.53-.99 3.69-1.12 8.32-.58 11.44 1.33.38.23.5.72.27 1.1zm.13-2.85C14.65 8.92 9.24 8.74 6.1 9.69c-.5.15-1.03-.13-1.18-.63-.15-.5.13-1.03.63-1.18 3.65-1.11 9.61-.9 13.43 1.37.45.27.6.86.33 1.31-.27.45-.86.6-1.38.29z" />
              </svg>
            </div>

            {/* Content & Action */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white tracking-tight">Install MySpoti</h4>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-spotify-green/20 text-spotify-green">
                  App
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-snug">
                Install for fullscreen music & videos with lockscreen controls.
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-spotify-green hover:bg-[#1ed760] text-black text-xs font-bold transition-all transform active:scale-95 shadow-md shadow-spotify-green/20"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Install</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
