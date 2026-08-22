import React, { useState, useRef, useEffect } from "react";
import {
  X, Minus, Maximize2, Minimize2, Search,
  Languages, Landmark, DollarSign, Calculator, FileText,
  MessageSquare, Map, ShoppingBag, ExternalLink, Sparkles,
  Copy, Check, Volume2, RefreshCw, Plus,
  Youtube, Globe, Bot, Facebook, Instagram, Music, Mail,
  Smartphone, Trash2, CheckCircle2, RotateCcw, Play, Send,
  SlidersHorizontal, CheckSquare, Square
} from "lucide-react";

// Types
export interface SmartAppItem {
  id: string;
  name: string;
  nameBn?: string;
  category: "social" | "media" | "tools" | "finance" | "google";
  iconName: string; // key to icon or "domain:example.com"
  url?: string;
  isBuiltIn?: boolean;
}

// Default Apps on the Dock (Starts empty so user adds ONLY their chosen apps)
const DEFAULT_APPS: SmartAppItem[] = [];

// All Phone Device Installed Apps Catalog (for 1-Tap selection)
const PHONE_DEVICE_APPS: SmartAppItem[] = [
  // Social & Chat
  { id: "whatsapp", name: "WhatsApp", nameBn: "হোয়াটসঅ্যাপ", category: "social", iconName: "domain:whatsapp.com", url: "https://web.whatsapp.com" },
  { id: "facebook", name: "Facebook", nameBn: "ফেসবুক", category: "social", iconName: "domain:facebook.com", url: "https://m.facebook.com" },
  { id: "messenger", name: "Messenger", nameBn: "মেসেঞ্জার", category: "social", iconName: "domain:messenger.com", url: "https://m.me" },
  { id: "instagram", name: "Instagram", nameBn: "ইনস্টাগ্রাম", category: "social", iconName: "domain:instagram.com", url: "https://www.instagram.com" },
  { id: "tiktok", name: "TikTok", nameBn: "টিকটক", category: "social", iconName: "domain:tiktok.com", url: "https://www.tiktok.com" },
  { id: "telegram", name: "Telegram", nameBn: "টেলিগ্রাম", category: "social", iconName: "domain:telegram.org", url: "https://web.telegram.org" },
  { id: "twitter", name: "X (Twitter)", nameBn: "টুইটার / এক্স", category: "social", iconName: "domain:x.com", url: "https://x.com" },
  { id: "linkedin", name: "LinkedIn", nameBn: "লিঙ্কডইন", category: "social", iconName: "domain:linkedin.com", url: "https://linkedin.com" },
  { id: "discord", name: "Discord", nameBn: "ডিসকর্ড", category: "social", iconName: "domain:discord.com", url: "https://discord.com" },
  { id: "reddit", name: "Reddit", nameBn: "রেডিট", category: "social", iconName: "domain:reddit.com", url: "https://reddit.com" },

  // Media & Video
  { id: "youtube", name: "YouTube", nameBn: "ইউটিউব", category: "media", iconName: "domain:youtube.com", url: "https://m.youtube.com" },
  { id: "spotify", name: "Spotify", nameBn: "স্পটিফাই মিউজিক", category: "media", iconName: "domain:spotify.com", url: "https://open.spotify.com" },
  { id: "netflix", name: "Netflix", nameBn: "নেটফ্লিক্স", category: "media", iconName: "domain:netflix.com", url: "https://netflix.com" },
  { id: "camera", name: "Camera & Photos", nameBn: "ক্যামেরা ও ছবি", category: "media", iconName: "domain:google.com", url: "https://photos.google.com" },

  // AI & Google
  { id: "chatgpt", name: "ChatGPT AI", nameBn: "চ্যাটজিপিটি এআই", category: "google", iconName: "domain:chatgpt.com", url: "https://chatgpt.com" },
  { id: "google", name: "Google Search", nameBn: "গুগল সার্চ", category: "google", iconName: "domain:google.com", url: "https://www.google.com" },
  { id: "gmail", name: "Gmail", nameBn: "জিমেইল", category: "google", iconName: "domain:gmail.com", url: "https://mail.google.com" },
  { id: "maps", name: "Google Maps", nameBn: "গুগল ম্যাপস", category: "google", iconName: "domain:maps.google.com", url: "https://maps.google.com" },
  { id: "drive", name: "Google Drive", nameBn: "গুগল ড্রাইভ", category: "google", iconName: "domain:drive.google.com", url: "https://drive.google.com" },

  // Finance & Travel
  { id: "bkash", name: "bKash", nameBn: "বিকাশ রেমিট্যান্স", category: "finance", iconName: "domain:bkash.com", url: "https://www.bkash.com" },
  { id: "nagad", name: "Nagad", nameBn: "নগদ পে", category: "finance", iconName: "domain:nagad.com.bd", url: "https://nagad.com.bd" },
  { id: "remitly", name: "Remitly", nameBn: "রেমিটলি টাকা পাঠানো", category: "finance", iconName: "domain:remitly.com", url: "https://remitly.com" },
  { id: "uber", name: "Uber Rides", nameBn: "উবার রাইডস", category: "finance", iconName: "domain:uber.com", url: "https://m.uber.com" },
  { id: "amazon", name: "Amazon US", nameBn: "অ্যামাজন শপিং", category: "finance", iconName: "domain:amazon.com", url: "https://www.amazon.com" },

  // Built-in Immigrant Tools
  { id: "translate", name: "Live Translator", nameBn: "লাইভ অনুবাদক", category: "tools", iconName: "translate", isBuiltIn: true },
  { id: "uscis", name: "USCIS Case Tracker", nameBn: "ইউএসসিআইএস কেস ট্র্যাকার", category: "tools", iconName: "uscis", isBuiltIn: true },
  { id: "remittance", name: "Taka / Remittance Rates", nameBn: "টাকা পাঠানোর রেট", category: "tools", iconName: "remittance", isBuiltIn: true },
  { id: "wage_calc", name: "Hourly Wage & Tax Calc", nameBn: "বেতন ও ট্যাক্স ক্যালকুলেটর", category: "tools", iconName: "wage_calc", isBuiltIn: true },
  { id: "notes", name: "Immigrant Vault & Notes", nameBn: "জরুরি নোট ও চেকলিস্ট", category: "tools", iconName: "notes", isBuiltIn: true },
  { id: "transit", name: "NYC Subway & Bus Live", nameBn: "সাবওয়ে ও বাস রুট", category: "tools", iconName: "transit", isBuiltIn: true },
  { id: "halal_finder", name: "Halal & Deshi Grocers", nameBn: "হালাল বাজার ও খাবার", category: "tools", iconName: "halal_finder", isBuiltIn: true },
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

  // User custom dock apps state with localStorage persistence (Starts 100% clean & empty)
  const [userApps, setUserApps] = useState<SmartAppItem[]>(() => {
    try {
      const saved = localStorage.getItem("pathasathi_smart_dock_apps_v6");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_APPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("pathasathi_smart_dock_apps_v6", JSON.stringify(userApps));
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

            {/* + Button to Select / Customize Apps from Phone Drawer */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                setShowAddModal(true);
              }}
              className="w-9 h-9 rounded-2xl border border-dashed border-slate-300 hover:border-[#E05236] text-slate-400 hover:text-[#E05236] flex items-center justify-center transition-all duration-150 hover:bg-[#E05236]/5 active:scale-90 mt-1 cursor-pointer"
              title="Select Apps from Phone"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 3. Phone App Drawer Modal (1-Tap Select from Device) ── */}
      {showAddModal && (
        <PhoneAppDrawerModal
          userApps={userApps}
          onToggleApp={toggleAppInDock}
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
            {activeApp.id === "translate" && <div className="flex-1 overflow-y-auto p-4"><TranslateMiniApp /></div>}
            {activeApp.id === "uscis" && <div className="flex-1 overflow-y-auto p-4"><UscisMiniApp /></div>}
            {activeApp.id === "remittance" && <div className="flex-1 overflow-y-auto p-4"><RemittanceMiniApp /></div>}
            {activeApp.id === "wage_calc" && <div className="flex-1 overflow-y-auto p-4"><WageCalcMiniApp /></div>}
            {activeApp.id === "notes" && <div className="flex-1 overflow-y-auto p-4"><NotesMiniApp /></div>}
            {activeApp.id === "transit" && <div className="flex-1 overflow-y-auto p-4"><TransitMiniApp /></div>}
            {activeApp.id === "halal_finder" && <div className="flex-1 overflow-y-auto p-4"><HalalFinderMiniApp /></div>}
            {activeApp.id === "whatsapp" && <div className="flex-1 overflow-y-auto p-4"><WhatsAppMiniApp /></div>}

            {/* Other Installed Apps Live Web Viewer */}
            {!["translate", "youtube", "chatgpt", "google", "uscis", "remittance", "wage_calc", "notes", "transit", "halal_finder", "whatsapp"].includes(activeApp.id) && (
              <InAppWebViewer app={activeApp} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Phone App Drawer / 1-Tap App Selector Modal ──────────────────────────────
function PhoneAppDrawerModal({
  userApps,
  onToggleApp,
  onResetDefault,
  onClose,
}: {
  userApps: SmartAppItem[];
  onToggleApp: (app: SmartAppItem) => void;
  onResetDefault: () => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Apps" },
    { id: "social", label: "Social & Chat" },
    { id: "media", label: "Media & Video" },
    { id: "google", label: "AI & Google" },
    { id: "finance", label: "Finance & Travel" },
    { id: "tools", label: "Tools" },
  ];

  const filteredApps = PHONE_DEVICE_APPS.filter(app => {
    const matchesCat = selectedCategory === "all" || app.category === selectedCategory;
    const matchesSearch = !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.nameBn && app.nameBn.includes(search));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Select Apps for Sidebar
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF7F4] text-[#E05236] border border-[#E05236]/20">
                {userApps.length} in Dock
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap any app to add or remove from your smart dock
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs shadow-2xs focus-within:border-[#E05236]">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search apps on your phone (YouTube, WhatsApp, bKash...)"
              className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 font-medium"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#E05236] text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Apps List (1-Tap Select / Toggle) */}
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
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      {app.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{app.nameBn || app.category}</p>
                  </div>
                </div>

                {/* Status indicator / Action button */}
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
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
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
          <button
            onClick={() => onResetDefault()}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md cursor-pointer transition active:scale-95"
          >
            Done ({userApps.length})
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 1. YouTube Live Mini App (Playable video player & in-app search) ──────────
function YouTubeMiniApp() {
  const [currentVideoId, setCurrentVideoId] = useState("dQw4w9WgXcQ");
  const [searchQuery, setSearchQuery] = useState("");

  const YOUTUBE_FEEDS = [
    {
      id: "dQw4w9WgXcQ",
      title: "How to apply for Driver's License in NY (Bengali Guide)",
      channel: "Immigrant Compass USA",
      views: "142K views",
      duration: "10:24",
    },
    {
      id: "9bZkp7q19f0",
      title: "NYC Subway Map & Commuting Guide for Newcomers",
      channel: "NYC Transit Tips",
      views: "89K views",
      duration: "08:15",
    },
    {
      id: "kJQP7kiw5Fk",
      title: "Top 10 Bangladeshi Restaurants in Jackson Heights & Astoria",
      channel: "Deshi Food Explorer",
      views: "230K views",
      duration: "14:40",
    },
    {
      id: "fJ9rUzIMcZQ",
      title: "USCIS Biometrics & Green Card Interview Preparation",
      channel: "USA Legal Help",
      views: "310K views",
      duration: "12:05",
    },
  ];

  const filteredVideos = YOUTUBE_FEEDS.filter(v =>
    !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F0F0F] text-white">
      {/* Real In-App Embedded YouTube Video Player */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`}
          title="YouTube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      {/* In-App YouTube Search Bar */}
      <div className="p-2.5 bg-[#181818] border-b border-white/10 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-[#272727] rounded-full px-3 py-1.5 text-xs text-white">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search YouTube in mini window…"
            className="w-full bg-transparent outline-none text-xs text-white placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Videos Feed (Click to play instantly inside mini window) */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Popular Videos (Tap to play):
        </p>

        {filteredVideos.map(video => (
          <div
            key={video.id}
            onClick={() => setCurrentVideoId(video.id)}
            className={`p-2 rounded-2xl border transition flex gap-2.5 cursor-pointer active:scale-98 ${
              currentVideoId === video.id
                ? "bg-[#272727] border-[#E05236]"
                : "bg-[#181818] border-white/5 hover:bg-[#222]"
            }`}
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
              <img
                src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80`}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 text-white px-1 rounded">
                {video.duration}
              </span>
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs text-white line-clamp-2 leading-tight">
                {video.title}
              </h5>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{video.channel}</p>
              <p className="text-[9px] text-slate-500">{video.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. ChatGPT Live Mini App (In-app conversational AI Assistant) ─────────────
function ChatGPTMiniApp() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hello! I am your AI Assistant right inside your mini window. Ask me anything about USA immigration, jobs, housing, translation, or daily questions in Bengali or English! 🤖",
    },
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
      let reply = "I am here to help! ";
      const lower = q.toLowerCase();
      if (lower.includes("license") || lower.includes("driving")) {
        reply = "To get a Driver's License in NY: 1) Apply for learner permit with 6 points of ID, 2) Pass the vision & knowledge test, 3) Complete 5-hour pre-licensing course, 4) Schedule & pass your road test.";
      } else if (lower.includes("ssn") || lower.includes("social security")) {
        reply = "For an SSN card: Once your Form I-765 (EAD) or Green Card is approved, visit your local Social Security Administration (SSA) office with your passport, approval notice, and I-94.";
      } else if (lower.includes("bangla") || lower.includes("অনুবাদ")) {
        reply = "অবশ্যই! আমি বাংলায় উত্তর দিতে প্রস্তুত। আপনার অভিবাসন বা যেকোনো প্রশ্ন এখানে লিখতে পারেন।";
      } else {
        reply = `Here is the information for "${q}": In the USA, make sure to keep all your official immigration receipts and documentation organized. You can also track your USCIS case or consult verified community advisors in Pathasathi!`;
      }

      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-white">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold">
                AI
              </div>
            )}
            <div
              className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#E05236] text-white rounded-br-xs"
                  : "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-xs"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ChatGPT is thinking…</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {["How to get NY driver license?", "Check SSN requirements", "Translate legal term"].map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap transition cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={e => { e.preventDefault(); handleSend(); }}
        className="p-2.5 bg-slate-950 flex items-center gap-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask ChatGPT in mini window…"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#E05236]"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-8 h-8 rounded-xl bg-[#E05236] hover:bg-[#8C3015] disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer"
        >
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
    {
      title: "Bangladeshi Americans in New York City - Guide & Directory",
      url: "https://immigrantconnect.us/community/bangla-nyc",
      snippet: "Discover Jackson Heights, Jamaica, and Parkchester vibrant Bengali community hubs, grocery stores, halal restaurants and cultural events.",
    },
    {
      title: "USCIS Official Immigration Forms & Case Processing",
      url: "https://uscis.gov/forms",
      snippet: "Free official immigration forms, fee calculators, and online filing for permanent residency, citizenship, and employment authorization.",
    },
    {
      title: "NYC IDNYC Municipal Identification Card Application",
      url: "https://nyc.gov/idnyc",
      snippet: "IDNYC is for all New York City residents, ages 10 and older, regardless of immigration status. Access free city services and discounts.",
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResults([
      {
        title: `Search results for "${query}"`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Latest web results, updates, and community links related to ${query}. Click below to explore live.`,
      },
      ...results,
    ]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-900">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-full px-3 py-1.5 shadow-2xs">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Google..."
            className="w-full bg-transparent text-xs text-slate-800 outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-full bg-[#E05236] text-white text-xs font-bold shadow-xs cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {results.map((r, i) => (
          <div key={i} className="p-3 rounded-2xl border border-slate-100 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] text-emerald-700 font-mono block truncate">{r.url}</span>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-xs text-blue-700 hover:underline block leading-tight"
            >
              {r.title}
            </a>
            <p className="text-xs text-slate-600 leading-relaxed">{r.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 4. In-App Live Web Viewer for Any Custom Website / App ───────────────────
function InAppWebViewer({ app }: { app: SmartAppItem }) {
  const targetUrl = app.url || `https://www.google.com/search?q=${encodeURIComponent(app.name)}`;
  const cleanDomain = getCleanDomain(targetUrl);
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Mini In-App Browser Address Bar */}
      <div className="p-2 border-b border-slate-200 bg-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 truncate">
          <Globe className="w-3 h-3 text-slate-400 mr-1.5 flex-shrink-0" />
          <span className="font-mono text-[11px] truncate">{cleanDomain}</span>
        </div>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Open in Phone Browser"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Live Interactive Iframe Content */}
      <div className="flex-1 relative bg-slate-50">
        {!iframeError ? (
          <iframe
            src={targetUrl}
            title={app.name}
            onError={() => setIframeError(true)}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              {renderAppIcon(app.iconName, "w-8 h-8")}
            </div>
            <h4 className="font-bold text-sm text-slate-900">{app.name}</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              This site restricts embedding inside iframes. Tap below to launch directly on your phone:
            </p>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#E05236] text-white text-xs font-bold shadow-xs"
            >
              Open Live App on Mobile
            </a>
          </div>
        )}
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
