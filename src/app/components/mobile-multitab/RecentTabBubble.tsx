import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router";
import { useMobileTabs, getTaskMeta } from "../../context/MobileTabContext";
import { Check, Plus, Layers, X, ExternalLink, Trash2 } from "lucide-react";

export function RecentTabBubble() {
  const location = useLocation();
  const {
    tasks,
    isCurrentPageInRecents,
    addPageToRecents,
    removePageFromRecents,
    setIsRecentsOpen,
    activeTaskToast,
  } = useMobileTabs();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Hide on public/onboarding routes
  const hiddenPaths = ["/", "/landing", "/login", "/signup", "/verify-email"];
  const isHidden =
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/onboarding");

  if (isHidden) return null;

  const isFeed = location.pathname === "/feed";
  const currentMeta = getTaskMeta(location.pathname);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addPageToRecents();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removePageFromRecents();
    setIsMenuOpen(false);
  };

  const handleOpenDeck = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRecentsOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* ── Universal Floating Toast Alert ── */}
      {activeTaskToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999999] bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{activeTaskToast}</span>
        </div>
      )}

      {/* ── Floating Bubble Container (Stacked directly above Pathasathi Doll) ── */}
      <div
        ref={menuRef}
        className={`fixed z-40 pointer-events-auto transition-all duration-300 flex flex-col items-end ${
          isFeed
            ? "bottom-[160px] right-4 sm:right-6 xl:right-[340px]"
            : "bottom-[148px] sm:bottom-[78px] right-4 sm:right-6"
        }`}
      >
        {/* ── Active Page Options Popover ── */}
        {isMenuOpen && isCurrentPageInRecents && (
          <div className="mb-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-2.5 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 text-slate-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">{currentMeta.icon}</span>
                <span className="text-[11px] font-bold truncate max-w-[130px]">
                  {currentMeta.title}
                </span>
              </div>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                Saved
              </span>
            </div>

            <button
              onClick={handleOpenDeck}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#C04A22]" />
                <span>Open Recents ({tasks.length})</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={handleRemove}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Recents</span>
            </button>
          </div>
        )}

        {/* ── The Recent Tab Bubble Pill ── */}
        {!isCurrentPageInRecents ? (
          // State A: NOT in recents -> Click to Add
          <button
            onClick={handleAdd}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 hover:border-orange-300 shadow-md hover:shadow-xl text-slate-700 hover:text-[#C04A22] active:scale-95 transition-all cursor-pointer select-none ${
              justAdded ? "scale-105 ring-2 ring-emerald-400" : ""
            }`}
            title="Add this page to Recent Tabs"
          >
            <span className="text-[11px] font-bold tracking-tight">
              + Recent
            </span>

            {/* Total recent tabs count */}
            {tasks.length > 0 && (
              <span className="text-[10px] font-bold text-slate-500">
                {tasks.length}
              </span>
            )}
          </button>
        ) : (
          // State B: ALREADY in recents -> Clean Pill (No background, No left icon)
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 hover:border-emerald-500 shadow-md text-slate-800 active:scale-95 transition-all select-none ${
              justAdded ? "ring-2 ring-emerald-400" : ""
            }`}
          >
            {/* Click to open menu / recents */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-slate-800 hover:text-emerald-700 transition cursor-pointer"
              title="Page saved in Recents. Click for options"
            >
              <span className="text-[11px] font-bold tracking-tight text-emerald-700">
                In Recents
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {tasks.length}
              </span>
            </button>

            {/* Quick 1-tap Remove button */}
            <button
              onClick={handleRemove}
              className="w-4 h-4 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition cursor-pointer"
              title="Remove from Recent Tabs"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
