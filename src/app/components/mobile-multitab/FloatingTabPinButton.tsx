import React, { useState } from "react";
import { useLocation } from "react-router";
import { useMobileTabs } from "../../context/MobileTabContext";
import { Plus, Check, Layers, Sparkles } from "lucide-react";

export function FloatingTabPinButton() {
  const location = useLocation();
  const { isRecentsOpen, isCurrentPageInRecents, addPageToRecents, togglePageInRecents } = useMobileTabs();
  const [clickedEffect, setClickedEffect] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Exclude pages that shouldn't be added to tabs
  const path = location.pathname;
  if (
    isRecentsOpen ||
    path === "/" ||
    path === "/landing" ||
    path === "/login" ||
    path === "/signup" ||
    path.startsWith("/onboarding") ||
    path === "/verify-email"
  ) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClickedEffect(true);
    setTimeout(() => setClickedEffect(false), 600);
    togglePageInRecents();
  };

  return (
    <div
      className="fixed top-0 right-0 z-50 select-none group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* ── Hover / Tap Tooltip ── */}
      <div
        className={`absolute right-full mr-2 top-3 px-2 py-0.5 rounded-lg bg-slate-900/90 text-white text-[10px] font-semibold backdrop-blur-md shadow-lg border border-white/15 whitespace-nowrap transition-all duration-200 pointer-events-none flex items-center gap-1 ${
          showTooltip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}
      >
        {isCurrentPageInRecents ? (
          <>
            <Check className="w-2.5 h-2.5 text-emerald-400" />
            <span>Saved in Tab</span>
          </>
        ) : (
          <>
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-spin" />
            <span>Add to Tab</span>
          </>
        )}
      </div>

      {/* ── Corner Notch Button (+ icon with color on left and bottom half, no animation) ── */}
      <button
        onClick={handleClick}
        aria-label={isCurrentPageInRecents ? "Page saved in Tab" : "Add current page to Tab"}
        className={`relative w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-bl-xl rounded-tl-none rounded-tr-none rounded-br-none flex items-center justify-center pl-0.5 pb-0.5 transition-all duration-300 cursor-pointer active:scale-90 border-b border-l ${
          clickedEffect ? "scale-115" : "hover:scale-110"
        } ${
          isCurrentPageInRecents
            ? "border-emerald-500/60 bg-gradient-to-tr from-emerald-500/25 via-emerald-500/10 to-transparent"
            : "border-[#C04A22]/60 bg-gradient-to-tr from-[#C04A22]/30 via-[#C04A22]/10 to-transparent"
        }`}
      >
        {/* Crisp + Icon / Checkmark */}
        <div className="relative flex items-center justify-center z-10">
          {isCurrentPageInRecents ? (
            <Check className="w-3 h-3 stroke-[3] text-emerald-600 animate-in zoom-in-75 duration-200" />
          ) : (
            <Plus className="w-3 h-3 stroke-[3] text-[#C04A22]" />
          )}
        </div>
      </button>
    </div>
  );
}
