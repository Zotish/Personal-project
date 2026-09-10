import React, { useState } from "react";
import { useLocation } from "react-router";
import { useMobileTabs } from "../../context/MobileTabContext";
import { Check, Plus, X } from "lucide-react";

export function RecentTabBubble() {
  const location = useLocation();
  const {
    tasks,
    isCurrentPageInRecents,
    addPageToRecents,
    removePageFromRecents,
    activeTaskToast,
  } = useMobileTabs();

  const [justAdded, setJustAdded] = useState(false);

  // Hide on public/onboarding routes
  const hiddenPaths = ["/", "/landing", "/login", "/signup", "/verify-email"];
  const isHidden =
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/onboarding");

  if (isHidden) return null;

  const isFeed = location.pathname === "/feed";

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPageInRecents) {
      removePageFromRecents();
    } else {
      addPageToRecents();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 900);
    }
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

      {/* ── Floating Plus Bubble Button (Stacked directly above Pathasathi Doll) ── */}
      <div
        className={`fixed z-40 pointer-events-auto transition-all duration-300 ${
          isFeed
            ? "bottom-[160px] right-4 sm:right-6 xl:right-[340px]"
            : "bottom-[148px] sm:bottom-[78px] right-4 sm:right-6"
        }`}
      >
        <button
          onClick={handleToggle}
          className={`relative w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none group ${
            isCurrentPageInRecents
              ? "border border-emerald-500 hover:border-red-400 text-emerald-600 hover:text-red-500"
              : "border border-slate-200/90 hover:border-orange-400 text-slate-700 hover:text-[#C04A22]"
          } ${justAdded ? "ring-2 ring-emerald-400 scale-105" : ""}`}
          title={isCurrentPageInRecents ? "Saved in Recents (Click to remove)" : "Add to Recent Tabs"}
        >
          {isCurrentPageInRecents ? (
            <>
              <span className="group-hover:hidden">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <span className="hidden group-hover:block">
                <X className="w-4 h-4 stroke-[2.5]" />
              </span>
            </>
          ) : (
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
          )}

          {/* Small tab count badge if any tabs are saved */}
          {tasks.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C04A22] text-white text-[9px] font-black flex items-center justify-center shadow-xs leading-none pointer-events-none">
              {tasks.length}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
