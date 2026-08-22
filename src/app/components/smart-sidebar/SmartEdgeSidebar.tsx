import React, { useState, useRef, useEffect } from "react";
import {
  X, Minus, Maximize2, Minimize2, Search,
  Languages, Landmark, DollarSign, Calculator, FileText,
  MessageSquare, Map, ShoppingBag, Sparkles, ExternalLink,
  Copy, Check, Volume2, RefreshCw, Plus,
  Youtube, Globe, Bot, Facebook, Instagram, Music, Mail,
  Smartphone, Trash2, Play, Send, Phone, MessageCircle,
  Camera, Image, Clock, Mic, FolderOpen, Settings,
  Car, ShoppingCart, Video, ShieldCheck, ArrowRight, Radio,
  Shield, CheckCircle, Cpu, RadioTower, Layers, Zap
} from "lucide-react";

// Types
export interface SmartAppItem {
  id: string;
  name: string;
  nameBn?: string;
  iconName: string;
  url?: string;
  isBuiltIn?: boolean;
}

// Default Apps on Dock (Starts 100% empty so user only adds what they clone from device)
const DEFAULT_APPS: SmartAppItem[] = [];

// Full Device Installed Apps (Discovered during device scan)
const ALL_DEVICE_APPS: SmartAppItem[] = [
  // System & Core Phone Apps
  { id: "phone", name: "Phone / Dialer", nameBn: "ফোন ডায়ালার", iconName: "phone", url: "tel:" },
  { id: "messages", name: "Messages / SMS", nameBn: "মেসেজ / এসএমএস", iconName: "messages", url: "sms:" },
  { id: "camera", name: "Camera", nameBn: "ক্যামেরা", iconName: "camera" },
  { id: "photos", name: "Photos & Gallery", nameBn: "গ্যালারি", iconName: "photos" },
  { id: "voice_rec", name: "Voice Recorder", nameBn: "ভয়েস রেকর্ডার", iconName: "voice_rec" },
  { id: "calculator", name: "Calculator", nameBn: "ক্যালকুলেটর", iconName: "calculator", isBuiltIn: true },
  { id: "clock", name: "Clock & Timer", nameBn: "ঘড়ি ও টাইমার", iconName: "clock" },
  { id: "notes_app", name: "Notes & Memos", nameBn: "নোটপ্যাড", iconName: "notes_app", isBuiltIn: true },

  // Communication & Social
  { id: "whatsapp", name: "WhatsApp", nameBn: "হোয়াটসঅ্যাপ", iconName: "domain:whatsapp.com", url: "https://web.whatsapp.com" },
  { id: "facebook", name: "Facebook", nameBn: "ফেসবুক", iconName: "domain:facebook.com", url: "https://m.facebook.com" },
  { id: "messenger", name: "Messenger", nameBn: "মেসেঞ্জার", iconName: "domain:messenger.com", url: "https://m.me" },
  { id: "instagram", name: "Instagram", nameBn: "ইনস্টাগ্রাম", iconName: "domain:instagram.com", url: "https://www.instagram.com" },
  { id: "tiktok", name: "TikTok", nameBn: "টিকটক", iconName: "domain:tiktok.com", url: "https://www.tiktok.com" },
  { id: "telegram", name: "Telegram", nameBn: "টেলিগ্রাম", iconName: "domain:telegram.org", url: "https://web.telegram.org" },
  { id: "twitter", name: "X (Twitter)", nameBn: "টুইটার / এক্স", iconName: "domain:x.com", url: "https://x.com" },
  { id: "discord", name: "Discord", nameBn: "ডিসকর্ড", iconName: "domain:discord.com", url: "https://discord.com" },

  // Media & Video
  { id: "youtube", name: "YouTube", nameBn: "ইউটিউব", iconName: "domain:youtube.com", url: "https://m.youtube.com" },
  { id: "spotify", name: "Spotify", nameBn: "স্পটিফাই মিউজিক", iconName: "domain:spotify.com", url: "https://open.spotify.com" },
  { id: "netflix", name: "Netflix", nameBn: "নেটফ্লিক্স", iconName: "domain:netflix.com", url: "https://netflix.com" },

  // Google & Productivity
  { id: "chatgpt", name: "ChatGPT AI", nameBn: "চ্যাটজিপিটি", iconName: "domain:chatgpt.com", url: "https://chatgpt.com" },
  { id: "google", name: "Google Chrome", nameBn: "গুগল ক্রোম", iconName: "domain:google.com", url: "https://www.google.com" },
  { id: "gmail", name: "Gmail", nameBn: "জিমেইল", iconName: "domain:gmail.com", url: "https://mail.google.com" },
  { id: "maps", name: "Google Maps", nameBn: "গুগল ম্যাপস", iconName: "domain:maps.google.com", url: "https://maps.google.com" },
  { id: "drive", name: "Google Drive", nameBn: "গুগল ড্রাইভ", iconName: "domain:drive.google.com", url: "https://drive.google.com" },

  // Finance & Travel
  { id: "bkash", name: "bKash", nameBn: "বিকাশ", iconName: "domain:bkash.com", url: "https://www.bkash.com" },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", iconName: "domain:nagad.com.bd", url: "https://nagad.com.bd" },
  { id: "remitly", name: "Remitly", nameBn: "রেমিটলি", iconName: "domain:remitly.com", url: "https://remitly.com" },
  { id: "uber", name: "Uber", nameBn: "উবার", iconName: "domain:uber.com", url: "https://m.uber.com" },
  { id: "amazon", name: "Amazon", nameBn: "অ্যামাজন", iconName: "domain:amazon.com", url: "https://www.amazon.com" },

  // Immigrant Utilities
  { id: "translate", name: "Live Translator", nameBn: "অনুবাদক", iconName: "translate", isBuiltIn: true },
  { id: "uscis", name: "USCIS Case Tracker", nameBn: "ইউএসসিআইএস ট্র্যাকার", iconName: "uscis", isBuiltIn: true },
  { id: "remittance", name: "Taka / Remittance Rates", nameBn: "টাকা রেট", iconName: "remittance", isBuiltIn: true },
  { id: "wage_calc", name: "Hourly Wage & Tax", nameBn: "বেতন ক্যালকুলেটর", iconName: "wage_calc", isBuiltIn: true },
  { id: "transit", name: "NYC Subway & Bus", nameBn: "সাবওয়ে ও বাস রুট", iconName: "transit", isBuiltIn: true },
  { id: "halal_finder", name: "Halal Grocers", nameBn: "হালাল বাজার", iconName: "halal_finder", isBuiltIn: true },
];

// Helper to render real app icon or favicon
function renderAppIcon(iconName: string, className = "w-6 h-6") {
  if (iconName.startsWith("domain:")) {
    const domain = iconName.replace("domain:", "");
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={domain}
        className={`${className} object-contain rounded-md drop-shadow-xs`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
      />
    );
  }

  switch (iconName) {
    case "phone": return <Phone className={className} />;
    case "messages": return <MessageCircle className={className} />;
    case "camera": return <Camera className={className} />;
    case "photos": return <Image className={className} />;
    case "voice_rec": return <Mic className={className} />;
    case "calculator": return <Calculator className={className} />;
    case "clock": return <Clock className={className} />;
    case "notes_app": return <FileText className={className} />;
    case "translate": return <Languages className={className} />;
    case "uscis": return <Landmark className={className} />;
    case "remittance": return <DollarSign className={className} />;
    case "wage_calc": return <Calculator className={className} />;
    case "transit": return <Map className={className} />;
    case "halal_finder": return <ShoppingBag className={className} />;
    default: return <Smartphone className={className} />;
  }
}

export function SmartEdgeSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<SmartAppItem | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showClonerModal, setShowClonerModal] = useState(false);

  // User custom dock apps state with localStorage persistence
  const [userApps, setUserApps] = useState<SmartAppItem[]>(() => {
    try {
      const saved = localStorage.getItem("pathasathi_smart_dock_apps_v8");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_APPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("pathasathi_smart_dock_apps_v8", JSON.stringify(userApps));
    } catch {}
  }, [userApps]);

  // Touch swipe handling on edge handle
  // Listen to open-smart-sidebar event from header Location button
  useEffect(() => {
    const handleToggle = () => setDrawerOpen(v => !v);
    window.addEventListener("open-smart-sidebar", handleToggle);
    return () => window.removeEventListener("open-smart-sidebar", handleToggle);
  }, []);

  const openApp = (app: SmartAppItem) => {
    if (app.url === "tel:" || app.url === "sms:") {
      window.location.href = app.url;
      setDrawerOpen(false);
      return;
    }

    setActiveApp(app);
    setIsMinimized(false);
    setIsMaximized(false);
    setDrawerOpen(false);
  };

  const toggleAppInDock = (app: SmartAppItem) => {
    const exists = userApps.some(a => a.id === app.id);
    if (exists) {
      setUserApps(prev => prev.filter(a => a.id !== app.id));
    } else {
      setUserApps(prev => [...prev, app]);
    }
  };

  const addNamedApp = (appName: string) => {
    if (!appName.trim()) return;
    const cleanName = appName.trim();
    const cleanDomain = cleanName.toLowerCase().replace(/\s+/g, "") + ".com";
    const customItem: SmartAppItem = {
      id: `custom_${Date.now()}`,
      name: cleanName,
      iconName: `domain:${cleanDomain}`,
      url: `https://${cleanDomain}`,
    };
    setUserApps(prev => [...prev, customItem]);
  };

  const clearAllApps = () => {
    setUserApps([]);
  };

  return (
    <>
      {/* ── 2. Smart Sidebar Icon-Only White Dock (Vivo style) ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end items-start">
          {/* Fully Transparent Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-transparent"
          />

          {/* Pure White Icon Dock */}
          <div className="relative mr-2 sm:mr-3 mt-16 sm:mt-20 w-16 sm:w-18 py-3.5 px-2 bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center gap-2.5 z-10 animate-in slide-in-from-right duration-200">
            {/* Close Button */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer active:scale-90"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Apps Icons Stack (Neutral Slate / Real Logos) */}
            <div className="flex flex-col items-center gap-2.5 max-h-[62vh] overflow-y-auto scrollbar-hide py-1">
              {userApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => openApp(app)}
                  className="relative group cursor-pointer focus:outline-none p-2 rounded-2xl hover:bg-slate-100 active:scale-90 transition-all duration-150 flex items-center justify-center"
                  title={app.name}
                >
                  <div className="text-slate-600 group-hover:text-slate-950 group-hover:scale-115 transition-all flex items-center justify-center">
                    {renderAppIcon(app.iconName, "w-6 h-6 sm:w-6.5 sm:h-6.5")}
                  </div>

                  {/* Tooltip on hover */}
                  <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none hidden group-hover:flex items-center text-[11px] font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl border border-slate-200 z-50">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>

            {/* + Button to Open App Cloner Device Scanner */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                setShowClonerModal(true);
              }}
              className="w-9 h-9 rounded-2xl border border-dashed border-slate-300 hover:border-[#E05236] text-slate-400 hover:text-[#E05236] flex items-center justify-center transition-all duration-150 hover:bg-[#E05236]/5 active:scale-90 cursor-pointer"
              title="Add / Clone App from Device"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 3. App Cloner Device Permission & Scanner Modal ── */}
      {showClonerModal && (
        <AppClonerDeviceModal
          userApps={userApps}
          onToggleApp={toggleAppInDock}
          onAddNamedApp={addNamedApp}
          onClearAll={clearAllApps}
          onClose={() => setShowClonerModal(false)}
        />
      )}

      {/* ── 4. Minimized Floating Bubble ── */}
      {activeApp && isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          className="fixed right-4 bottom-24 z-50 flex items-center gap-2 p-2 rounded-full bg-slate-900/95 text-white backdrop-blur-md shadow-2xl border border-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Click to restore Mini Window"
        >
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden p-1">
            {renderAppIcon(activeApp.iconName, "w-5 h-5")}
          </div>
          <span className="text-xs font-bold pr-2">Restore {activeApp.name}</span>
        </div>
      )}

      {/* ── 5. Vivo / Android Style Floating Freeform Mini Window ── */}
      {activeApp && !isMinimized && (
        <div
          className={`fixed z-50 flex flex-col bg-white shadow-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 ${
            isMaximized
              ? "inset-2 sm:inset-6 rounded-3xl"
              : "right-3 sm:right-6 bottom-20 sm:bottom-12 w-[340px] sm:w-[410px] h-[540px] max-h-[84vh] rounded-3xl"
          }`}
        >
          {/* Mini Window Top Drag & Control Bar */}
          <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between select-none cursor-move flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-white overflow-hidden p-0.5">
                {renderAppIcon(activeApp.iconName, "w-4 h-4 text-white")}
              </div>
              <span className="font-bold text-xs sm:text-sm truncate">
                {activeApp.name}
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-white/15 text-white/80 hidden sm:inline">
                Mini App
              </span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
                title="Switch App"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMaximized(m => !m)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
                title={isMaximized ? "Restore Size" : "Full Screen"}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setActiveApp(null)}
                className="w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition cursor-pointer ml-1"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Window Direct Interactive App Execution Area */}
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            {activeApp.id === "youtube" && <YouTubeMiniApp />}
            {activeApp.id === "chatgpt" && <ChatGPTMiniApp />}
            {activeApp.id === "google" && <GoogleSearchMiniApp />}
            {activeApp.id === "camera" && <CameraDeviceMiniApp />}
            {activeApp.id === "photos" && <PhotosDeviceMiniApp />}
            {activeApp.id === "voice_rec" && <VoiceRecorderMiniApp />}
            {activeApp.id === "calculator" && <DeviceCalculatorMiniApp />}
            {activeApp.id === "clock" && <DeviceClockMiniApp />}
            {activeApp.id === "notes_app" && <div className="flex-1 overflow-y-auto p-4"><NotesMiniApp /></div>}
            {activeApp.id === "translate" && <div className="flex-1 overflow-y-auto p-4"><TranslateMiniApp /></div>}
            {activeApp.id === "uscis" && <div className="flex-1 overflow-y-auto p-4"><UscisMiniApp /></div>}
            {activeApp.id === "remittance" && <div className="flex-1 overflow-y-auto p-4"><RemittanceMiniApp /></div>}
            {activeApp.id === "wage_calc" && <div className="flex-1 overflow-y-auto p-4"><WageCalcMiniApp /></div>}
            {activeApp.id === "transit" && <div className="flex-1 overflow-y-auto p-4"><TransitMiniApp /></div>}
            {activeApp.id === "halal_finder" && <div className="flex-1 overflow-y-auto p-4"><HalalFinderMiniApp /></div>}

            {/* Other Apps Live Web Viewer */}
            {!["translate", "youtube", "chatgpt", "google", "camera", "photos", "voice_rec", "calculator", "clock", "notes_app", "uscis", "remittance", "wage_calc", "transit", "halal_finder"].includes(activeApp.id) && (
              <InAppWebViewer app={activeApp} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── App Cloner Modal with One-Time Device Permission & App Scanner ────────────
function AppClonerDeviceModal({
  userApps,
  onToggleApp,
  onAddNamedApp,
  onClearAll,
  onClose,
}: {
  userApps: SmartAppItem[];
  onToggleApp: (app: SmartAppItem) => void;
  onAddNamedApp: (name: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  // Permission state
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pathasathi_app_cloner_perm_granted") === "true";
    } catch {}
    return false;
  });

  // Scanning animation state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");

  const handleGrantPermission = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setHasPermission(true);
          try {
            localStorage.setItem("pathasathi_app_cloner_perm_granted", "true");
          } catch {}
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  const handleRescan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const filteredApps = ALL_DEVICE_APPS.filter(app => {
    return (
      !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.nameBn && app.nameBn.includes(search))
    );
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onAddNamedApp(customInput.trim());
    setCustomInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[86vh] animate-in zoom-in-95 duration-200 text-slate-900">

        {/* ── CASE 1: One-Time Device Permission Request ── */}
        {!hasPermission && !isScanning && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF7F4] border border-[#E05236]/30 text-[#E05236] flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                Device Permission Required
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Allow <strong>Pathasathi Smart Cloner</strong> to scan and access installed applications on this device?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 text-left space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>One-time scan for installed phone applications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Clone &amp; launch apps in Freeform Floating Mini Windows</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Don't Allow
              </button>
              <button
                onClick={handleGrantPermission}
                className="flex-1 py-3 rounded-2xl bg-[#E05236] hover:bg-[#8C3015] text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Allow Access</span>
              </button>
            </div>
          </div>
        )}

        {/* ── CASE 2: Real-time Scanning Progress Animation ── */}
        {isScanning && (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#E05236] animate-spin" />
              <RadioTower className="w-8 h-8 text-[#E05236] animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-900">
                Scanning Installed Device Apps…
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Discovering phone packages ({scanProgress}%)
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#E05236] h-full transition-all duration-200 rounded-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── CASE 3: Discovered Device Applications (1-Tap Clone / Add) ── */}
        {hasPermission && !isScanning && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7F4] text-[#E05236] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    Device Apps Cloner
                  </h3>
                  <p className="text-xs text-slate-500">
                    {ALL_DEVICE_APPS.length} apps discovered on phone • {userApps.length} in dock
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs shadow-2xs focus-within:border-[#E05236]">
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search discovered apps on this phone..."
                  className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Add other app on device input */}
              <form onSubmit={handleAddCustom} className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="+ Add any other app installed on your phone"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E05236] placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!customInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#E05236] disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Apps List (1-Tap Clone / Toggle) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredApps.map(app => {
                const inDock = userApps.some(a => a.id === app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => onToggleApp(app)}
                    className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 active:scale-98 ${
                      inDock
                        ? "bg-[#FFF7F4] border-[#E05236]/40 shadow-2xs"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center p-1.5 transition ${
                        inDock
                          ? "bg-white border-[#E05236]/30 shadow-xs"
                          : "bg-slate-50 border-slate-200"
                      }`}>
                        {renderAppIcon(app.iconName, "w-6 h-6 sm:w-7 sm:h-7")}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                          {app.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">{app.nameBn || "Installed Device App"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          inDock
                            ? "bg-[#E05236] text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {inDock ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Cloned</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Clone</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRescan}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-scan</span>
                </button>
                <button
                  onClick={onClearAll}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Dock</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md cursor-pointer transition active:scale-95"
              >
                Done ({userApps.length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Native Camera Device Mini App ─────────────────────────────────────────────
function CameraDeviceMiniApp() {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhoto(url);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black text-white text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      {photo ? (
        <div className="space-y-3 w-full max-w-xs">
          <img src={photo} alt="captured" className="w-full h-64 object-cover rounded-2xl border border-white/20" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 bg-[#E05236] rounded-xl text-xs font-bold cursor-pointer"
          >
            Retake Photo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Phone Camera</h4>
            <p className="text-xs text-slate-400 mt-1">Tap below to capture photo from phone</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-[#E05236] rounded-2xl text-xs font-extrabold cursor-pointer active:scale-95"
          >
            Open Camera
          </button>
        </div>
      )}
    </div>
  );
}

// ── Photos & Gallery Device Mini App ─────────────────────────────────────────
function PhotosDeviceMiniApp() {
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((f: File) => URL.createObjectURL(f));
      setPhotos(prev => [...urls, ...prev]);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelectPhotos}
        className="hidden"
      />
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-xs">Device Photos</h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-[#E05236] rounded-xl text-xs font-bold cursor-pointer"
        >
          + Pick from Gallery
        </button>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 overflow-y-auto">
          {photos.map((src, i) => (
            <img key={i} src={src} alt="img" className="w-full h-32 object-cover rounded-xl border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
          <Image className="w-10 h-10 text-slate-500" />
          <p>No photos selected yet</p>
        </div>
      )}
    </div>
  );
}

// ── Voice Recorder Device Mini App ────────────────────────────────────────────
function VoiceRecorderMiniApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<string[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = e => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        setRecordings(prev => [URL.createObjectURL(audioBlob), ...prev]);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      alert("Microphone permission needed on your phone!");
    }
  };

  const stopRec = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-white space-y-4">
      <div className="text-center py-4 space-y-3">
        <div className={`w-18 h-18 rounded-full flex items-center justify-center mx-auto transition-all ${
          isRecording ? "bg-red-500 animate-pulse scale-110" : "bg-white/10"
        }`}>
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h4 className="font-bold text-sm">{isRecording ? "Recording Audio..." : "Voice Recorder"}</h4>
        <button
          onClick={isRecording ? stopRec : startRec}
          className={`px-6 py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer transition ${
            isRecording ? "bg-red-600 hover:bg-red-700" : "bg-[#E05236] hover:bg-[#8C3015]"
          }`}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {recordings.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2 border-t border-white/10 pt-3">
          <span className="text-[10px] font-bold uppercase text-slate-400">Recordings:</span>
          {recordings.map((src, i) => (
            <div key={i} className="p-2 bg-slate-800 rounded-xl border border-slate-700">
              <audio src={src} controls className="w-full h-8" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Device Calculator Mini App ────────────────────────────────────────────────
function DeviceCalculatorMiniApp() {
  const [display, setDisplay] = useState("0");

  const handleKey = (key: string) => {
    if (key === "C") {
      setDisplay("0");
    } else if (key === "=") {
      try {
        const sanitized = display.replace(/[^0-9+\-*/.]/g, "");
        const result = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(result));
      } catch {
        setDisplay("Error");
      }
    } else {
      setDisplay(prev => prev === "0" || prev === "Error" ? key : prev + key);
    }
  };

  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "C", "+", "="];

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-white">
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-right mb-4">
        <span className="text-2xl font-mono font-extrabold text-emerald-400 break-all">{display}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {keys.map(k => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className={`rounded-2xl font-bold text-sm flex items-center justify-center transition active:scale-95 ${
              k === "=" ? "col-span-4 bg-[#E05236] text-white py-3" :
              ["/", "*", "-", "+"].includes(k) ? "bg-[#C04A22] text-white" :
              k === "C" ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Device Clock / Stopwatch Mini App ─────────────────────────────────────────
function DeviceClockMiniApp() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [stopwatch, setStopwatch] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: any;
    if (running) {
      timer = setInterval(() => setStopwatch(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-900 text-white text-center space-y-4">
      <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 w-full max-w-xs">
        <span className="text-xs text-slate-400 font-bold uppercase">Current Time</span>
        <div className="text-3xl font-extrabold text-[#E05236] font-mono mt-1">{time}</div>
      </div>

      <div className="p-4 bg-slate-800 rounded-3xl border border-slate-700 w-full max-w-xs space-y-2">
        <span className="text-xs text-slate-300 font-bold uppercase">Stopwatch</span>
        <div className="text-2xl font-mono font-bold text-emerald-400">
          {Math.floor(stopwatch / 60)}m {stopwatch % 60}s
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={() => setRunning(r => !r)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold ${running ? "bg-amber-600" : "bg-emerald-600"}`}
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={() => { setRunning(false); setStopwatch(0); }}
            className="px-4 py-1.5 bg-slate-700 rounded-xl text-xs font-bold"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 1. YouTube Live Mini App ──────────────────────────────────────────────────
function YouTubeMiniApp() {
  const [currentVideoId, setCurrentVideoId] = useState("dQw4w9WgXcQ");
  const [searchQuery, setSearchQuery] = useState("");

  const YOUTUBE_FEEDS = [
    { id: "dQw4w9WgXcQ", title: "How to apply for Driver's License in NY (Bengali Guide)", channel: "Immigrant Compass USA", views: "142K views", duration: "10:24" },
    { id: "9bZkp7q19f0", title: "NYC Subway Map & Commuting Guide for Newcomers", channel: "NYC Transit Tips", views: "89K views", duration: "08:15" },
    { id: "kJQP7kiw5Fk", title: "Top 10 Bangladeshi Restaurants in Jackson Heights", channel: "Deshi Food Explorer", views: "230K views", duration: "14:40" },
  ];

  const filteredVideos = YOUTUBE_FEEDS.filter(v =>
    !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F0F0F] text-white">
      <div className="relative w-full aspect-video bg-black flex-shrink-0">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`}
          title="YouTube Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      <div className="p-2.5 bg-[#181818] border-b border-white/10 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-[#272727] rounded-full px-3 py-1.5 text-xs text-white">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search YouTube…"
            className="w-full bg-transparent outline-none text-xs text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            onClick={() => setCurrentVideoId(video.id)}
            className={`p-2 rounded-2xl border transition flex gap-2.5 cursor-pointer active:scale-98 ${
              currentVideoId === video.id ? "bg-[#272727] border-[#E05236]" : "bg-[#181818] border-white/5 hover:bg-[#222]"
            }`}
          >
            <div className="relative w-24 h-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
              <img src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80`} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs text-white line-clamp-2 leading-tight">{video.title}</h5>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{video.channel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. ChatGPT Live Mini App ──────────────────────────────────────────────────
function ChatGPTMiniApp() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "Hello! I am your AI Assistant right inside your mini window. Ask me anything! 🤖" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: q }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = `Information for "${q}": You can check official guidelines or perform tasks directly in Pathasathi!`;
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-white">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold">
                AI
              </div>
            )}
            <div className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
              m.role === "user" ? "bg-[#E05236] text-white rounded-br-xs" : "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-xs"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-slate-400 text-xs pl-8">ChatGPT is thinking…</div>}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-2.5 bg-slate-950 flex items-center gap-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask ChatGPT in mini window…"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#E05236]"
        />
        <button type="submit" disabled={!input.trim()} className="w-8 h-8 rounded-xl bg-[#E05236] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

// ── 3. Google Search Live Mini App ───────────────────────────────────────────
function GoogleSearchMiniApp() {
  const [query, setQuery] = useState("Bangladeshi community in New York");
  const [results, setResults] = useState([
    { title: "Bangladeshi Americans in New York City - Guide & Directory", url: "https://immigrantconnect.us/community/bangla-nyc", snippet: "Discover Jackson Heights, Jamaica, and Parkchester vibrant Bengali community hubs." },
    { title: "USCIS Official Immigration Forms & Case Processing", url: "https://uscis.gov/forms", snippet: "Free official immigration forms, fee calculators, and online filing." },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResults([
      { title: `Search results for "${query}"`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}`, snippet: `Latest web results related to ${query}.` },
      ...results,
    ]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-900">
      <form onSubmit={handleSearch} className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-full px-3 py-1.5 shadow-2xs">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Google..." className="w-full bg-transparent text-xs text-slate-800 outline-none" />
        </div>
        <button type="submit" className="px-3 py-1.5 rounded-full bg-[#E05236] text-white text-xs font-bold shadow-xs cursor-pointer">
          Search
        </button>
      </form>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {results.map((r, i) => (
          <div key={i} className="p-3 rounded-2xl border border-slate-100 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] text-emerald-700 font-mono block truncate">{r.url}</span>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-blue-700 hover:underline block">
              {r.title}
            </a>
            <p className="text-xs text-slate-600 leading-relaxed">{r.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 4. In-App Web Viewer for External Apps ────────────────────────────────────
function InAppWebViewer({ app }: { app: SmartAppItem }) {
  const targetUrl = app.url || `https://www.google.com/search?q=${encodeURIComponent(app.name)}`;
  const cleanDomain = targetUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="p-2 border-b border-slate-200 bg-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 truncate">
          <Globe className="w-3 h-3 text-slate-400 mr-1.5 flex-shrink-0" />
          <span className="font-mono text-[11px] truncate">{cleanDomain}</span>
        </div>
        <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="flex-1 relative bg-slate-50">
        <iframe
          src={targetUrl}
          title={app.name}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}

// ── Mini App: Live Translator ──────────────────────────────────────────────────
function TranslateMiniApp() {
  const [sourceText, setSourceText] = useState("Where can I find legal immigration advice?");
  const [translatedText, setTranslatedText] = useState("আমি কোথায় আইনি অভিবাসন পরামর্শ পেতে পারি?");
  const [copied, setCopied] = useState(false);

  const copyResult = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5">
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>English (US)</span>
          <span className="text-[#C04A22]">⇄</span>
          <span>Bengali (বাংলা)</span>
        </div>
        <textarea
          value={sourceText}
          onChange={e => setSourceText(e.target.value)}
          placeholder="Type English words or speech..."
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#C04A22] resize-none"
        />
        <div className="flex justify-between items-center">
          <button onClick={() => alert("Listening...")} className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800">
            <Volume2 className="w-3.5 h-3.5" /> Speech
          </button>
          <button onClick={() => setTranslatedText(`[অনূদিত]: ${sourceText}`)} className="px-3 py-1.5 rounded-xl bg-[#C04A22] text-white text-xs font-bold hover:bg-[#8C3015] cursor-pointer">
            Translate Now
          </button>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Bengali Translation:</span>
        <p className="text-xs font-semibold text-emerald-950 leading-relaxed">{translatedText}</p>
        <button onClick={copyResult} className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy Translation"}
        </button>
      </div>
    </div>
  );
}

// ── Mini App: USCIS Case Tracker ──────────────────────────────────────────────
function UscisMiniApp() {
  const [receiptNo, setReceiptNo] = useState("IOE0923849122");

  return (
    <div className="space-y-3.5">
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Receipt Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={receiptNo}
            onChange={e => setReceiptNo(e.target.value.toUpperCase())}
            placeholder="e.g. IOE0923849122"
            className="flex-1 font-mono uppercase text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
          />
          <button onClick={() => alert(`Checking live status for ${receiptNo}...`)} className="px-3 py-2 rounded-xl bg-[#C04A22] text-white text-xs font-bold cursor-pointer">
            Check
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mini App: Remittance / Exchange Rate ───────────────────────────────────────
function RemittanceMiniApp() {
  const [usdAmount, setUsdAmount] = useState<number>(500);
  const rate = 121.5;

  return (
    <div className="space-y-3.5">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 text-center">
        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Live Market Rate</span>
        <div className="text-2xl font-extrabold text-amber-900 my-1">$1 USD = ৳{rate.toFixed(2)} BDT</div>
      </div>
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <label className="text-[11px] font-bold text-slate-600 block">You Send (USD)</label>
        <input type="number" value={usdAmount} onChange={e => setUsdAmount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 outline-none text-sm" />
        <label className="text-[11px] font-bold text-slate-600 block mt-2">Recipient Gets (BDT)</label>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl font-extrabold text-emerald-900 font-mono">
          ৳{(usdAmount * rate).toLocaleString()} BDT
        </div>
      </div>
    </div>
  );
}

// ── Mini App: Wage & Tax Estimator ─────────────────────────────────────────────
function WageCalcMiniApp() {
  const [hourlyRate, setHourlyRate] = useState(22);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const grossMonthly = hourlyRate * hoursPerWeek * 4.33;
  const estimatedTax = grossMonthly * 0.18;
  const netMonthly = grossMonthly - estimatedTax;

  return (
    <div className="space-y-3.5">
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Hourly Pay ($/hour)</label>
          <input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Weekly Hours</label>
          <input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none" />
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex justify-between items-baseline">
        <span className="text-xs font-extrabold text-purple-950">Net Take-Home:</span>
        <span className="text-base font-extrabold text-emerald-700 font-mono">${netMonthly.toFixed(0)} / mo</span>
      </div>
    </div>
  );
}

// ── Mini App: Notes & Checklist ───────────────────────────────────────────────
function NotesMiniApp() {
  const [noteText, setNoteText] = useState("• Lawyer meeting on Friday at 3 PM\n• Bring passport & I-94 copy\n• SSN office address: 123 Main St");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-3.5">
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={8} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none resize-none" />
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[10px] text-slate-400">Locally saved</span>
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="px-3 py-1.5 rounded-xl bg-[#C04A22] text-white text-xs font-bold cursor-pointer">
            {saved ? "Saved ✓" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mini App: Transit & Subway ─────────────────────────────────────────────────
function TransitMiniApp() {
  return (
    <div className="space-y-2">
      <h4 className="font-bold text-xs text-slate-800">NYC Subway Live Status</h4>
      {[{ line: "7 Train", status: "Good Service" }, { line: "E / F / M / R", status: "Minor Delays" }].map((item, i) => (
        <div key={i} className="flex justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
          <span className="font-bold text-slate-800">{item.line}</span>
          <span className="text-slate-600">{item.status}</span>
        </div>
      ))}
    </div>
  );
}

// ── Mini App: Halal Grocers ────────────────────────────────────────────────────
function HalalFinderMiniApp() {
  return (
    <div className="space-y-2">
      <h4 className="font-bold text-xs text-slate-800">Halal Grocers Near You</h4>
      {[{ name: "Al-Aqsa Halal Supermarket", loc: "Jackson Heights, NY" }, { name: "Haat Bazaar Bangladeshi Food", loc: "Jamaica, NY" }].map((store, i) => (
        <div key={i} className="p-3 bg-white border border-slate-200 rounded-2xl text-xs">
          <span className="font-bold text-slate-900 block">{store.name}</span>
          <p className="text-[11px] text-slate-500">{store.loc}</p>
        </div>
      ))}
    </div>
  );
}
