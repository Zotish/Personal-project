import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Delay showing iOS install instructions
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // Handle Chrome/Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-[#C04A22]/20 shadow-2xl p-4 flex items-start gap-3.5 relative overflow-hidden">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C04A22] via-[#F59E0B] to-[#C04A22]" />

        {/* App Icon */}
        <img
          src="/icon-192.png"
          alt="ImmigrantConnect USA"
          className="w-12 h-12 rounded-xl flex-shrink-0 shadow-md border border-white/20 mt-0.5 object-cover"
        />

        {/* Content */}
        <div className="flex-1 min-w-0 pr-5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug truncate">
              ImmigrantConnect USA
            </h4>
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
            {isIOS
              ? "Install this app on your iPhone/iPad for instant access, offline support, and smooth experience."
              : "Install as a fast mobile app on your home screen for quick access & offline support."}
          </p>

          {isIOS ? (
            <div className="flex items-center gap-1.5 text-[11px] text-[#8C3015] bg-[#C04A22]/10 dark:bg-[#C04A22]/20 px-2.5 py-1.5 rounded-lg font-medium">
              <span>Tap</span>
              <Share className="w-3.5 h-3.5 inline text-[#C04A22]" />
              <span>Share and select</span>
              <span className="font-bold flex items-center gap-0.5">
                <PlusSquare className="w-3 h-3 inline" /> "Add to Home Screen"
              </span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold shadow-md shadow-[#C04A22]/25 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
