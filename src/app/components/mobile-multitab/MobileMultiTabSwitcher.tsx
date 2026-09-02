import React, { useState } from "react";
import { useMobileTabs, FEATURE_REGISTRY, MobileTab } from "../../context/MobileTabContext";
import {
  X, Plus, Trash2, Layers, ExternalLink, Sparkles, Check,
  Compass, Briefcase, Home, Map, Utensils, Scale, Building,
  GraduationCap, HeartHandshake, Clapperboard, ShoppingBag,
  MessageCircle, Users, Bookmark, Settings, HelpCircle, Shield
} from "lucide-react";

const POPULAR_FEATURES = [
  { path: "/feed", title: "Community Feed", icon: Home, color: "bg-blue-500", desc: "Live immigrant updates" },
  { path: "/map", title: "Map & Live Directions", icon: Map, color: "bg-emerald-500", desc: "GPS route & discovery" },
  { path: "/services/jobs", title: "Job Opportunities", icon: Briefcase, color: "bg-purple-500", desc: "Sponsorship & cash jobs" },
  { path: "/services/free-food", title: "Free Food Pantries", icon: Utensils, color: "bg-green-600", desc: "Halal & free meals" },
  { path: "/services/housing", title: "Housing & Rooms", icon: Building, color: "bg-cyan-500", desc: "Sublets & rentals" },
  { path: "/services/legal", title: "Legal & Asylum Aid", icon: Scale, color: "bg-rose-500", desc: "Pro-bono lawyers" },
  { path: "/services/religion", title: "Places of Worship", icon: HeartHandshake, color: "bg-amber-600", desc: "Mosques & temples" },
  { path: "/services/schools", title: "Schools & ESL", icon: GraduationCap, color: "bg-violet-500", desc: "Education & English" },
  { path: "/messages", title: "Messages", icon: MessageCircle, color: "bg-blue-600", desc: "Direct immigrant chats" },
  { path: "/reels", title: "Stories & Reels", icon: Clapperboard, color: "bg-pink-500", desc: "Short video tips" },
  { path: "/orders", title: "My Orders", icon: ShoppingBag, color: "bg-emerald-600", desc: "Marketplace deliveries" },
  { path: "/communities", title: "Communities", icon: Users, color: "bg-indigo-500", desc: "Country diaspora groups" },
];

export function MobileMultiTabSwitcher() {
  const {
    tabs,
    activeTabId,
    isSwitcherOpen,
    setIsSwitcherOpen,
    switchTab,
    closeTab,
    closeAllTabs,
    openTab,
  } = useMobileTabs();

  const [showFeatureCatalog, setShowFeatureCatalog] = useState(false);
  const [closingTabId, setClosingTabId] = useState<string | null>(null);

  if (!isSwitcherOpen) return null;

  const handleCloseSingleTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    setClosingTabId(tabId);
    setTimeout(() => {
      closeTab(tabId);
      setClosingTabId(null);
    }, 200);
  };

  return (
    <div className="lg:hidden fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200 safe-area-pt safe-area-pb">
      {/* ── Top Switcher Header ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Layers className="w-4 h-4 text-[#C04A22]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-tight">Android Multi-Tab Switcher</h2>
            <p className="text-[10px] text-slate-400 font-semibold">{tabs.length} Active {tabs.length === 1 ? "Tab" : "Tabs"} • Swipe left/right anytime</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFeatureCatalog(c => !c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              showFeatureCatalog
                ? "bg-white text-slate-900"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tab</span>
          </button>

          {tabs.length > 1 && (
            <button
              onClick={closeAllTabs}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
              title="Close All Tabs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsSwitcherOpen(false)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition ml-1"
            title="Close Switcher"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Feature Catalog Launcher Drawer (When "New Tab" is clicked) ── */}
      {showFeatureCatalog ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Feature to Open in New Tab:</span>
            <button
              onClick={() => setShowFeatureCatalog(false)}
              className="text-xs text-slate-400 hover:text-white font-semibold underline"
            >
              Back to Open Tabs
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pb-8">
            {POPULAR_FEATURES.map((feat) => {
              const Icon = feat.icon;
              const isAlreadyOpen = tabs.some(t => t.path === feat.path);
              return (
                <button
                  key={feat.path}
                  onClick={() => {
                    openTab(feat.path);
                    setShowFeatureCatalog(false);
                  }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex flex-col gap-2 group active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl ${feat.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isAlreadyOpen && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                        Open
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-[#C04A22] transition">
                      {feat.title}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {feat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Android 3D Recents Horizontal Card Stack ── */
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="text-[11px] text-slate-400 font-semibold px-1 flex items-center justify-between">
            <span>Tap card to open • Swipe left/right on bottom bar to switch</span>
            <span className="text-emerald-400 font-bold">● Running</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-12">
            {tabs.map((tab, idx) => {
              const isActive = tab.id === activeTabId;
              const isClosing = closingTabId === tab.id;

              return (
                <div
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 border text-left group active:scale-[0.98] ${
                    isClosing ? "opacity-0 -translate-y-4 scale-95" : ""
                  } ${
                    isActive
                      ? "bg-slate-900 border-[#C04A22] shadow-2xl shadow-[#C04A22]/20 ring-2 ring-[#C04A22]/40"
                      : "bg-slate-900/80 hover:bg-slate-900 border-white/10 hover:border-white/20 shadow-lg"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{tab.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{tab.title}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium truncate block">
                          {tab.category} • Tab #{idx + 1}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleCloseSingleTab(e, tab.id)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/30 text-slate-400 hover:text-red-300 flex items-center justify-center transition flex-shrink-0"
                      title="Close Tab"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Visual Preview Body */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        immigrantconnect.app{tab.path}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isActive ? "Currently viewing" : "Preserved in background"}
                      </span>

                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                        isActive
                          ? "bg-[#C04A22] text-white shadow-xs"
                          : "bg-white/10 text-slate-300 group-hover:bg-white/20"
                      }`}>
                        <span>{isActive ? "Active" : "Switch"}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom Quick Navigation Hint ── */}
      <div className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span>💡 Tip: Swipe left or right on the bottom home bar to switch tabs instantly!</span>
        <button
          onClick={() => setIsSwitcherOpen(false)}
          className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20"
        >
          Done
        </button>
      </div>
    </div>
  );
}
