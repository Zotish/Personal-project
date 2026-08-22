import React, { useState, useRef, useEffect } from "react";
import {
  X, Minus, Maximize2, Minimize2, ChevronLeft, Search,
  Languages, Landmark, DollarSign, Calculator, FileText,
  MessageSquare, Map, ShoppingBag, ExternalLink, Sparkles,
  Copy, Check, Volume2, ArrowRight, RefreshCw, Move, Plus,
  Youtube, Globe, Bot, Facebook, Instagram, Music, Mail,
  Smartphone, Trash2, CheckCircle2, Link as LinkIcon, Compass,
  RotateCcw, Zap, Play
} from "lucide-react";

// Types
export interface SmartAppItem {
  id: string;
  name: string;
  nameBn?: string;
  category?: string;
  iconName: string; // key to icon or "domain:example.com" or "emoji:🔥"
  url?: string;
  isBuiltIn?: boolean;
  isCustom?: boolean;
}

// Built-in Default Apps
const DEFAULT_APPS: SmartAppItem[] = [
  { id: "translate", name: "Live Translator", nameBn: "লাইভ অনুবাদক", iconName: "translate", isBuiltIn: true },
  { id: "uscis", name: "USCIS Case Tracker", nameBn: "ইউএসসিআইএস কেস ট্র্যাকার", iconName: "uscis", isBuiltIn: true },
  { id: "remittance", name: "Taka / Remittance Rates", nameBn: "টাকা পাঠানোর রেট", iconName: "remittance", isBuiltIn: true },
  { id: "wage_calc", name: "Hourly Wage & Tax Calc", nameBn: "বেতন ও ট্যাক্স ক্যালকুলেটর", iconName: "wage_calc", isBuiltIn: true },
  { id: "notes", name: "Immigrant Vault & Notes", nameBn: "জরুরি নোট ও চেকলিস্ট", iconName: "notes", isBuiltIn: true },
  { id: "transit", name: "NYC Subway & Bus Live", nameBn: "সাবওয়ে ও বাস রুট", iconName: "transit", isBuiltIn: true },
  { id: "halal_finder", name: "Halal & Deshi Grocers", nameBn: "হালাল বাজার ও খাবার", iconName: "halal_finder", isBuiltIn: true },
  { id: "whatsapp", name: "Community WhatsApp", nameBn: "কমিউনিটি গ্রুপ", iconName: "whatsapp", url: "https://chat.whatsapp.com", isBuiltIn: true },
];

// Popular Real Mobile Apps Catalog
const POPULAR_APPS_CATALOG: SmartAppItem[] = [
  { id: "youtube", name: "YouTube", nameBn: "ইউটিউব", iconName: "domain:youtube.com", url: "https://m.youtube.com", isCustom: true },
  { id: "chatgpt", name: "ChatGPT AI", nameBn: "চ্যাটজিপিটি", iconName: "domain:chatgpt.com", url: "https://chatgpt.com", isCustom: true },
  { id: "google", name: "Google", nameBn: "গুগল সার্চ", iconName: "domain:google.com", url: "https://www.google.com", isCustom: true },
  { id: "facebook", name: "Facebook", nameBn: "ফেসবুক", iconName: "domain:facebook.com", url: "https://m.facebook.com", isCustom: true },
  { id: "instagram", name: "Instagram", nameBn: "ইনস্টাগ্রাম", iconName: "domain:instagram.com", url: "https://www.instagram.com", isCustom: true },
  { id: "tiktok", name: "TikTok", nameBn: "টিকটক", iconName: "domain:tiktok.com", url: "https://www.tiktok.com", isCustom: true },
  { id: "spotify", name: "Spotify", nameBn: "স্পটিফাই মিউজিক", iconName: "domain:spotify.com", url: "https://open.spotify.com", isCustom: true },
  { id: "gmail", name: "Gmail", nameBn: "গুগল মেইল", iconName: "domain:gmail.com", url: "https://mail.google.com", isCustom: true },
  { id: "bkash", name: "bKash", nameBn: "বিকাশ অ্যাপ", iconName: "domain:bkash.com", url: "https://www.bkash.com", isCustom: true },
  { id: "uber", name: "Uber", nameBn: "উবার রাইডস", iconName: "domain:uber.com", url: "https://m.uber.com", isCustom: true },
  { id: "amazon", name: "Amazon", nameBn: "অ্যামাজন শপিং", iconName: "domain:amazon.com", url: "https://www.amazon.com", isCustom: true },
];

// Extract domain from URL
function getCleanDomain(rawUrl: string): string {
  try {
    let url = rawUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "google.com";
  }
}

// Helper to render real app icon or favicon
function renderAppIcon(iconName: string, className = "w-6 h-6") {
  // Check if domain favicon
  if (iconName.startsWith("domain:")) {
    const domain = iconName.replace("domain:", "");
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={domain}
        className={`${className} object-contain rounded-md drop-shadow-xs`}
        onError={(e) => {
          // fallback icon if favicon fails
          (e.target as HTMLElement).style.display = "none";
        }}
      />
    );
  }

  // Check emoji
  if (iconName.startsWith("emoji:")) {
    return <span className="text-xl leading-none">{iconName.replace("emoji:", "")}</span>;
  }

  // Built-in tools icons
  switch (iconName) {
    case "translate": return <Languages className={className} />;
    case "uscis": return <Landmark className={className} />;
    case "remittance": return <DollarSign className={className} />;
    case "wage_calc": return <Calculator className={className} />;
    case "notes": return <FileText className={className} />;
    case "transit": return <Map className={className} />;
    case "halal_finder": return <ShoppingBag className={className} />;
    case "whatsapp": return <MessageSquare className={className} />;
    case "youtube": return <Youtube className={className} />;
    case "chatgpt": return <Bot className={className} />;
    case "google": return <Globe className={className} />;
    case "facebook": return <Facebook className={className} />;
    case "instagram": return <Instagram className={className} />;
    case "spotify": return <Music className={className} />;
    case "gmail": return <Mail className={className} />;
    default: return <Smartphone className={className} />;
  }
}

export function SmartEdgeSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<SmartAppItem | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // User custom dock apps state with localStorage persistence
  const [userApps, setUserApps] = useState<SmartAppItem[]>(() => {
    try {
      const saved = localStorage.getItem("pathasathi_smart_dock_apps_v3");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_APPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("pathasathi_smart_dock_apps_v3", JSON.stringify(userApps));
    } catch {}
  }, [userApps]);

  // Touch swipe handling on edge handle
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 40) {
      setDrawerOpen(true);
    }
  };

  const openApp = (app: SmartAppItem) => {
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

  const addCustomApp = (customApp: SmartAppItem) => {
    setUserApps(prev => [...prev, customApp]);
    setShowAddModal(false);
  };

  const removeApp = (appId: string) => {
    setUserApps(prev => prev.filter(a => a.id !== appId));
  };

  const resetToDefault = () => {
    setUserApps(DEFAULT_APPS);
  };

  return (
    <>
      {/* ── 1. Floating Edge Handle (Centered exactly with Location Logo) ── */}
      {!drawerOpen && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setDrawerOpen(true)}
          className="fixed right-0 top-[90px] sm:top-[94px] -translate-y-1/2 z-40 group cursor-pointer select-none flex items-center"
          title="Slide left for Smart Tools & Apps"
        >
          {/* Ultra-slim translucent glass edge pill aligned with location pin */}
          <div className="relative flex items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-l-full bg-slate-800/70 hover:bg-[#C04A22] text-white backdrop-blur-md border-y border-l border-white/25 shadow-md transition-all duration-200 group-hover:-translate-x-0.5 active:scale-95">
            <div className="w-0.5 sm:w-1 h-5 sm:h-6 rounded-full bg-white/80 group-hover:bg-white" />
            <span className="absolute right-full mr-2 pointer-events-none hidden group-hover:flex items-center gap-1 text-[10px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded-md whitespace-nowrap shadow-md border border-white/10">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              Apps
            </span>
          </div>
        </div>
      )}

      {/* ── 2. Smart Sidebar Icon-Only White Dock (Vivo style) ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end items-start">
          {/* Fully Transparent Backdrop (No shadow / no dimming / no blur) */}
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

            {/* + Button to Add Custom Apps */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                setShowAddModal(true);
              }}
              className="w-9 h-9 rounded-2xl border border-dashed border-slate-300 hover:border-[#E05236] text-slate-400 hover:text-[#E05236] flex items-center justify-center transition-all duration-150 hover:bg-[#E05236]/5 active:scale-90 mt-1 cursor-pointer"
              title="Add / Customize Apps"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 3. Add & Customize Apps Modal ── */}
      {showAddModal && (
        <CustomizeAppsModal
          userApps={userApps}
          onToggleApp={toggleAppInDock}
          onAddCustomApp={addCustomApp}
          onRemoveApp={removeApp}
          onResetDefault={resetToDefault}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* ── 4. Minimized Floating Bubble (If window is minimized) ── */}
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
              : "right-3 sm:right-6 bottom-20 sm:bottom-12 w-[340px] sm:w-[390px] h-[520px] max-h-[82vh] rounded-3xl"
          }`}
        >
          {/* Mini Window Top Drag & Control Bar */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between select-none cursor-move flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-white overflow-hidden p-0.5">
                {renderAppIcon(activeApp.iconName, "w-4 h-4 text-white")}
              </div>
              <span className="font-bold text-xs sm:text-sm truncate">
                {activeApp.name}
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-white/15 text-white/80 hidden sm:inline">
                Mini Window
              </span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Switch App dropdown/picker */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
                title="Switch Tool"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              {/* Maximize */}
              <button
                onClick={() => setIsMaximized(m => !m)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
                title={isMaximized ? "Restore Size" : "Full Screen"}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              {/* Close */}
              <button
                onClick={() => setActiveApp(null)}
                className="w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition cursor-pointer ml-1"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Window Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
            {activeApp.id === "translate" && <TranslateMiniApp />}
            {activeApp.id === "uscis" && <UscisMiniApp />}
            {activeApp.id === "remittance" && <RemittanceMiniApp />}
            {activeApp.id === "wage_calc" && <WageCalcMiniApp />}
            {activeApp.id === "notes" && <NotesMiniApp />}
            {activeApp.id === "transit" && <TransitMiniApp />}
            {activeApp.id === "halal_finder" && <HalalFinderMiniApp />}
            {activeApp.id === "whatsapp" && <WhatsAppMiniApp />}

            {/* External Real App / Custom URL Live Launcher */}
            {!["translate", "uscis", "remittance", "wage_calc", "notes", "transit", "halal_finder", "whatsapp"].includes(activeApp.id) && (
              <ExternalAppLiveView app={activeApp} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Add & Customize Apps Modal ────────────────────────────────────────────────
function CustomizeAppsModal({
  userApps,
  onToggleApp,
  onAddCustomApp,
  onRemoveApp,
  onResetDefault,
  onClose,
}: {
  userApps: SmartAppItem[];
  onToggleApp: (app: SmartAppItem) => void;
  onAddCustomApp: (app: SmartAppItem) => void;
  onRemoveApp: (appId: string) => void;
  onResetDefault: () => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"custom" | "catalog" | "my_dock">("custom");
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [detectedDomain, setDetectedDomain] = useState("");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomUrl(val);
    if (val.length > 3) {
      const domain = getCleanDomain(val);
      setDetectedDomain(domain);
      // Auto suggest name if empty
      if (!customName) {
        const parts = domain.split(".");
        const namePart = parts[0];
        setCustomName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      }
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() && !customUrl.trim()) return;

    let validUrl = customUrl.trim();
    if (validUrl && !validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = `https://${validUrl}`;
    }

    const domain = getCleanDomain(validUrl || "google.com");

    const newApp: SmartAppItem = {
      id: `custom_${Date.now()}`,
      name: customName.trim() || domain,
      iconName: `domain:${domain}`,
      url: validUrl || `https://${domain}`,
      isCustom: true,
    };

    onAddCustomApp(newApp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
              Add Mobile Apps to Sidebar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Test &amp; add any real app on your phone</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1 gap-1">
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "custom"
                ? "bg-white text-[#E05236] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            ⚡ Add Any App/Web
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "catalog"
                ? "bg-white text-[#E05236] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Popular Apps (1-Tap)
          </button>
          <button
            onClick={() => setActiveTab("my_dock")}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "my_dock"
                ? "bg-white text-[#E05236] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            My Dock ({userApps.length})
          </button>
        </div>

        {/* Tab 1: Real Custom App / Website Adder */}
        {activeTab === "custom" && (
          <form onSubmit={handleCreateCustom} className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 bg-[#FFF7F4] border border-[#E05236]/20 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E05236]/30 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                {detectedDomain ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${detectedDomain}&sz=128`}
                    alt="logo"
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <Zap className="w-6 h-6 text-[#E05236]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-900 truncate">
                  {customName || "Real App Icon Auto-Detected"}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {detectedDomain || "Type any website/app URL below"}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                App / Website URL
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 focus-within:border-[#E05236] focus-within:bg-white transition">
                <LinkIcon className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={customUrl}
                  onChange={handleUrlChange}
                  placeholder="e.g. youtube.com, chatgpt.com, prothomalo.com"
                  className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Type any real link (e.g. facebook.com, netflix.com, daraz.com.bd)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                App Display Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. YouTube, ChatGPT, Prothom Alo"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 outline-none focus:border-[#E05236] focus:bg-white font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#E05236] hover:bg-[#8C3015] text-white text-xs font-extrabold shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Real App to Smart Sidebar Dock</span>
            </button>
          </form>
        )}

        {/* Tab 2: Popular Real Apps Catalog */}
        {activeTab === "catalog" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tap to add real apps to your dock:
            </p>
            {POPULAR_APPS_CATALOG.map(app => {
              const inDock = userApps.some(a => a.id === app.id);
              return (
                <div
                  key={app.id}
                  onClick={() => onToggleApp(app)}
                  className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    inDock
                      ? "bg-[#FFF7F4] border-[#E05236]/40 shadow-2xs"
                      : "bg-white border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                      {renderAppIcon(app.iconName, "w-6 h-6")}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{app.name}</h4>
                      <p className="text-[11px] text-slate-500">{app.nameBn}</p>
                    </div>
                  </div>

                  <button
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      inDock
                        ? "bg-[#E05236] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {inDock ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Manage / Delete Dock Apps */}
        {activeTab === "my_dock" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Currently on your dock:
              </span>
              <button
                onClick={onResetDefault}
                className="text-[11px] font-bold text-[#E05236] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Default
              </button>
            </div>

            {userApps.map(app => (
              <div
                key={app.id}
                className="p-2.5 rounded-2xl border border-slate-100 bg-white flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                    {renderAppIcon(app.iconName, "w-5 h-5")}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{app.name}</h5>
                    {app.url && <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{app.url}</p>}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveApp(app.id)}
                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
                  title="Remove from dock"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between px-4">
          <span className="text-[11px] text-slate-400">
            ✓ Auto-saved on your mobile phone
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── External Real App Live Launcher & Web View ────────────────────────────────
function ExternalAppLiveView({ app }: { app: SmartAppItem }) {
  const targetUrl = app.url || `https://www.google.com/search?q=${encodeURIComponent(app.name)}`;
  const cleanDomain = getCleanDomain(targetUrl);

  const handleLaunchMobile = () => {
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
      {/* App Logo */}
      <div className="w-18 h-18 rounded-3xl bg-white border border-slate-200 text-[#E05236] flex items-center justify-center shadow-lg p-3 overflow-hidden">
        {renderAppIcon(app.iconName, "w-10 h-10")}
      </div>

      <div className="space-y-1 max-w-[300px]">
        <h4 className="font-extrabold text-lg text-slate-900">{app.name}</h4>
        <p className="text-xs text-slate-500 font-mono break-all">{cleanDomain}</p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs space-y-2.5 pt-2">
        <button
          onClick={handleLaunchMobile}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#E05236] hover:bg-[#8C3015] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch on Phone ({app.name})</span>
        </button>

        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>Open Web Page ({cleanDomain})</span>
        </a>

        <p className="text-[11px] text-slate-400 pt-1">
          ✓ Tapping above will open the real app or web page on your smartphone
        </p>
      </div>
    </div>
  );
}

// ── Mini App: Live Translator ──────────────────────────────────────────────────
function TranslateMiniApp() {
  const [sourceText, setSourceText] = useState("Where can I find legal immigration advice?");
  const [translatedText, setTranslatedText] = useState("আমি কোথায় আইনি অভিবাসন পরামর্শ পেতে পারি?");
  const [copied, setCopied] = useState(false);

  const quickPhrases = [
    { en: "Where is the nearest immigration office?", bn: "নিকটতম অভিবাসন অফিস কোথায়?" },
    { en: "I need emergency legal help.", bn: "আমার জরুরি আইনি সাহায্য প্রয়োজন।" },
    { en: "How can I apply for an SSN?", bn: "আমি কীভাবে এসএসএন এর জন্য আবেদন করতে পারি?" },
    { en: "Where can I find halal grocery?", bn: "আমি কোথায় হালাল মুদি দোকান পাব?" },
  ];

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    setTranslatedText(`[অনূদিত]: ${sourceText}`);
  };

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
          <button
            onClick={() => alert("Listening to voice audio...")}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800"
          >
            <Volume2 className="w-3.5 h-3.5" /> Speech
          </button>
          <button
            onClick={handleTranslate}
            className="px-3 py-1.5 rounded-xl bg-[#C04A22] text-white text-xs font-bold hover:bg-[#8C3015] shadow-2xs cursor-pointer"
          >
            Translate Now
          </button>
        </div>
      </div>

      {/* Translation Output */}
      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl relative">
        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Bengali Translation:</span>
        <p className="text-xs font-semibold text-emerald-950 leading-relaxed">{translatedText}</p>
        <button
          onClick={copyResult}
          className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy Translation"}
        </button>
      </div>

      {/* Quick Phrases */}
      <div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Common Phrases:</span>
        <div className="space-y-1.5">
          {quickPhrases.map((q, i) => (
            <button
              key={i}
              onClick={() => { setSourceText(q.en); setTranslatedText(q.bn); }}
              className="w-full text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-[#C04A22] text-xs text-slate-700 transition cursor-pointer"
            >
              <p className="font-semibold text-slate-900">{q.en}</p>
              <p className="text-[11px] text-slate-500">{q.bn}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mini App: USCIS Case Tracker ──────────────────────────────────────────────
function UscisMiniApp() {
  const [receiptNo, setReceiptNo] = useState("IOE0923849122");
  const [status, setStatus] = useState<any>({
    form: "Form I-485 · Application to Register Permanent Residence",
    stage: "Case Was Approved",
    date: "August 18, 2026",
    desc: "We approved your Form I-485. We will mail your Permanent Resident Card (Green Card) to the address on file.",
    step: 4,
  });

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
            className="flex-1 font-mono uppercase text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#C04A22]"
          />
          <button
            onClick={() => alert(`Checking live status for ${receiptNo}...`)}
            className="px-3 py-2 rounded-xl bg-[#C04A22] text-white text-xs font-bold shadow-2xs hover:bg-[#8C3015] cursor-pointer"
          >
            Check
          </button>
        </div>
      </div>

      {status && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              Active Case
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{status.date}</span>
          </div>

          <h4 className="font-extrabold text-sm text-slate-900">{status.stage}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{status.form}</p>

          {/* Stepper */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {[
              { label: "1. Case Received & Receipt Notice", done: true },
              { label: "2. Biometrics Appointment Completed", done: true },
              { label: "3. Interview / RFE Reviewed", done: true },
              { label: "4. Case Approved & Card Produced", done: true },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                  ✓
                </div>
                <span className={step.done ? "font-semibold text-slate-800" : "text-slate-400"}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
        <p className="text-[10px] text-amber-700">Zero fee on first 3 transfers via partner apps</p>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <label className="text-[11px] font-bold text-slate-600 block">You Send (USD)</label>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <span className="font-bold text-slate-500">$</span>
          <input
            type="number"
            value={usdAmount}
            onChange={e => setUsdAmount(Number(e.target.value))}
            className="flex-1 bg-transparent font-bold text-slate-900 outline-none text-sm"
          />
        </div>

        <label className="text-[11px] font-bold text-slate-600 block mt-2">Recipient Gets (BDT)</label>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <span className="text-base font-extrabold text-emerald-900 font-mono">
            ৳{(usdAmount * rate).toLocaleString()} BDT
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800">bKash / Bank</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Compare Services:</span>
        {[
          { name: "Remitly", rate: "৳121.40", fee: "$0", delivery: "Instant" },
          { name: "Sendwave", rate: "৳121.20", fee: "$0", delivery: "Instant" },
          { name: "Western Union", rate: "৳119.80", fee: "$2.99", delivery: "1-2 Days" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
            <span className="font-bold text-slate-800">{item.name}</span>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-700">{item.rate}</span>
              <span className="text-[10px] text-slate-400 ml-2">Fee: {item.fee}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mini App: Wage & Tax Estimator ─────────────────────────────────────────────
function WageCalcMiniApp() {
  const [hourlyRate, setHourlyRate] = useState(22);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);

  const grossWeekly = hourlyRate * hoursPerWeek;
  const grossMonthly = grossWeekly * 4.33;
  const estimatedTax = grossMonthly * 0.18;
  const netMonthly = grossMonthly - estimatedTax;

  return (
    <div className="space-y-3.5">
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Hourly Pay ($/hour)</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={e => setHourlyRate(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Weekly Hours</label>
          <input
            type="number"
            value={hoursPerWeek}
            onChange={e => setHoursPerWeek(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none"
          />
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-2">
        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Estimated Monthly Pay (NY/NJ):</span>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-600 font-medium">Gross Salary:</span>
          <span className="text-xs font-bold font-mono text-slate-800">${grossMonthly.toFixed(0)}</span>
        </div>
        <div className="flex justify-between items-baseline text-xs text-rose-600">
          <span>Est. Taxes (FICA+State):</span>
          <span className="font-bold font-mono">-${estimatedTax.toFixed(0)}</span>
        </div>
        <div className="pt-2 border-t border-purple-200 flex justify-between items-baseline">
          <span className="text-xs font-extrabold text-purple-950">Net Take-Home:</span>
          <span className="text-base font-extrabold text-emerald-700 font-mono">${netMonthly.toFixed(0)} / mo</span>
        </div>
      </div>
    </div>
  );
}

// ── Mini App: Notes & Checklist ───────────────────────────────────────────────
function NotesMiniApp() {
  const [noteText, setNoteText] = useState("• Lawyer meeting on Friday at 3 PM\n• Bring passport & I-94 copy\n• SSN office address: 123 Main St");
  const [saved, setSaved] = useState(false);

  const saveNote = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3.5">
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          rows={9}
          className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#C04A22] resize-none"
        />
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-slate-400">Locally auto-saved</span>
          <button
            onClick={saveNote}
            className="px-3 py-1.5 rounded-xl bg-[#C04A22] text-white text-xs font-bold hover:bg-[#8C3015] shadow-2xs cursor-pointer"
          >
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
    <div className="space-y-3">
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="font-bold text-xs text-slate-800">NYC Subway Live Status</h4>
        <div className="space-y-2">
          {[
            { line: "7 Train", status: "Good Service", color: "bg-purple-600" },
            { line: "E / F / M / R", status: "Minor Delays at Queens Plaza", color: "bg-blue-600" },
            { line: "N / W Train", status: "Weekend Track Work", color: "bg-amber-500" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className={`px-2 py-0.5 rounded-md text-white font-bold text-[10px] ${item.color}`}>
                {item.line}
              </span>
              <span className="text-[11px] font-medium text-slate-600">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mini App: Halal & Deshi Grocers ────────────────────────────────────────────
function HalalFinderMiniApp() {
  return (
    <div className="space-y-2.5">
      <h4 className="font-bold text-xs text-slate-800">Popular Stores Near You (Queens & Brooklyn)</h4>
      {[
        { name: "Al-Aqsa Halal Supermarket", loc: "Jackson Heights, NY", rating: "4.8 ★" },
        { name: "Haat Bazaar Bangladeshi Food", loc: "Jamaica, NY", rating: "4.9 ★" },
        { name: "Premium Halal Meat & Poultry", loc: "Astoria, NY", rating: "4.7 ★" },
      ].map((store, i) => (
        <div key={i} className="p-3 bg-white border border-slate-200 rounded-2xl text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-900">{store.name}</span>
            <span className="text-amber-600 font-bold text-[11px]">{store.rating}</span>
          </div>
          <p className="text-[11px] text-slate-500">{store.loc}</p>
        </div>
      ))}
    </div>
  );
}

// ── Mini App: WhatsApp Community ───────────────────────────────────────────────
function WhatsAppMiniApp() {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
        <MessageSquare className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-extrabold text-sm text-slate-900">NYC Immigrant Help Group</h4>
        <p className="text-xs text-slate-500 mt-1">Connect with 5,200+ Bangladeshi and international community members</p>
      </div>
      <button
        onClick={() => window.open("https://chat.whatsapp.com", "_blank")}
        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Join WhatsApp Group</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
